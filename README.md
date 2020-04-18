## General Overview.
Install add-on. Currently only in Firefox. Trigger the watcher when you have no more delivery windows. Notification will be posted when an available window opens. If your session logs out, it will also notify you to login again.


## Installation:
Currently in beta testing (covid-19 limited release) with Friends&Fam. Has not gone through add-on/extension review process yet. Must manually install.

1. Download the extension.
    * [For non-devs, click here to download.](https://github.com/wiedld/open-delivery-slot/archive/master.tar.gz)

2. Install the extension locally.
    * https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/
    * on successful installation, you should witness the hedgehog.


## How to Use:
1. Fill your shopping cart. Get to the point where the Delivery options are posted (if available).

2. Click the icon ![watch_icon](firefox/icons/watch-38.png)

3. **First time, per website**:
    * notifications request will pop-up in Firefox toolbar.
    * after approval, reload the page.

4. Leave your tab open, and session active.

5. OpenDeliverySlot will reload the page every few minutes, and push a notification if a slot opens up.

6. If you navigate away from that page (within that tab) and return, then you will need to trigger the watcher again.


## Supported sites:
* Target (shipt)
* Instacart
* Amazon Fresh


## Caveats:
Based on frontend web scraping. Hence, this add-on is really only intended for short-term covid-19 life.


## TODO (not asap, not likely doing):
* lower prio: installation pages, info, etc. See: short-term.
* firefox extension approve/release.


## FIXME before any "official" deployment:
* make chrome version? move the webscraping versions over to chrome (which doesn't have the needed webRequest APIs).
* convert firefox add-on (target & instacart) to use webRequest.filterResponseData().
* amazon uses server-side rendering, nor found amazon fresh API with a cursory search. alternative approach needed.
