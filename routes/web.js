const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const orderController = require('../app/http/controllers/customers/orderController');
const homeController = require('../app/http/controllers/homeController');

const adminOrderController = require('../app/http/controllers/admin/orderController');

// Middlewares
const guest = require('../app/http/middlewares/guest');
const auth = require('../app/http/middlewares/auth');
const admin = require('../app/http/middlewares/admin');

function initRoutes(app) {
    // Auth
    app.get('/', homeController().index)
    app.get('/login', guest, authController().login)
    app.post('/login',authController().postLogin)
    app.get('/register', guest, authController().register)
    app.post('/register',authController().postRegister)
    app.post('/logout',authController().logout)
    
    // Cart
    app.get('/cart',cartController().index)
    app.post('/update-cart', cartController().update)

    // Order
    app.post('/orders', auth, orderController().store)
    app.get('/orders', auth, orderController().index)

    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index)
    
}

module.exports = initRoutes;