const TARGET_BUSY = "target_busy";
const TARGET_OPEN = "target_open";
const TARGET_SESSION_END = "target_session_ended";

const NOTIFICATION_HEADING = "Message from OPEN DELIVERY SLOT:";
const PERMISSIONS = "PERMISSIONS";
const RELOAD_TAB = "RELOAD_TAB";
const START = "START";


function requestPermissions (url) {
    if (!("Notification" in window))
        return alert(`${NOTIFICATION_HEADING}\nThis browser does not support desktop notifications.\nWatcher is inactive.`);

    if (/www.target.com/g.test(url))
        Notification.requestPermission().then(function (permission) {
            // FIXME: stackoverflow said we need to store user entered permission, for chrome addon. true?
            // Notification.permission = permission;

            // FIXME: this callback is not waiting until afterwards.
            // console.log("permission", permission);
            if (permission === "granted") {
                // console.log("HEREAS")
                notify("", RELOAD_TAB);
            }
        });
    else
        return alert(`${NOTIFICATION_HEADING}\n${url} is not yet supported.`);

}

browser.runtime.onMessage.addListener(msg => {
    console.log(msg.action)
    switch (msg.action) {
        case PERMISSIONS:
            return requestPermissions(msg.url);
        case START:
            return search(document.body);
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

