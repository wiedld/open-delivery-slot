'use strict';


const sessionKey = 'ODS_search_instacart';
const nada = "No delivery times available";
const nada2 = "No available delivery times";
const sessionHasEnded = "Login";


function search (root) {
    const nodesBut = document.getElementsByTagName("BUTTON");
    for (let i = 0; i < nodesBut.length; i++) {
        if (sessionEnded(nodesBut.item(i)))
            return notify(SESSION_END, INSTACART);
    }

    const nodesH1 = root.getElementsByTagName("H1");
    for (let i = 0; i < nodesH1.length; i++) {
        if (noDeliveryAvailable(nodesH1.item(i)))
            return notify(BUSY, INSTACART);
    }

    const tabs = root.getElementsByClassName("react-tabs");
    if (tabs.length > 0)
        return notify(OPEN, INSTACART);
}
