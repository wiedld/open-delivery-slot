'use strict';


function notify (msg) {
    if (Notification.permission !== "granted")
        return;

    browser.runtime.sendMessage(msg);
}
exportFunction(notify, window, { defineAs: 'notify' });

const messenger = {
    notify: function (msg) {
      browser.runtime.sendMessage({ msg });
    }
  };
window.wrappedJSObject.messenger = cloneInto(messenger, window, {cloneFunctions: true});


const nada = "No delivery windows available";
const happiness = "Delivery Window";
const sessionHasEnded = "Sign into your Target account";

function noDeliveryAvailable (node) {
    return node.textContent === nada || node.innerHTML === nada;
}

function deliveryAvailable (node) {
    return node.textContent === happiness || node.innerHTML === happiness;
}

function sessionEnded (node) {
    return node.textContent === sessionHasEnded || node.innerHTML === sessionHasEnded;
}


function search (root) {
    if (document.getElementById('login'))
        notify({msg: TARGET_SESSION_END});

    const nodes = root.getElementsByTagName("H3");
    for (let i = 0; i < nodes.length; i++) {
        if (noDeliveryAvailable(nodes.item(i)))
            return notify({ msg: TARGET_BUSY_MSG });
        if (deliveryAvailable(nodes.item(i)))
            return notify({ msg: TARGET_OPEN_MSG });
    }
}
search(document.body);


// @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver.
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

function requestPermissions () {
    if (!("Notification" in window))
        return alert(`${NOTIFICATION_HEADING}\nThis browser does not support desktop notifications.\nWatcher is inactive.`);

    Notification.requestPermission().then(function (permission) {
        // FIXME: stackoverflow said we need to store user entered permission, for chrome addon. true?
        // Notification.permission = permission;
    });
}

window.addEventListener("mouseover", () => {
    if (Notification.permission !== "default")
        return;

    if (confirm(`${NOTIFICATION_HEADING}\nWe require notifications, in order to tell you when a delivery slot has opened.`))
        requestPermissions();
});
e