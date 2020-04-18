'use strict';


const sessionKey = 'ODS_search_target';
const nada = "No delivery windows available";
const nada2 = "No available delivery times";
const happiness = "Delivery Window";
const sessionHasEnded = "Sign into your Target account";


function search (root) {
    if (document.getElementById('login'))
        notify(SESSION_END, TARGET);

    const nodes = root.getElementsByTagName("H3");
    for (let i = 0; i < nodes.length; i++) {
        if (noDeliveryAvailable(nodes.item(i)))
            return notify(BUSY, TARGET);
        if (deliveryAvailable(nodes.item(i)))
            return notify(OPEN, TARGET);
    }
}
