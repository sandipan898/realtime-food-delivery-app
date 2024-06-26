require('dotenv').config();
const express = require('express')
const app = express()
const ejs = require('ejs');
const expressLayout = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');
const MongoDbStore = require('connect-mongo');
const passport = require('passport');
const Emitter = require('events')

// Database connection
const url = process.env.MONGO_CONNECTION_URL
mongoose
    .connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Database connected...');
    }).catch(error => {
        console.log('Database connection failed...');
    });
const connection = mongoose.connection;

// Port
const PORT = process.env.PORT || 3300

// Session Store
// let mongoStore = new MongoDbStore({
//     mongooseConnection: connection,
//     collection: 'sessions'
// })
let mongoStore = {
    mongooseConnection: connection,
    mongoUrl: url,
    collection: 'sessions'
}

// Session Config
app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create(mongoStore),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
}));

// Event emitter
const eventEmitter = new Emitter();
app.set('eventEmitter', eventEmitter)

// Passport config
const passportinit = require('./app/config/passport');
passportinit(passport)
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use(express.json())

app.use(express.urlencoded({ extended: false }))

// Global middlewares
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})

// Assets
app.use(express.static('public'))

// Set template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'));
app.set('view engine', 'ejs')

// Routes
require('./routes/web')(app);
app.use((req, res) => {
    res.status(404).render('errors/404.ejs')
})

const server = app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})

const io = require('socket.io')(server)
io.on('connection', (socket) => {
    // Join
    socket.on('join', (orderId) => {
        socket.join(orderId)
    })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
})
