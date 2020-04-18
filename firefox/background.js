"use strict";


function delayedReload (tabId, site) {
    const timeout = site === AMAZON_FRESH ? 1000*60*2 : 1000*60*4;
    setTimeout(() => browser.tabs.reload(tabId), timeout);
}

async function getActiveTab () {
    let tabArray = await browser.tabs.query({currentWindow: true, active: true});
    return tabArray[0];
}

function extractSite (url) {
    return /target\.com/g.test(url) ? TARGET
        : /instacart/g.test(url) ? INSTACART
        : /amazon\.com\/gp\/buy\/shipoptionselect/g.test(url) ? AMAZON_FRESH
        : BAD_SITE;
}

function handleMessage (action, site) {
    if (action === BUSY)
        return `${site} has no open delivery windows.\nWe will notify you when this changes.`;
    else if (action === OPEN)
        return `${site} has open delivery windows.`;
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

browser.runtime.onMessage.addListener(({action,site,id:raw}) => {
    const id = parseInt(raw);
    switch (action) {
        case RELOAD_TAB:
            return browser.tabs.reload(id);
        case SESSION_END:
        case OPEN:
        {
            browser.storage.local.remove(`ODS_${id}`);
            return notify(id, action, site);
        }
        case BUSY:
        {
            delayedReload(id, site);
            browser.storage.local.get().then(prev => {
                if (prev[`ODS_${id}`] === action)
                    return;
                else {
                    browser.storage.local.set({ ...prev, [`ODS_${id}`]: action });
                    return notify(id, action, site);
                }
            });
        }
        default:
            return;
    }
});


const handleRedirectOnSessionEnd = ({statusCode,url}) => {
    if ([302, 307].includes(statusCode)) {
        notify("unknown", SESSION_END, extractSite(url));
    }
}

browser.webRequest.onHeadersReceived.addListener(
    handleRedirectOnSessionEnd,
    {   urls: [
            "https://www.target.com/co-scheduledelivery*",
            "https://www.instacart.com/store/checkout_v3",
            "https://www.amazon.com/gp/buy/shipoptionselect/handlers/display.html?hasWorkingJavascript=1"
            ],
        types: ["main_frame"],
    },
    ["blocking"]
);


/*
    Navigiating away, then back to page --> content scripts are not always automatically injected.
    Know issue.
    Hence, will require browserAction.onClicked() every time you start the watcher.
*/
function injectContentScripts (id, site) {
    return Promise.all([
        browser.tabs.executeScript(id, { file: "actions.js" }),
        browser.tabs.executeScript(id, { file: "content/common.js" })])
            .then(() => browser.tabs.connect(id))
            .then(() => 
            Promise.all([
                browser.tabs.executeScript(id, { file: `content/${site.toLowerCase()}.js` }),
                browser.tabs.executeScript(id, { file: `content/watcher.js` })
            ]));
}

browser.browserAction.onClicked.addListener(async () => {
    const { id, url } = await getActiveTab();
    const site = extractSite(url);

    try {
        await injectContentScripts(id, site.toLowerCase());
    } catch (e) {}
    
    await browser.tabs.sendMessage(id, {action: PERMISSIONS, url, notValid: site === BAD_SITE });
    browser.storage.local.remove(`${id}`);
    await browser.tabs.sendMessage(id, {action: ACTIVATE_SEARCH, id });
});

browser.runtime.onInstalled.addListener(async ({ reason, temporary }) => {
    // if (temporary) return; // skip during development
    switch (reason) {
        case "install":
        {
            const url = browser.runtime.getURL("views/installed.html");
            await browser.tabs.create({ url });
        }
        case "update":
            break;
    }
  });
