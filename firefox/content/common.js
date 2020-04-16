function requestPermissions (url) {
    if (!("Notification" in window))
        return alert(`${NOTIFICATION_HEADING}\nThis browser does not support desktop notifications.\nWatcher is inactive.`);

    if (/www.target.com/g.test(url))
        Notification.requestPermission().then(function (permission) {
            // FIXME: stackoverflow said we need to store user entered permission, for chrome addon. true?
            // Notification.permission = permission;
        });
    else
        return alert(`${NOTIFICATION_HEADING}\n${url} is not supported.`);

}

browser.runtime.onMessage.addListener(msg => {
    console.log(msg.action)
    switch (msg.action) {
        case PERMISSIONS:
            return requestPermissions(msg.url);
        case ACTIVATE_SEARCH:
        {
            sessionStorage.setItem('ODS_search', 'true');
            return activateSearch();
        }  
        default:
            return;
    }
});


function notify (action) {
    if (Notification.permission !== "granted")
        return;

    console.log(action);
    browser.runtime.sendMessage({ action });
}
exportFunction(notify, window, { defineAs: 'notify' });

const messenger = {
    notify: function (payload) {
        browser.runtime.sendMessage(payload);
    }
};
window.wrappedJSObject.messenger = cloneInto(messenger, window, {cloneFunctions: true});
