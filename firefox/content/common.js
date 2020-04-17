function requestPermissions ({url, notValid}) {
    if (!("Notification" in window))
        return alert(`${NOTIFICATION_HEADING}\nThis browser does not support desktop notifications.\nWatcher is inactive.`);

    if (notValid)
        return alert(`${NOTIFICATION_HEADING}\n${url} is not supported.`);

    Notification.requestPermission().then(function (permission) {
        // FIXME: stackoverflow said we need to store user entered permission, for chrome addon. true?
        // Notification.permission = permission;
    });
}

browser.runtime.onMessage.addListener(msg => {
    console.log(msg)
    switch (msg.action) {
        case PERMISSIONS:
            return requestPermissions(msg);
        case ACTIVATE_SEARCH:
        {
            sessionStorage.setItem(sessionKey, 'true');
            return activateSearch();
        }  
        default:
            return;
    }
});


function notify (action, site) {
    if (Notification.permission !== "granted")
        return;

    console.log(action);
    browser.runtime.sendMessage({ action, site });
}
exportFunction(notify, window, { defineAs: 'notify' });

const messenger = {
    notify: function (payload) {
        browser.runtime.sendMessage(payload);
    }
};
window.wrappedJSObject.messenger = cloneInto(messenger, window, {cloneFunctions: true});

