"use strict";


function delayedReload (tabId) {
    // setTimeout(() => browser.tabs.reload(tabId), 30*60*4);
    setTimeout(() => browser.tabs.reload(tabId), 1000*60*1);
    // setTimeout(() => browser.tabs.reload(tabId), 1000*60*4);
}

async function getActiveTab() {
    let tabArray = await browser.tabs.query({currentWindow: true, active: true});
    return tabArray[0];
}

function handleMessage (action, site) {
    if (action === BUSY)
        return `${site} has no open delivery windows.\nWe will notify you when this changes.`;
    else if (action === OPEN)
        return `${site} has an open delivery windows.`;
    else if (action === SESSION_END)
        return `Your ${site} session has ended. Please log in again.`;
};

function notify (id, action, site) {
    return browser.notifications.create(`${id}`, {
        type: "basic",
        title: `${NOTIFICATION_HEADING}`,
        message: handleMessage(action, site)
    });
}

browser.runtime.onMessage.addListener(({action,site}) => {
    getActiveTab()
        .then(({id}) => {
            switch (action) {
                case RELOAD_TAB:
                    return browser.tabs.reload(id); 
                case SESSION_END:
                case OPEN:
                {
                    browser.storage.local.remove(`${id}`);
                    return notify(id, action, site);
                }
                case BUSY:
                {
                    delayedReload(id);
                    browser.storage.local.get().then(prev => {
                        if (prev[id] === action)
                            return;
                        else {
                            browser.storage.local.set({ ...prev, [id]: action });
                            return notify(id, action, site);
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
function injectContentScripts (id, site) {
    return Promise.all([
        browser.tabs.executeScript(id, { file: "actions.js" }),
        browser.tabs.executeScript(id, { file: "content/common.js" })])
            .then(() => browser.tabs.connect(id))
            .then(() => browser.tabs.executeScript(id, { file: `content/${site}_watcher.js` }));
}

browser.browserAction.onClicked.addListener(async () => {
    const { id, url } = await getActiveTab();
    const site = /target/g.test(url) ? TARGET
        : /instacart/g.test(url) ? INSTACART
        : BAD_SITE;

    await injectContentScripts(id, site.toLowerCase());
    
    await browser.tabs.sendMessage(id, {action: PERMISSIONS, url, notValid: site === BAD_SITE });
    browser.storage.local.remove(`${id}`);
    await browser.tabs.sendMessage(id, {action: ACTIVATE_SEARCH, id });
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
