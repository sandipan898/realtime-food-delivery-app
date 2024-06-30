import axios from "axios";
import Noty from "noty";

export function postOrder(formObject) {
    axios.post('/orders', formObject)
        .then((res) => {
            new Noty({
                type: 'success',
                timeout: 1000,
                progressBar: false,
                text: res.data.message,
            }).show();

            setTimeout(() => {
                window.location.href = '/orders'
            }, 1000);
        }).catch((err) => {
            console.log("err", err);
            new Noty({
                type: 'success',
                timeout: 1000,
                progressBar: false,
                text: err?.data.message,
            }).show();
        })
}