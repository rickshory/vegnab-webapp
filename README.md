# vegnab-webapp   

VegNab is a web app for collecting vegetation data. It's like a notebook, that helps you out in various ways: It lets you quickly enter correct spellings, by searching on scientific name or common name. It automatically gets a timestamp and GPS location for each item. It puts species from your local region (e.g., state or province) at the top of the search order.

VegNab does not track you in any way. Everything is in your browser, on your private mobile device. There is no login, and no cloud storage. You get your data sets by emailing them to yourself.

Data are organized by "sites". A site is just a name, under which you enter plant species. By default, VegNab makes only a species list for each site. However, you can set up VegNab to ask you for "auxiliary data" for each site, and/or each species item.

VegNab does not identify plants, but it allows you to defer identification by using your own "placeholder" names. You start a placeholder by typing a code, up to ten characters, that has at least one space in it. You can attach a gallery of photos to a placeholder, for later visual identification or reference. 

VegNab puts your auxiliary data onto your placeholders, the same as on known species. In this way, you could do an entire vegetation survey without knowing what any of the plants are -- as long as you can tell them apart.

After initial load, VegNab works entirely offline. VegNab remembers all your work, within certain limitation. Since all data are stored in the browser, they are under the browser's storage policy, which may "evict" data sets that become too large. This is only likely if you record many sites, without ever clearing off old ones.

Best usage is to email your data to yourself, and then clear off old sites you have finished.

-----

Developing VegNab as a web app.  
Rough timeline:
- December 5, 2022 Lock up app if locations denied.
- November 27, 2022 Implemented auxiliary data.
- November 18, 2022 Implemented wait-for-accuacy.
- November 11, 2022 "Settings" screen. For locations, set target accuracy, and wait for accuracy.
- October 28, 2022 Implemented setting "uncertainty" of a species.
- October 26, 2022 Implemented adding photos to placeholders.
- October 8, 2022 Implemented "placeholders", for species to be identified later.
- September 20, 2022 Implemented setting the Region, to show most relevant species.
- September 10, 2022 Service Worker, to allow app to work offline.
- August 27, 2022 Remember species previously found, as these will be more relevant.
- August 6, 2022 Edit previously entered species items: At this point, only Delete.
- July 20, 2022 Improved geolocation
- July 2, 2022 Implemented sending collected data by email.
- June 18, 2022 Improved user interface and search speed.
- June 6, 2022 Implemented "Sites", geographic locatons where species will be recorded. Automatically capture timestamp and location coordinates.
- May 19, 2022 Improved user interface for species entry and display.
- May 8, 2022 Test search speed, for the 80+k plant species in North America. Acceptable.
- April 30, 2022 Begin feasiblility testing.
