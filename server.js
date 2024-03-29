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

// Database connection
const url = 'mongodb+srv://sandipan:pass123@cluster0.4isjnwc.mongodb.net/food_delivery?retryWrites=true&w=majority'
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

app.use(flash())

app.use(express.json())

app.use((req, res, next) => {
    res.locals.session = req.session
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


app.listen(PORT, () => {
    console.log(`Server running on PORT: ${PORT}`);
})