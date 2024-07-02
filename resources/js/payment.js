import { loadStripe } from "@stripe/stripe-js";
import { postOrder } from "./api";
import { CardWidget } from "./CardWidget";

export async function initPayment() {
    const stripe = await loadStripe('pk_test_51GvS3ICXDwJn1WtMaVy1V7FR2RWJuEsy35VlL0w5WYCSoLgj6QQilvFUNZqTY1rbDxUrwg7odmGvVFOJT6VYZPf000LmYwlXPG');

    let card = new CardWidget(stripe);

    const paymentType = document.getElementById('paymentType')
    paymentType && paymentType.addEventListener('change', (e) => {
        // card = new CardWidget(stripe);
        if(e.target.value === 'card') {
            // Display widget
            card.mount()
        } else {
            // as it is
            card && card.destroy();
        }
    })

    // Stripe
    // Ajax call
    const paymentForm = document.getElementById('payment-form')
    paymentForm && paymentForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        let formData = new FormData(paymentForm);
        let formObject = {}
        for(let [key, value] of formData.entries()) {
            formObject[key] = value
        }

        // verify card
        if(!card) {
            // Ajax
            postOrder(formObject)
            return
        } else {
            const token = await card.createToken();
            formObject.stripeToken = token.id;
            postOrder(formObject);
        }
    })   
}