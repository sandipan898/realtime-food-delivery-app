const Menu = require("../../models/menu");

function homeController() {
    return {
        async index(req, res) {
            // Menu.find().then((pizzas) => {})

            const pizzas = await Menu.find();
            res.render('home', { pizzas })
        }
    }
} 

module.exports = homeController;
