'use strict';

const sessionKey = 'ODS_search_target';
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
    console.log("SEARCH");
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

const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes && mutation.addedNodes.length > 0) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
            search(mutation.addedNodes[i]);
        }
      }
    });
});

function activateSearch () {
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    search(document.body);
}

(function () {
    if (sessionStorage.getItem(sessionKey) == "true")
        activateSearch();
})();

console.log("CONTENT SCRIPT IS LOADED");
