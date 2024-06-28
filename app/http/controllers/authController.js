const User = require('../../models/user');
const bcrypt = require('bcrypt');
const passport = require('passport');

function authController() {
    const _getRedirectUrl = (req) => {
        return req.user.role === 'admin' ? '/admin/orders' : '/orders'
    }

    const mergeCarts = (guestCart, userCart) => {
        if (!userCart.items) {
            userCart.items = {};
        }
    
        for (const [id, item] of Object.entries(guestCart.items)) {
            if (userCart.items[id]) {
                userCart.items[id].qty += item.qty;
            } else {
                userCart.items[id] = item;
            }
        }
    
        userCart.totalQty = (userCart.totalQty || 0) + guestCart.totalQty;
        userCart.totalPrice = (userCart.totalPrice || 0) + guestCart.totalPrice;
    
        return userCart;
    }

    return {
        login(req, res) {
            res.render('auth/login')
        },

        postLogin(req, res, next) {
            const { email, password } = req.body;
            // validation
            if(!email || !password) {
                req.flash('error', 'All fields are required!')
                return res.redirect('/login')
            }

            const guestCart = req.session.cart;
            
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message)
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message)
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message)
                        return next(err)
                    }
                    if (guestCart) {
                        req.session.cart = mergeCarts(guestCart, req.session.cart || {});
                    }
                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },

        register(req, res) {
            res.render('auth/register')
        },

        async postRegister(req, res) {
            const { name, email, password } = req.body;
            // validation
            if(!name || !email || !password) {
                req.flash('error', 'All fields are required!')
                req.flash('name', name)
                req.flash('email', email)
                return res.redirect('/register')
            }

            // Check if email exists
            User.exists({ email: email }).then((result) => {
                if(result) {
                    req.flash('error', 'Email already taken!')
                    req.flash('name', name)
                    req.flash('email', email)
                    return res.redirect('/register')
                }
            })

            const hashedPassword = await bcrypt.hash(password, 10);
            // Create user
            const user = new User({
                name, 
                email,
                password: hashedPassword
            })

            user.save().then(user => {
                // Login
                // Merge guest cart with user cart after registration
                const guestCart = req.session.cart;
                if (guestCart) {
                    req.session.cart = mergeCarts(guestCart, req.session.cart || {});
                }
                return res.redirect('/')
            }).catch(err => {
                req.flash('error', 'Something went wrong!')
                return res.redirect('/register')
            })
        },
        logout(req, res, next) {
            req.logout((err) => {
                if (err) { 
                    return next(err); 
                }
                return res.redirect('/login')
            })
        }
    }
} 

module.exports = authController;
