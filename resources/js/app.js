import axios from "axios";
import Noty from "noty";

let addToCart = document.querySelectorAll('.add-to-cart')
let cartCounter = document.querySelector('#cartCounter')

const updateCart = (pizza) => {
    axios.post('/update-cart', pizza)
        .then(res => {
            cartCounter.innerText = res.data.totalQty
            new Noty({
                type: 'success',
                timeout: 1000,
                progressBar: false,
                text: "Item added to cart!",
                // layout: 'topCenter'
              }).show();
        }).catch(error => {
            new Noty({
                type: 'error',
                timeout: 1000,
                progressBar: false,
                text: "Something went wrong!",
                // layout: 'topCenter'
              }).show();
        })
}

addToCart.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        let pizza = JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
        console.log(pizza);
    })
})