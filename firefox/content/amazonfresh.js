'use strict';


const sessionKey = 'ODS_search_amazonFresh';
const nada = "Not available";
const nada2 = "\n    Not available\n";
const happiness = "Select a time";
const sessionHasEnded = "We're sorry we are unable to fulfill your entire order.";

function search (root) {
    if (document.getElementById('orderSlotExists'))
        return notify(OPEN, AMAZON_FRESH);
    
    const nodesH4 = root.getElementsByTagName("H4");
    for (let i = 0; i < nodesH4.length; i++) {
        if (sessionEnded(nodesH4.item(i)))
            return notify(SESSION_END, AMAZON_FRESH);
    }

    const nodes = root.getElementsByClassName("a-size-small slot-button-micro-copy");
    let cnt = 0;
    for (let i = 0; i < nodes.length; i++) {
        if (noDeliveryAvailable(nodes.item(i)))
            cnt++;
    }
    if (cnt === nodes.length)
        return notify(BUSY, AMAZON_FRESH);
}
