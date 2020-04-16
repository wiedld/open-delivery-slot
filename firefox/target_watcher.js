'use strict';


const nada = "No delivery windows available";
const nada2 = "No available delivery times";
const happiness = "Delivery Window";
const sessionHasEnded = "Sign into your Target account";

function noDeliveryAvailable (node) {
    return node.textContent === nada || node.textContent === nada2;
}

function deliveryAvailable (node) {
    return node.textContent === happiness || node.innerHTML === happiness;
}

function sessionEnded (node) {
    return node.textContent === sessionHasEnded || node.innerHTML === sessionHasEnded;
}


function search (root) {
    if (document.getElementById('login'))
        notify(TARGET_SESSION_END);

    const nodes = root.getElementsByTagName("H3");
    for (let i = 0; i < nodes.length; i++) {
        if (noDeliveryAvailable(nodes.item(i)))
            return notify(TARGET_BUSY_MSG);
        if (deliveryAvailable(nodes.item(i)))
            return notify(TARGET_OPEN_MSG);
    }
}
search(document.body);


const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            search(mutation.addedNodes[i]);
        }
      }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
