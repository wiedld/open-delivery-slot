'use strict';


function noDeliveryAvailable (node) {
    return node.textContent === nada || node.textContent === nada2;
}

function deliveryAvailable (node) {
    return node.textContent === happiness || node.innerHTML === happiness;
}

function sessionEnded (node) {
    return node.textContent === sessionHasEnded || node.innerHTML === sessionHasEnded;
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
