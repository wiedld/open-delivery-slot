"use strict";

function delayedReload (node, msg) {
    console.log("TRIGGERED");
    
    // reload tab --> need to know which tab to reload?
    setTimeout(() => {
        console.log("should reload");
        browser.runtime.reload();
    }, 4*60*10);
}

async function getActiveTabId() {
    let tabArray = await browser.tabs.query({currentWindow: true, active: true});
    return tabArray[0].id;
}

function handleMessage (msg, tabId) {
    console.log("handleMessage", msg);

    if (msg === TARGET_BUSY_MSG) {
        delayedReload(tabId);
        return "Target has NO open delivery windows.\nWe will notify you when this changes.";
    }
    else if (msg === TARGET_OPEN_MSG)
        return "Target has an open delivery windows.";
    else if (msg === TARGET_SESSION_END) {
        return "Your Target session has ended. Please log in again.";

    }
};

browser.runtime.onMessage.addListener((message) => {
    getActiveTabId()
        .then(id => {
            browser.notifications.create(`${id}`, {
                type: "basic",
                title: `${NOTIFICATION_HEADING}`,
                message: handleMessage(message.msg, id)
            });
        });
});
