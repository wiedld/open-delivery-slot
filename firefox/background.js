"use strict";


function delayedReload (tabId) {
    setTimeout(() => browser.tabs.reload(tabId), 30*60*4);
    // setTimeout(() => browser.tabs.reload(tabId), 1000*60*4);
}

async function getActiveTab() {
    let tabArray = await browser.tabs.query({currentWindow: true, active: true});
    return tabArray[0];
}

function handleMessage (msg, tabId) {
    if (msg === TARGET_BUSY_MSG) {
        delayedReload(tabId);
        return "Target has no open delivery windows.\nWe will notify you when this changes.";
    }
    else if (msg === TARGET_OPEN_MSG)
        return "Target has an open delivery windows.";
    else if (msg === TARGET_SESSION_END)
        return "Your Target session has ended. Please log in again.";
};

browser.runtime.onMessage.addListener(({msg, action}) => {
    getActiveTab()
        .then(({id}) => {
            switch (action) {
                case NOTIFY:
                    return browser.notifications.create(`${id}`, {
                        type: "basic",
                        title: `${NOTIFICATION_HEADING}`,
                        message: handleMessage(msg, id)
                    });
                case RELOAD_TAB:
                    return browser.tabs.reload(id);
                default:
                    return;
            }
        });
});


browser.browserAction.onClicked.addListener(() => {
    getActiveTab().then(({id,url}) => browser.tabs.sendMessage(id, {action: PERMISSIONS, url }));
});

browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
    if (temporary) return; // skip during development
    switch (reason) {
        case "install":
        case "update":
        {
            const url = browser.runtime.getURL("views/installed.html");
            await browser.tabs.create({ url });
        }
        break;
    }
  });


/*
FIXME/TODO:
- examine http request response instead?
    https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/webRequest

- how stop from re-trigger each time we check (and still not open)?

- 

- get to work: instacart, amazon fresh
- code cleanup
- https://developer.walmart.com/#/home

LATER:
- port over to Chrome
*/

