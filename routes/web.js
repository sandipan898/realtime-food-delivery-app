const authController = require('../app/http/controllers/authController');
const cartController = require('../app/http/controllers/customers/cartController');
const orderController = require('../app/http/controllers/customers/orderController');
const homeController = require('../app/http/controllers/homeController');

const adminOrderController = require('../app/http/controllers/admin/orderController');
const statusController = require('../app/http/controllers/admin/statusController');

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
    app.get('/orders/:id', auth, orderController().show)

    // Admin routes
    app.get('/admin/orders', admin, adminOrderController().index)
    app.post('/admin/order/status', admin, statusController().update)
}

module.exports = initRoutes;