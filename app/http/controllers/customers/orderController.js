const Order = require("../../../models/order");
const moment = require("moment");
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY);

function orderController() {
    return {
        store(req, res) {
            // Validate request
            const { phone, address, paymentType, stripeToken } = req.body;
            if(!phone || !address) {
                return res.status(422).json({message: 'Phone or address missing!'})
            }

            // Create order
            const order = new Order({
                customerId: req.user._id,
                items: req.session.cart?.items,
                phone,
                address
            })
            order.save().then(result => {
                Order.populate(result, {path: 'customerId'}).then(placedOrder => {
                    // req.flash('success', 'Order placed successfully!')

                    // Stripe payment
                    if(paymentType === 'card') {
                        console.log('Starting stripe payment');
                        stripe.charges.create({
                            amount: req.session.cart.totalPrice * 100,
                            source: stripeToken,
                            currency: 'inr',
                            description: `Pizza order ${placedOrder._id}`
                        }).then((r) => {
                            console.log('Stripe charge response:', r.status);
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            placedOrder.save().then(ord => {
                                // Emit event
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced', ord)
                                return res.json({message: 'Payment Successful,Order placed successfully!'})
                            }).catch(err => {
                                console.log(err);
                            })
                        }).catch((err) => {
                            return res.json({message: 'Order placed but Payment Failed, You can still pay in COD mode!'})
                        })
                    } else {
                        return res.json({message: 'Order placed successfully with Payment mode COD!'})
                    }
                    
                    delete req.session.cart
                })
            }).catch(err => {
                return res.json({message: 'Something went wrong!'})
            })
        },
        async index(req, res) {
            const orders = await Order.find(
                { customerId: req.user._id },
                null,
                { sort: { 'createdAt': -1 }}
            )
            res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-state=0, post-check=0, pre-check=0')
            res.render('customers/orders', { orders, moment })
        },
        async show(req, res) {
            const order = await Order.findById(req.params.id)
            // Authorize user
            if(req.user._id.toString() === order.customerId.toString()) {
                return res.render('customers/singleOrder', { order })
            }
            return res.redirect('/')
        }
    }
}

module.exports = orderController