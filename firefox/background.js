"use strict";


function delayedReload (tabId) {
    setTimeout(() => browser.tabs.reload(tabId), 30*60*4);
    // setTimeout(() => browser.tabs.reload(tabId), 1000*60*4);
}

async function getActiveTab() {
    let tabArray = await browser.tabs.query({currentWindow: true, active: true});
    return tabArray[0];
}

function handleMessage (msg) {
    if (msg === TARGET_BUSY)
        return "Target has no open delivery windows.\nWe will notify you when this changes.";
    else if (msg === TARGET_OPEN)
        return "Target has an open delivery windows.";
    else if (msg === TARGET_SESSION_END)
        return "Your Target session has ended. Please log in again.";
};

function notify (id, msg) {
    return browser.notifications.create(`${id}`, {
        type: "basic",
        title: `${NOTIFICATION_HEADING}`,
        message: handleMessage(msg)
    });
}

browser.runtime.onMessage.addListener(({action}) => {
    getActiveTab()
        .then(({id}) => {
            switch (action) {
                case RELOAD_TAB:
                    return browser.tabs.reload(id); 
                case TARGET_SESSION_END:
                case TARGET_OPEN:
                {
                    browser.storage.local.remove(`${id}`);
                    return notify (id, action);
                }
                case TARGET_BUSY:
                {
                    delayedReload(id);
                    browser.storage.local.get().then(prev => {
                        if (prev[id] === action)
                            return;
                        else {
                            browser.storage.local.set({ ...prev, [id]: action });
                            return notify (id, action);
                        }
                    });
                }
                default:
                    return;
            }
        });
});

/*
    Navigiating away, then back to page --> content scripts are not automatically injected.
    Will require browserAction.onClicked()
*/
function injectContentScripts (id) {
    return Promise.all([
        browser.tabs.executeScript(id, { file: "actions.js" }),
        browser.tabs.executeScript(id, { file: "content/common.js" })])
            .then(() => browser.tabs.connect(id))
            .then(() => browser.tabs.executeScript(id, { file: "content/target_watcher.js" }));
}

browser.browserAction.onClicked.addListener(async () => {
    const { id, url } = await getActiveTab();
    await injectContentScripts(id);
    
    await browser.tabs.sendMessage(id, {action: PERMISSIONS, url });
    browser.storage.local.remove(`${id}`);
    await browser.tabs.sendMessage(id, {action: ACTIVATE_SEARCH });
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
