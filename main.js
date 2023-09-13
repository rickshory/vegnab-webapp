"use strict";

  var swVersion = "";
// install Service Worker here, then it will "live" in the browser
if ('serviceWorker' in navigator) {
  // Register a service worker hosted at the root of the
  // site using the default scope.
  // Fails because there is no 'sw.js' yet, but console logs
  //  indicates this code does get run
  //  Use following format to run on LocalHost
   navigator.serviceWorker.register('sw.js').then((registration) => {
  //  Use following format to run from GitHub
//   navigator.serviceWorker.register('/vegnab-webapp/sw.js', {scope: '/vegnab-webapp/'}).then((registration) => {
    console.log('Service worker registration succeeded:', registration);

    navigator.serviceWorker.addEventListener("message", (event) => {
      // event is a MessageEvent object
      console.log('Service worker sent message: ' + event.data);
      // at this point, the only message will be the sw version
      swVersion = event.data;
    });

    navigator.serviceWorker.ready.then((registration) => {
      registration.active.postMessage("requestVersion");
    });

  }, /*catch*/ (error) => {
    console.error(`Service worker registration failed: ${error}`);
  });
} else {
  console.error('Service workers are not supported.');
}

(function () {

// set up persistent storage
let db;
const dbRequest = indexedDB.open("VnDatabase", 1);
dbRequest.onerror = (e) => {
  console.error("VegNab web app not confirmed to used indexedDB");
};
dbRequest.onsuccess = (e) => {
  console.log("indexedDB open succeeded for 'VnDatabase'");
  // object store should have been initialized in onupgradeneeded event
  db = e.target.result;
  db.onerror = (e) => {
    // generic error handler for the database
    console.error(`Database error: ${e.target.errorCode}`)
  };
  const transaction = db.transaction(["VNAppStates"]);
  const objectStore = transaction.objectStore("VNAppStates");
  const sitesRequest = objectStore.get("vnSitesBkup");
  sitesRequest.onerror = (event) => {
    console.log(`error retrieving object for vnSitesBkup`);
  };
  sitesRequest.onsuccess = (event) => {
    console.log(`retrieved vnSitesBkup ${sitesRequest.result}`);
    site_info_array = sitesRequest.result;
  };

  const sppRequest = objectStore.get("vnSpeciesBkup");
  sppRequest.onerror = (event) => {
    console.log(`error retrieving object for vnSpeciesBkup`);
  };
  sppRequest.onsuccess = (event) => {
    console.log(`retrieved vnSpeciesBkup ${sppRequest.result}`);
    site_spp_array = sppRequest.result;
  };

  const phRequest = objectStore.get("vnPlaceholdersBkup");
  phRequest.onerror = (event) => {
    console.log(`error retrieving object for vnPlaceholdersBkup`);
  };
  phRequest.onsuccess = (event) => {
    console.log(`retrieved vnPlaceholdersBkup ${phRequest.result}`);
    placeholders_array = phRequest.result;
  };

  const foundSppRequest = objectStore.get("vnFoundSppBkup");
  foundSppRequest.onerror = (event) => {
    console.log(`error retrieving object for vnFoundSppBkup`);
  };
  foundSppRequest.onsuccess = (event) => {
    console.log(`retrieved vnFoundSppBkup ${foundSppRequest.result}`);
    found_spp_array = foundSppRequest.result;
  };

  const auxSpecsRequest = objectStore.get("vnAuxSpecsBkup");
  auxSpecsRequest.onerror = (event) => {
    console.log(`error retrieving object for vnAuxSpecsBkup`);
  };
  auxSpecsRequest.onsuccess = (event) => {
    console.log(`retrieved vnAuxSpecsBkup ${auxSpecsRequest.result}`);
    aux_specs_array = auxSpecsRequest.result;
  };

  const auxDataRequest = objectStore.get("vnAuxDataBkup");
  auxDataRequest.onerror = (event) => {
    console.log(`error retrieving object for vnAuxDataBkup`);
  };
  auxDataRequest.onsuccess = (event) => {
    console.log(`retrieved vnAuxDataBkup ${auxDataRequest.result}`);
    aux_data_array = auxDataRequest.result;
  };

};

dbRequest.onupgradeneeded = (e) => {
  // save the IDBDatabase interface
  const db = e.target.result;
  // create the db object store
  const VnObjStore = db.createObjectStore("VNAppStates");
  // stored objects will be arrays, and keys will be explicit
  console.log("created 'VnObjStore'");
  VnObjStore.put([], "vnSitesBkup"); // initialize to empty array
  console.log(" VnObjStore[VNAppStates], 'vnSitesBkup' initialized as empty array");
  VnObjStore.put([], "vnSpeciesBkup");
  console.log(" VnObjStore[VNAppStates], 'vnSpeciesBkup' initialized as empty array");
  VnObjStore.put([], "vnPlaceholdersBkup");
  VnObjStore.put([], "vnFoundSppBkup");
  VnObjStore.put([], "vnAuxSpecsBkup");
  VnObjStore.put([], "vnAuxDataBkup");
  VnObjStore.put([], "vnSettingsBkup"); // not yet used
  VnObjStore.put([], "vnAppStateBkup"); // not yet implemented
};

// for places to insert sitelist backup look for 'site_info_array.unshift', 
//  'site_info_array.splice', 'whatIsAwaitingAccuracy'
function bkupSiteList() {
  let sitesBkupRequest = db.transaction(["VNAppStates"], "readwrite")
    .objectStore("VNAppStates")
    .put(site_info_array, "vnSitesBkup"); // 'put' overwrites any previous

  sitesBkupRequest.onsuccess = (e) => {
    console.log(" in object store 'VNAppStates', 'site_info_array' backed up under key 'vnSitesBkup' " + e);
  };
  sitesBkupRequest.onerror = (e) => {
    console.log(" in object store 'VNAppStates', 'site_info_array' failed to back up under key 'vnSitesBkup' " + e);
  };
};

function bkupSpeciesList() {
  let sppBkupRequest = db.transaction(["VNAppStates"], "readwrite")
    .objectStore("VNAppStates")
    .put(site_spp_array, "vnSpeciesBkup"); // 'put' overwrites any previous

  sppBkupRequest.onsuccess = (e) => {
      console.log(" in object store 'VNAppStates', 'site_spp_array' backed up under key 'vnSpeciesBkup' " + e);
    };
  sppBkupRequest.onerror = (e) => {
    console.log(" in object store 'VNAppStates', 'site_spp_array' failed to back up under key 'vnSpeciesBkup' " + e);
  };
};

function bkupPlaceholders() {
  let phBkupRequest = db.transaction(["VNAppStates"], "readwrite")
    .objectStore("VNAppStates")
    .put(placeholders_array, "vnPlaceholdersBkup"); // 'put' overwrites any previous

  phBkupRequest.onsuccess = (e) => {
      console.log(" in object store 'VNAppStates', 'placeholders_array' backed up under key 'vnPlaceholdersBkup' " + e);
    };
  phBkupRequest.onerror = (e) => {
    console.log(" in object store 'VNAppStates', 'placeholders_array' failed to back up under key 'vnPlaceholdersBkup' " + e);
  };
};

function bkupFoundSpp() {
  let fndSppRequest = db.transaction(["VNAppStates"], "readwrite")
    .objectStore("VNAppStates")
    .put(found_spp_array, "vnFoundSppBkup"); // 'put' overwrites any previous

  fndSppRequest.onsuccess = (e) => {
    console.log(" in object store 'VNAppStates', 'found_spp_array' backed up under key 'vnFoundSppBkup' " + e);
  };
  fndSppRequest.onerror = (e) => {
    console.log(" in object store 'VNAppStates', 'found_spp_array' failed to back up under key 'vnFoundSppBkup' " + e);
  };
};

function bkupAuxSpecs() {
  let auxSpecsRequest = db.transaction(["VNAppStates"], "readwrite")
    .objectStore("VNAppStates")
    .put(aux_specs_array, "vnAuxSpecsBkup"); // 'put' overwrites any previous

  auxSpecsRequest.onsuccess = (e) => {
    console.log(" in object store 'VNAppStates', 'aux_specs_array' backed up under key 'vnAuxSpecsBkup' " + e);
  };
  auxSpecsRequest.onerror = (e) => {
    console.log(" in object store 'VNAppStates', 'aux_specs_array' failed to back up under key 'vnAuxSpecsBkup' " + e);
  };
};

function bkupAuxData() {
  let auxDataRequest = db.transaction(["VNAppStates"], "readwrite")
    .objectStore("VNAppStates")
    .put(aux_data_array, "vnAuxDataBkup"); // 'put' overwrites any previous

  auxDataRequest.onsuccess = (e) => {
    console.log(" in object store 'VNAppStates', 'aux_data_array' backed up under key 'vnAuxDataBkup' " + e);
  };
  auxDataRequest.onerror = (e) => {
    console.log(" in object store 'VNAppStates', 'aux_data_array' failed to back up under key 'vnAuxDataBkup' " + e);
  };
};

//TODO: backup app settings and state

/* under 'vnAppStateBkup' building a list of items to store:
current_site_id
*/

// TODO: possibly change the following, to avoid any possible race conditions of
//  the arrays not being retrieved before the UI gets refreshed
 document.addEventListener("DOMContentLoaded", function() {
   console.log('DOMContentLoaded');
   // trigger to refresh site list and species
   shwSitesTimeout = setTimeout(showSites, 200);
 });

// for testing, region is "OR" (Oregon)
// user can change it 'Options' screen
// todo: automatically acquire or input region
var region_code = "OR";
// default, ignore subspecies and varieties
// can change in 'Options' screen
var include_subspp_var = false;

// value returned by setInterval, for periocally checking the location
// used to clear the ticker using clearInterval
var periodicLocationCheckFlag;
var browser_supports_geolocation = false; // until determined true
// return value used to halt position tracking
// by calling clearWatch on this id
var position_tracker_id = 0;
var locationTickerInterval = 1000; // milliseconds, default to a reasonable average, settable by Site or Species
var latestLocation; // latest location acquired

const locationOptions = {
  enableHighAccuracy: true,
  timeout: 60000,
  maximumAge: 0
};

// flag first, to notify user they need to 'Allow' locations
var firstLocRequest = true; // this can be reset to 'true' when app reloaded,
  // but by then the user will likely have either granted or denied locations
var locationsGranted = false; // when true, flags that location reading has been allowed, 
  // and app can skip checking the state

// keep acquiring site location until accuracy is <= this
// user can manually accept greater inaccuracty
var siteLocTargetAccuracy = 7;
var waitForSiteLocTarget = true;
var sppLocTargetAccuracy = 7;
var waitForSppLocTarget = true;

var targetAccuracyOK = true; // 'false' = waiting for periodic acquire good enough
var accuracyAccepted = true; // 'false' = waiting for manual acceptance
// flags for treating deferred locations from "wait for target accuracy"
var locationDeferred = false; // new item has been saved, but will update location when acc OK
var whatIsAwaitingAccuracy = ""; // 'site', 'spp_itm', 'new_plholder' or ''

var sentDataFormat = "fmtHumanReadable"; // default until changed

var siteScreenComplete = false; // flag to distinguish screen simply
  // dismissed, and so to stop the location ticker
var site_info_array = [];
var current_site_id = "";
var site_chosen_to_send = -1;
var sppScreenComplete = false; // flag to distinguish screen simply
  // dismissed, and so to stop the location ticker
var site_spp_array = []; // the species items for all the sites, internally
// indexed by which site each one belongs to.
var current_spp_item_id = ""; // tracks which item, for working on details, or
  // if location deferred
var local_spp_array = [];
var nonlocal_spp_array = [];
var found_spp_array = []; // track which species have been previously found
/*
let new_spp_item = {
  // if 'id' used as HTML element id, prefix assures it does not start with a number
  "id": 'sp_' + spp_entry_date.getTime().toString(),
  "site_id": current_site_id,
  "type": 'sp', // a real species, vs. 'ph' for placeholders
  "species": spp,
  "uncertainty": "",
  "date": spp_entry_date,
  "latitude": sppItemLat,
  "longitude": sppItemLon,
  "accuracy": sppItemAcc
};
*/
var placeholders_array = [];
var placeholder_state = ""; // will be 'new' or 'edit'
var current_ph_id = "";
var current_ph_code = "";
var cur_placeholder; // the placeholder being added/edited, first created incomplete
  // some fields filled in by user, some by GPS acquire
  // incomplete placehold will be deleted if info screen dismissed without finishing
var phScreenComplete = false; // flag to distinguish screen simply
  // dismissed, and so to stop the location ticker, and delete an incomplete placeholder

//  = {
//   "id": numeric from timestamp,
//   "site_id": current_site_id,
//   "code": the code,
//   "keywords": [empty until filled in],
//   "photos": [photo uris and or urls],
//   "date": creation _date,
//   "latitude": first found at Lat,
//   "longitude": first found at Lon,
//   "accuracy": lat lon Accuracy
// };

var aux_specs_array = [];
// specifications for auxiliary data items
//  = {
//   "id": numeric text from timestamp when created
//   "for": 'sites' or 'spp_items'
//   "name": what this item is labeled as
//   "type": integer, decimal, yes/no, text, list
//   "default": value if there is a default
//   "min": vakue if there is a minumum
//   "max": value if there is a maximum
//   "required": true of false
//   "order": listing order in the generated form
// };
var aux_spec_state = ""; // will be 'new' or 'edit'
var aux_spec_for = "";  // will be sites' or 'spp_items'
var current_aux_spec_id = "";
// var auxDataDone = false; // flag for processing each new site or spp, currently unused
var aux_data_array = [];
// the auxiliary data items themselves
//  = {
//   "id": numeric text from timestamp when created
//   "for": 'sites' or 'species_items'; may not be needed
//   "parent_id": the id of the site or speecies item record
//   "spec_id": for looking up the name, and for validation
//   "name": maybe store here instead of lookup
//   "value": the value
// };

var shwSitesTimeout = setTimeout(showSites, 10); // first time, there are no
// sites, so nothing visible will happen
var match_list = document.getElementById("match-list");
var sites_available_to_send_list = document.getElementById("sendFormSitesList");

function distanceTwoPoints(lat1, lon1, lat2, lon2) {
  // distance between two lat/lon points on the earth, by spherical law of cosines
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;
  const R = 6371e3;
  return (Math.acos( Math.sin(φ1)*Math.sin(φ2)
    + Math.cos(φ1)*Math.cos(φ2) * Math.cos(Δλ) ) * R);
}

function initBearing(lat1, lon1, lat2, lon2) {
  // bearing, starting from point (lat1, lon1) towards point (lat2, lon2)
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const λ1 = lon1 * Math.PI/180;
  const λ2 = lon2 * Math.PI/180;
  const y = Math.sin(λ2-λ1) * Math.cos(φ2);
  const x = Math.cos(φ1)*Math.sin(φ2) - Math.sin(φ1)*Math.cos(φ2)*Math.cos(λ2-λ1);
  const θ = Math.atan2(y, x);
  return (θ*180/Math.PI + 360) % 360; // in degrees
}

var crossingCount = 0;

function findRegion() {
  // find the geographic region where this app is being used
  // to show the most relevant plant species

  // for testing, just check if the current location is in the test region Oregon, and
  // show an alert for diagnostics
  console.log("In fn 'findRegion'");
  if (current_site_id === undefined) {
    alert("No site yet");
    return;
  }
  let curSite = site_info_array.find(s => s.id == current_site_id);
  let lat = parseFloat(curSite.latitude);
  let lng = parseFloat(curSite.longitude);
  let bounds = region_bounds_array[0].vertexes;
 // console.log(bounds);
  // time how long this takes
  let ivStart = new Date().getTime();
  let inThisRegion = polygonContainsPt(bounds, lng, lat);
  let ivEnd =  new Date().getTime();
  let interval = ivEnd - ivStart;
  let msgEnd = ", found " + crossingCount + " crossings, took " + interval + "ms" ;
  if (inThisRegion) {
    alert("Location is in Oregon" + msgEnd);
  } else {
    alert("Location is outside Oregon" + msgEnd);
  }
}

/**
 * @return {boolean} true if (lng, lat) is in bounds
 */
function polygonContainsPt(bounds, lng, lat) {
  //https://rosettacode.org/wiki/Ray-casting_algorithm
  var count = 0;
  // polygon: last vertex is a copy of the first one
  for (var b = 0; b < (bounds.length - 1); b++) {
    var vertex1 = bounds[b];
    var vertex2 = bounds[(b + 1)];
    if (west(vertex1, vertex2, lng, lat)) {
      ++count;
      console.log("in fn 'polygonContainsPt', count = "  + count);
      console.log("ray east from (" + lng + "," + lat + ") crosses segment " + vertex1 + " to " + vertex2 );
    }
  }
  crossingCount = count;
  return count % 2;

  /**
   * @return {boolean} true if (x,y) is west of the line segment connecting A and B
   */
  function west(A, B, x, y) {
    if (A[1] <= B[1]) {
      if (y <= A[1] || y > B[1] || x >= A[0] && x >= B[0]) {
        return false;
      } else if (x < A[0] && x < B[0]) {
        return true;
      } else {
        return (y - A[1]) / (x - A[0]) > (B[1] - A[1]) / (B[0] - A[0]);
      }
    } else {
      return west(B, A, x, y);
    }
  }
}

// var square = {name: 'square', bounds: [{x: 0, y: 0}, {x: 20, y: 0}, {x: 20, y: 20}, {x: 0, y: 20}]};
// var squareHole = {
//   name: 'squareHole',
//   bounds: [{x: 0, y: 0}, {x: 20, y: 0}, {x: 20, y: 20}, {x: 0, y: 20}, {x: 5, y: 5}, 
//     {x: 15, y: 5}, {x: 15, y: 15}, {x: 5, y: 15}]
// };
// var strange = {
//   name: 'strange',
//   bounds: [{x: 0, y: 0}, {x: 5, y: 5}, {x: 0, y: 20}, {x: 5, y: 15}, {x: 15, y: 15}, 
//     {x: 20, y: 20}, {x: 20, y: 0}]
// };
// var hexagon = {
//   name: 'hexagon',
//   bounds: [{x: 6, y: 0}, {x: 14, y: 0}, {x: 20, y: 10}, {x: 14, y: 20}, {x: 6, y: 20}, {x: 0, y: 10}]
// };

// var shapes = [square, squareHole, strange, hexagon];
// var testPoints = [{lng: 10, lat: 10}, {lng: 10, lat: 16}, {lng: -20, lat: 10},
//   {lng: 0, lat: 10}, {lng: 20, lat: 10}, {lng: 16, lat: 10}, {lng: 20, lat: 20}];

// for (var s = 0; s < shapes.length; s++) {
//   var shape = shapes[s];
//   for (var tp = 0; tp < testPoints.length; tp++) {
//     var testPoint = testPoints[tp];
//     console.log(JSON.stringify(testPoint) + '\tin ' + shape.name + '\t' 
//     + polygonContainsPt(shape.bounds, testPoint.lat, testPoint.lng));
//   }
// }

function showAppStatus(rtn_ok) {
  if (rtn_ok) {
    try {
      document.getElementById("info_footer").innerHTML =
        "Region: " + (regions_array.find(r => r.code == region_code).name);
      // more status later
    } catch(err) {
      document.getElementById("info_footer").innerHTML = err.message;
    }
  } else {
    document.getElementById("info_footer").innerHTML = "Could not build lists";
  }
}

function showListsError(err_msg) {
  document.getElementById("info_footer").innerHTML = err_msg;
}

var sitesNewOrAddList = document.getElementById('chooseOrAddNewSitesList');

sitesNewOrAddList.addEventListener('click', function (e) {
  // list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== sitesNewOrAddList) {
      target = target.parentNode; // If the clicked element isn't a direct child
      if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    if (target.id == 'siteAddNew') {
      // add new site
      var vnAddSiteModal = new bootstrap.Modal(document.getElementById('vnSiteInfoScreen'), {
        keyboard: false
      });
      vnAddSiteModal.show();
    } else {
      // use existing site
      // the element id is the string "st_" followed by the index number in the Sites array
      let site_id_chosen = parseInt((target.id).split("_")[1]);
        console.log("ID of site chosen = " + site_id_chosen);
        current_site_id = site_id_chosen;
        showSites();
    }
  }
});

makeLocalAndNonlocalSppArrays().then(
  function(value) {showAppStatus(value);},
  function(error) {showListsError(error);}
);

async function makeLocalAndNonlocalSppArrays() {
	// for performance, create these two smaller arrays, each seldom updated,
	// that will be filtered for matches on each keystroke
  // retain separate fields in original array but concatenate in local and
  //  nonlocal for easier searching
	let tmp_local_array = nrcs_spp_array.filter(spp_obj =>
		((spp_obj.distribution.includes(region_code + ",")) &&
    (include_subspp_var ? true : (spp_obj.subspp_var == ""))));
	local_spp_array = tmp_local_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
      "item_description": orig_obj.genus
          + ((orig_obj.species == "") ? "" : " " + orig_obj.species)
          + ((orig_obj.subspp_var == "") ? "" : " " + orig_obj.subspp_var)
          + orig_obj.common_names
		};
		return new_properties;
	});
	let tmp_nonlocal_array = nrcs_spp_array.filter(spp_obj =>
		((!tmp_local_array.includes(spp_obj)) &&
    (include_subspp_var ? true : (spp_obj.subspp_var == ""))));
//	console.log(local_spp_array);
	nonlocal_spp_array = tmp_nonlocal_array.map(orig_obj => {
		let new_properties = {
			"item_code": orig_obj.nrcs_code,
      "item_description": orig_obj.genus
          + ((orig_obj.species == "") ? "" : " " + orig_obj.species)
          + ((orig_obj.subspp_var == "") ? "" : " " + orig_obj.subspp_var)
          + orig_obj.common_names
		};
		return new_properties;
	});
//	console.log(nonlocal_spp_array);
//  return "Region: " + (regions_array.find(r => r.code == region_code).name);
  return true;
};

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = sppSearchInput.value.toLowerCase();
	// todo: deal with backspace removal of characters
	match_list.innerHTML = ""; // clear any previous content
  // get the different kinds of matches, will concatenate as the html string
  let found_spp_match_array = [];
  let local_spp_match_array = [];
  let nonlocal_spp_match_array = [];

  if (search_term.length > 0) {
    found_spp_match_array = found_spp_array.filter(obj =>
			obj.item_code.toLowerCase().startsWith(search_term));
    // treat placeholders as found species
    // frst, get code matches
    let placeholder_match_array = placeholders_array.filter(obj =>
       obj.code.toLowerCase().startsWith(search_term));
    if (search_term.length > 2) { // get placeholder keyword matches
      let placeholder_keyword_match_array = placeholders_array.filter(obj =>
         obj.keywords.join(" ").toLowerCase().includes(search_term));
      // remove any code repeats
      placeholder_keyword_match_array = placeholder_keyword_match_array.filter(ar =>
        !placeholder_match_array.find(rm => (rm.code === ar.code)));
      // put keyword matches with code matches
      placeholder_match_array = placeholder_match_array
        .concat(placeholder_keyword_match_array);
    } // end of search_term.length > 2
    console.log(placeholder_match_array);
    let ph_show_array = placeholder_match_array.map(ph => {
      let ph_show = {
        "item_code": ph.code,
        "item_description": ph.keywords.join(" ")
      };
      return ph_show;
    });
    found_spp_match_array = found_spp_match_array.concat(ph_show_array);
    found_spp_match_array.sort();
  }
	if (search_term.length > 1) {
		// get the strict matches on item_code for local species
		local_spp_match_array = local_spp_array.filter(obj =>
			obj.item_code.toLowerCase().startsWith(search_term));
		if (search_term.length > 2) {
			// get local full-text matches
			// at least 3 characters, to include short genera such as "Poa" and "Zea"

      // get full-text matches
      let local_fulltext_spp_match_array = local_spp_array.filter(obj =>
				obj.item_description.toLowerCase().includes(search_term));
      // remove any code repeats
      local_fulltext_spp_match_array = local_fulltext_spp_match_array.filter(ar =>
        !local_spp_match_array.find(rm => (rm.item_code === ar.item_code)));
      // put the code matches together with the full-text matches
      local_spp_match_array = local_spp_match_array.concat(local_fulltext_spp_match_array);
      // remove any previously-found repeats
      local_spp_match_array = local_spp_match_array.filter(ar =>
        !found_spp_match_array.find(rm => (rm.item_code === ar.item_code)));
			local_spp_match_array.sort(); // internally sort local spp, by code

			// add matches of non-local species, CSS will color them differently
			// get strict code matches
			nonlocal_spp_match_array = nonlocal_spp_array.filter(obj =>
				obj.item_code.toLowerCase().startsWith(search_term));
			// get full-text matches
			let nonlocal_fulltext_spp_match_array = nonlocal_spp_array.filter(obj =>
				obj.item_description.toLowerCase().includes(search_term));
      // remove any code repeats
      nonlocal_fulltext_spp_match_array = nonlocal_fulltext_spp_match_array.filter(ar =>
        !nonlocal_spp_match_array.find(rm => (rm.item_code === ar.item_code)));
			// put the nonlocal code and full-text results together
			nonlocal_spp_match_array =
				nonlocal_spp_match_array.concat(nonlocal_fulltext_spp_match_array);
      // remove any previously-found repeats
      nonlocal_spp_match_array = nonlocal_spp_match_array.filter(ar =>
        !found_spp_match_array.find(rm => (rm.item_code === ar.item_code)));
			// internally sort
			nonlocal_spp_match_array.sort();
		}
	}
  // build list contents, if any, then assign innerHTML all at once
  let list_string = "";
  found_spp_match_array.forEach(obj => {
    list_string += '<li class="'
      + ((obj.item_code.includes(" ")) ?  'placeholder' : 'prevfound')
      + '" id="' + ((obj.item_code.includes(" ")) ?
      ("P_H_" + encodeURIComponent(obj.item_code)) : obj.item_code) + '">'
      + obj.item_code + ': ' + obj.item_description + '</li>';
  });
  local_spp_match_array.forEach(obj => {
    list_string += '<li class="local" id="' + obj.item_code + '">'
      + obj.item_code + ': ' + obj.item_description + '</li>';
  });
  // put nonlocal (less relevant) after local
  nonlocal_spp_match_array.forEach(obj => {
    list_string += '<li class="nonlocal" id="' + obj.item_code + '">'
      + obj.item_code + ': ' + obj.item_description + '</li>';
  });
  // only suggest a placeholder if no matches so far
  if (list_string == "") {
    console.log("No matches, checking for valid placeholder");
    // assure only single internal spaces
    let ph_code = search_term.trim().replace(/\s+/g, ' ');
    // if has a space, and 4 to 10 characters
    if (ph_code.includes(" ")
        && ph_code.length > 3 && ph_code.length < 11) {
      let encoded_code = encodeURIComponent(ph_code);
      console.log("encoded code: " + encoded_code);
      list_string += '<li class="placeholder" id="P_H_NEW_'
        + encoded_code + '">'
        + 'Use placeholder "' + ph_code + '"?</li>';
    }
  }
  match_list.innerHTML = list_string;
};

match_list.addEventListener('click', function (e) {
  // match_list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== match_list) {
      target = target.parentNode; // If the clicked element isn't a direct child
      if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    if (latestLocation === undefined) {
      alert("Try again, still reading location");
      return;
    }
    sppScreenComplete = true; // flag, screen was not simply dismissed; allow
      // any location ticker to continue
//        alert(target.id);
    // if a regular species code
    if (nrcs_spp_array.some(obj => obj.nrcs_code == target.id)) {
      let spp = target.textContent;
      console.log(spp);
      // use the code and description as one string "species"
      let spp_entry_date = new Date();
      let new_spp_item = {
        // if 'id' used as HTML element id, prefix assures it does not start with a number
        "id": 'sp_' + spp_entry_date.getTime().toString(),
        "site_id": current_site_id,
        "type": 'sp', // a real species, vs. 'ph' for placeholders
        "species": spp,
        "uncertainty": "",
        "date": spp_entry_date,
        "latitude": "" + latestLocation.coords.latitude,
        "longitude": "" + latestLocation.coords.longitude,
        "accuracy": "" + latestLocation.coords.accuracy.toFixed(1)
      };
      current_spp_item_id = new_spp_item.id;
      site_spp_array.unshift(new_spp_item);
      bkupSpeciesList();
      // remember that this species has been found
      let a = spp.split(":");
      let found_spp = {
        "item_code": a[0].trim(),
        "item_description": a[1].trim()
      };
      if ((found_spp_array.find(itm => itm.item_code == found_spp.item_code)) == undefined) {
        found_spp_array.push(found_spp);
        bkupFoundSpp();
      }

      // if flagged, check that target accuracy was met
      if (waitForSppLocTarget && !targetAccuracyOK) {
        current_spp_item_id = new_spp_item.id;
        accuracyAccepted = false; // can be manually accepted
        locationDeferred = true;
        whatIsAwaitingAccuracy = "spp_itm";
        bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
        var vnAwaitAcc = new bootstrap.Modal(document.getElementById('vnWaitForAccuracyScreen'), {
          keyboard: false
        });
        vnAwaitAcc.show();
      } else { // finish up
        // ticker may already be stopped if targetAccuracyOK
        clearInterval(periodicLocationCheckFlag);
        stopTrackingPosition();
        latestLocation = undefined;
        accuracyAccepted = true;
        locationDeferred = false;
        whatIsAwaitingAccuracy = "";
        // dismiss this modal
        console.log('About to hide the Species Search modal');
        bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
        // trigger to refresh site list
        shwSitesTimeout = setTimeout(showSites, 10);
        aux_spec_for = "spp_items";
        enterAnyAuxData();
      }
      // end, if regular species
    } else { // not a regular species
      console.log("Target ID: " + target.id);
      if (target.id.startsWith("P_H_")) {
        console.log("some kind of placeholder, new or existing");
        if (target.id.startsWith("P_H_NEW_")) { // a new placeholer
          // a placeholder code contains spaces, and thus was encoded to make a valid ID
          console.log("target.id for new placeholder: " + target.id);
          placeholder_state = "new";
          current_ph_code = decodeURIComponent(target.id.slice(8));
          console.log("new placeholder code: " + current_ph_code);
          let ph_create_date = new Date();
          let new_ph = {
            // if 'id' used as HTML element id, prefix assures it does not start with a number
            "id": 'ph_' + ph_create_date.getTime().toString(),
            "site_id": current_site_id,
            "code": current_ph_code,
            "keywords": [], // empty until filled in
            "photos": [], // photo uris and urls
            "date": ph_create_date,
            "latitude": "" + latestLocation.coords.latitude,
            "longitude": "" + latestLocation.coords.longitude,
            "accuracy": "" + latestLocation.coords.accuracy.toFixed(1)
          };
          current_ph_id = new_ph.id; // remember the ID
          // put this placeholder, at least temporarily, into the placeholders array
          placeholders_array.unshift(new_ph);
          bkupPlaceholders();
          // get a reference to the array element
          cur_placeholder = placeholders_array.find(ph => ph.id == current_ph_id);

          // add an instance of this placeholder to the site items
          // which will be deleted if the new placeholder is canceled
          // may need to defer its location too
          current_spp_item_id = insertPlHolderItm(); // uses globals

          // if flagged to, check that target accuracy was met
          if (waitForSppLocTarget && !targetAccuracyOK) { // use same target accuracy as for species
            accuracyAccepted = false; // can be manually accepted
            locationDeferred = true;
            whatIsAwaitingAccuracy = "new_plholder";
          } else { // finish up
            // ticker may already be stopped if targetAccuracyOK
            clearInterval(periodicLocationCheckFlag);
            stopTrackingPosition();
            latestLocation = undefined;
            accuracyAccepted = true;
            locationDeferred = false;
            whatIsAwaitingAccuracy = "";
            // dismiss this modal
            console.log('About to hide the Species Search modal for a new placeholder');
          }
          // whether accuracy OK or not, dismiss this modal and show the ph info one
          bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
          var vnPhInfoModal = new bootstrap.Modal(document.getElementById('vnPlaceholderInfoScreen'), {
            keyboard: false
          });
          vnPhInfoModal.show();
          // end of initiating a new placeholder
        } else { // an existing placeholer
          // insert it as item for this site, similar to a real species
          // a placeholder code will contain spaces, and thus was encoded to make a valid ID
          console.log("target.id for existing placeholder: " + target.id);
          let matched_placeholder_code = decodeURIComponent(target.id.slice(4));
          console.log("parsed placeholder code: " + matched_placeholder_code);
          let ph = target.textContent;
          console.log(ph);
          // get the global 'cur_placeholder' the following fn needs
          cur_placeholder = placeholders_array.find(p => p.code === matched_placeholder_code);
          // following fn fills in fields that might be redunant, but includes
          // "ph_id": to allow lookup back to the original placeholder definition
          // "type": 'ph' which flags this item as a placeholder, vs. a real species
          // could allow specialized processing
          // such as displaying photos, or checking if the placeholder
          // has been identified
          current_spp_item_id = insertPlHolderItm(); // uses globals
          // if flagged, check that target accuracy was met
          if (waitForSppLocTarget && (!targetAccuracyOK)) {
            // for the lat/lon/acc fields are the same as for a species
//            current_spp_item_id = new_ph_item.id;
            accuracyAccepted = false; // can be manually accepted
            locationDeferred = true;
            whatIsAwaitingAccuracy = "spp_itm"; // for now, this works the same
            bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
            var vnAwaitAcc = new bootstrap.Modal(document.getElementById('vnWaitForAccuracyScreen'), {
             keyboard: false
            });
            vnAwaitAcc.show();
          } else { // finish up
            // ticker may already be stopped if targetAccuracyOK
            clearInterval(periodicLocationCheckFlag);
            stopTrackingPosition();
            latestLocation = undefined;
            accuracyAccepted = true;
            locationDeferred = false;
            whatIsAwaitingAccuracy = "";
            // dismiss this modal
            console.log('About to hide the Species Search modal for a placeholder item');
            bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
            // trigger to refresh site list
            shwSitesTimeout = setTimeout(showSites, 10);
          }
          // end of processing an existing placeholder
        }
      } // end of processing placeholders, new or existing
    } // dropthrough if neither real species or placeholder
  } // end of found the clicked list item
});

var sppSearchModal = document.getElementById('vnSppSearchScreen');
var sppSearchInput = document.getElementById('search-box');
sppSearchInput.addEventListener("input", updateMatchList);
sppSearchModal.addEventListener('shown.bs.modal', function () {
  sppScreenComplete = false; // flag, if screen dismissed, to stop location ticker
  sppSearchInput.value = "";
  match_list.innerHTML = "";
  sppSearchInput.focus();
  // start acquiring location, in anticipation of the species
  targetAccuracyOK = false;
  accuracyAccepted = false;
  whatIsAwaitingAccuracy = "spp_itm"; // may be overridden if placeholder, but
    // here makes screen update work correctly in checkPositionAccuracy loop
  latestLocation = undefined; // start fresh
  locationTickerInterval = 500; // every half second for Species
  console.log("about to call startTrackingPosition");
  startTrackingPosition();
});

sppSearchModal.addEventListener('hidden.bs.modal', function () {
  if (!sppScreenComplete) { // screen was dismissed
    // stop the location ticker
    clearInterval(periodicLocationCheckFlag);
    stopTrackingPosition();
    console.log("Location ticker stopped by 'vnSppSearchScreen' dismiss");
    sppScreenComplete = true;
  } else {
    console.log("Location ticker allowed to run for normal acquire");
  }
});

var vnAddSiteButton = document.getElementById('btn-add-site');
var vnSiteDate = document.getElementById('site_date');
var vnSiteLocation = document.getElementById("site_location");

function startTrackingPosition() {
  if (locationsGranted) { // skip querying permission, which slows down GPS acquire 
    // and causes more frequent "no location" messages
    console.log("locationsGranted = true, don't query location permission");
    // a bit much repeated code, but worth it for speed and user experience
    if (navigator.geolocation) {
      browser_supports_geolocation = true;
      position_tracker_id = navigator.geolocation.watchPosition(trackPosition,
          locationError, locationOptions);
    } else {
      browser_supports_geolocation = false;
    }
    console.log("about to start location checking ticker");
    periodicLocationCheckFlag = setInterval(checkPositionAccuracy, locationTickerInterval);
  } else { // location access not granted yet, or app was reloaded and doesn't know it yet
    navigator.permissions.query({name:'geolocation'}).then((result) => {
      // diagnostics
      console.log("geolocation.permissions.state = " + result.state);
      switch (result.state) {
        case 'denied':
          console.log("location persmission denied");
          // if the user has denied location requests, block all such requests
          // without starting location checking, because the loop would never end
          warnLocationDenied();
          break;
        case 'granted':
          console.log("location persmission granted");
          if (navigator.geolocation) {
            browser_supports_geolocation = true;
            position_tracker_id = navigator.geolocation.watchPosition(trackPosition,
                locationError, locationOptions);
            console.log("about to set locationsGranted = true");
            locationsGranted = true; // skip querying permission from now on
          } else {
            browser_supports_geolocation = false;
          }
          console.log("about to start location checking ticker");
          periodicLocationCheckFlag = setInterval(checkPositionAccuracy, locationTickerInterval);
          break;
        case 'prompt':
          console.log("location persmission prompt");
          if (firstLocRequest) { // catch before the first prompt, and notify user they
            // need to Allow locations
            // cancel this modal and show the message
            bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
            var vnAllowLoc = new bootstrap.Modal(document.getElementById('vnAllowLocationsScreen'), {
              keyboard: false
            });
            vnAllowLoc.show();
            firstLocRequest = false;
            return 'prompt, first time';
          } else { // attempt location, which will show the prompt
            if (navigator.geolocation) {
              browser_supports_geolocation = true;
              position_tracker_id = navigator.geolocation.watchPosition(trackPosition,
                  locationError, locationOptions);
            } else {
              browser_supports_geolocation = false;
            }
            console.log("about to start location checking ticker");
            periodicLocationCheckFlag = setInterval(checkPositionAccuracy, locationTickerInterval);
          }
          break;
        default:
          // do nothing 
      }
    });
  }
};

function warnLocationDenied() {
  // if location denied, hide the screen that is waiting for locations,
  // and show the user an explanation
  switch (whatIsAwaitingAccuracy) {
    case "site":
      // most likely, first use of location attempt
      // 'hidden' event will stop any location acquire ticker
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
      break;
    case "spp_itm":
      // could happen on browsers that allow dismissing Allow/Block location dialog
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
      break;
    case "new_plholder":
      // this one is unlikely
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnPlaceholderInfoScreen')).hide();
      break;
    default:
      // do nothing
  }
  // show the message
  var vnLocDenied = new bootstrap.Modal(document.getElementById('vnLocationsDeniedScreen'), {
    keyboard: false
  });
  vnLocDenied.show();
}

function warnBadSafari() {
  // if 'PERMISSION_DENIED' error, and testing found Safari browser
  // hide the screen that is waiting for locations,
  // and show the user an explanation
  switch (whatIsAwaitingAccuracy) {
    case "site":
      // most likely, first use of location attempt
      // 'hidden' event will stop any location acquire ticker
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
      break;
    case "spp_itm":
      // could happen on browsers that allow dismissing Allow/Block location dialog
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
      break;
    case "new_plholder":
      // this one is unlikely
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnPlaceholderInfoScreen')).hide();
      break;
    default:
      // do nothing
  }
  // show the message
  var vnBumSafari = new bootstrap.Modal(document.getElementById('vnBadSafariScreen'), {
    keyboard: false
  });
  vnBumSafari.show();
}

function stopTrackingPosition() {
  try {
    navigator.geolocation.clearWatch(position_tracker_id);
    console.log("stopTrackingPosition.clearWatch no error");
  } catch(err) {
    console.log('error in "stopTrackingPosition": ' + err.message
      + ', possibly trying after already stopped');
  }
}

function trackPosition(position) {
  // called every time postion changes
  latestLocation = position;
}

function locationError(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
  switch(err.code) {
    case err.PERMISSION_DENIED:
      // user may have denied permission, or could be unsupported by browser
      // known unsupported in Safari before version 16 (Released 2022-09-12)
      // attempt to check if the current browser is Safari
      var isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (isSafari) {
        // Extract the Safari version number
        var safariVersion = navigator.userAgent.match(/Version\/([\d.]+)/);
        
        if (safariVersion) {
          // Display the Safari version
          console.log('Safari version:', safariVersion[1]);
        } else {
          // Safari version not found
          console.log('Safari version could not be detected');
        }
        // in either case, display the warning
        warnBadSafari();

        // vnBadSafariScreen
      } else {
        // Not Safari browser
        console.log('Not using Safari');
        // assume user denied
        console.warn("User denied the request for Geolocation.");
        // following will detect which, if any, screen is awaiting location,
        // will 'hide' that screen, and that screen's 'hidden' will stop ticker
        warnLocationDenied();        
      }
      break;
    case err.POSITION_UNAVAILABLE:
      console.warn("Location information is unavailable.");
      break;
    case err.TIMEOUT:
      console.warn("The request to get user location timed out.");
      break;
    case err.UNKNOWN_ERROR:
      console.warn("An unknown Geolocation error occurred.");
      break;
  }
}

function checkPositionAccuracy() {
  // called peridocally, until position is accurate enough
  console.log("entered checkPositionAccuracy");
  if (latestLocation === undefined) {
    console.log("latestLocation not yet defined");
    return;
  }
  console.log("Location accuracy " + latestLocation.coords.accuracy.toFixed(2) + " meters");
  let targetAcc = 0;
  switch(whatIsAwaitingAccuracy) {
    case "site":
      targetAcc = siteLocTargetAccuracy;
      if (latestLocation.coords.accuracy <= siteLocTargetAccuracy) {
        targetAccuracyOK = true;
      }
      if (!locationDeferred) {
        let stLoc = "Latitude: " + latestLocation.coords.latitude +
            "<br>Longitude: " + latestLocation.coords.longitude;
        if (!targetAccuracyOK) {
          stLoc += "<br>Target accuracy: " + siteLocTargetAccuracy + " meters";
        }
        stLoc += "<br>Accuracy: " + latestLocation.coords.accuracy.toFixed(1) + " meters";
        vnSiteLocation.innerHTML = stLoc;
      }
      break;
    case "spp_itm":
      targetAcc = sppLocTargetAccuracy;
      if (latestLocation.coords.accuracy <= sppLocTargetAccuracy) {
        targetAccuracyOK = true;
      }
      // don't display anything for species
      break;
    case "new_plholder":
      // use same target accuracy as for species
      targetAcc = sppLocTargetAccuracy;
      if (latestLocation.coords.accuracy <= sppLocTargetAccuracy) {
        targetAccuracyOK = true;
      }
      if (placeholder_state === "new" && !locationDeferred) {
        // display the updating location
        document.getElementById('placeholder_location').innerHTML
             = '(' + cur_placeholder.latitude
             + ', ' + cur_placeholder.longitude
             + '), accuracy ' + cur_placeholder.accuracy + ' m';
      }
      break;
    default:
      // do nothing
  }
  if (targetAccuracyOK) { // done getting location
    console.log("Target accuracy of " + targetAcc + " meters achieved");
    clearInterval(periodicLocationCheckFlag);
    stopTrackingPosition();
    if (locationDeferred) {
      // 'waiting for target accuracy' has been up, hide it
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnWaitForAccuracyScreen')).hide();
      // that screen's 'hidden' event will update the appropriate item
    }
  } else { // keep on acquring location
    console.log("Not yet to target accuracy of " + targetAcc + " meters");
    if (locationDeferred) {
        // if 'waiting for target accuracy' is up, update the display
      let stLocInfo = "Latitude: " + latestLocation.coords.latitude +
          "<br>Longitude: " + latestLocation.coords.longitude;
      if (!targetAccuracyOK) {
        stLocInfo += "<br>Target accuracy: " + targetAcc + " meters";
      }
      stLocInfo += "<br>Accuracy: " + latestLocation.coords.accuracy.toFixed(1) + " meters";
      document.getElementById('waiting_location_accuracy_info').innerHTML = stLocInfo;
      let stAcceptAcc = "Accept " + latestLocation.coords.accuracy.toFixed(1) + " meters?";
      document.getElementById('btn_accept_accuracy').innerHTML = stAcceptAcc;
    }
  }
  return;
}

var vnSiteName = document.getElementById('site_name');
var vnSiteNotes = document.getElementById('site_notes');

document.getElementById('vnSiteInfoScreen').addEventListener('shown.bs.modal', function (event) {
  siteScreenComplete = false; // flag to stop the location ticker if this screen dismissed
  // start fresh
  vnSiteName.value = ""; // user entry
  vnSiteNotes.value = ""; // user entry
  vnSiteDate.innerHTML = ""; // fill in almost immediately, below
  vnSiteLocation.innerHTML = ""; // fill in by location ticker
	vnSiteDate.innerHTML = new Date().toString();
  targetAccuracyOK = false;
  accuracyAccepted = false;
  whatIsAwaitingAccuracy = "site";
  latestLocation = undefined; // start fresh
  locationTickerInterval = 2000; // every 2 seconds for sites
  console.log("about to call startTrackingPosition");
  startTrackingPosition();
});

document.getElementById('vnSiteInfoScreen').addEventListener('hidden.bs.modal', function (event) {
	console.log("In 'vnSiteInfoScreen' modal Hide event");
  if (!siteScreenComplete) { // screen was dismissed
    // stop the location ticker
    clearInterval(periodicLocationCheckFlag);
    stopTrackingPosition();
    console.log("Location ticker stopped by 'vnSiteInfoScreen' dismiss");
    siteScreenComplete = true;
  } else {
    console.log("Location ticker allowed to run for normal acquire");
  }
});

document.getElementById('btn-save-site-info').addEventListener('click', function () {
  if (latestLocation === undefined) {
    alert("Try again, still reading location");
    return;
  }
	let SiteNameString = vnSiteName.value.toString().trim();
//	console.log('site_name : '+ SiteNameString);
	// do verification
  if (SiteNameString.length < 3) {
    alert("Need a site name at least 3 characters long");
    vnSiteName.value = SiteNameString; // in case some whitespace was there
    vnSiteName.focus();
    return;
  }
  let SiteNotesString = vnSiteNotes.value.toString().trim();
//  console.log('site_notes : '+ SiteNotesString);
  if (SiteNotesString.length < 3) {
    alert("Need some site notes, at least 3 characters");
    vnSiteNotes.value = SiteNotesString; // in case some whitespace was there
    vnSiteNotes.focus();
    return;
  }

  // store data
  let st_create_date = new Date();
  let site_obj = {
    // multiple sites would never be created in the same millisecond, so id
    // would be unique
    // if 'id' used as HTML element id, prefix assures it does not start with a number
    "id": 'si_' + st_create_date.getTime().toString(),
    "name": SiteNameString,
    "notes": SiteNotesString,
    "date": st_create_date,
    "latitude": "" + latestLocation.coords.latitude,
    "longitude": "" + latestLocation.coords.longitude,
    "accuracy": "" + latestLocation.coords.accuracy.toFixed(1)
  };
  current_site_id = site_obj.id;
  // new item at the beginning
  site_info_array.unshift(site_obj);
  bkupSiteList();
  siteScreenComplete = true; // flag, don't need to stop the ticker when this screen hidden

  // if flagged, check that target accuracy was met
  if (waitForSiteLocTarget && !targetAccuracyOK) {
    accuracyAccepted = false; // can be manually accepted
    locationDeferred = true;
    whatIsAwaitingAccuracy = "site"; // redundant? set in Show event
    bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
    var vnAwaitAcc = new bootstrap.Modal(document.getElementById('vnWaitForAccuracyScreen'), {
      keyboard: false
    });
    vnAwaitAcc.show();
  } else { // finish up
    // ticker may already be stopped if targetAccuracyOK
    clearInterval(periodicLocationCheckFlag);
    stopTrackingPosition();
    accuracyAccepted = true;
    locationDeferred = false;
    latestLocation = undefined;
    whatIsAwaitingAccuracy = "";
    // dismiss this modal
    console.log('About to hide the Site Info modal');
    bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
    shwSitesTimeout = setTimeout(showSites, 10); // trigger to refresh site list
    aux_spec_for = "sites";
    enterAnyAuxData();
  }
});

vnWaitForAccuracyScreen.addEventListener('shown.bs.modal', function () {});

vnWaitForAccuracyScreen.addEventListener('hidden.bs.modal', function () {
  console.log("In 'Wait for Accuracy' accuracyAccepted = " + accuracyAccepted);
  let itmToUpdate = undefined;
  switch(whatIsAwaitingAccuracy) {
    case "site":
      itmToUpdate = site_info_array.find(i => i.id == current_site_id);
      aux_spec_for = "sites"; // in case we need this
      break;
    case "spp_itm":
      itmToUpdate = site_spp_array.find(i => i.id == current_spp_item_id);
      aux_spec_for = "spp_items"; // in case we need this
      break;
    case "new_plholder":
      itmToUpdate = placeholders_array.find(i => i.id == current_ph_id);
      // For each new placeholder definition, deferred for target accuracy,
      // a site instance of the placeholder has been "riding along", its accuracy
      // also deferred. Update it now
      let phItm = site_spp_array.find(i => i.id == current_spp_item_id);
      if (phItm !== undefined) {
        phItm.latitude = "" + latestLocation.coords.latitude;
        phItm.longitude = "" + latestLocation.coords.longitude;
        phItm.accuracy = "" + latestLocation.coords.accuracy.toFixed(1);
        console.log("Updated deferred placeholder item, id=" + phItm.id);
        bkupPlaceholders();
      }
      aux_spec_for = "spp_items"; // in case we need this
      break;
    default:
      // do nothing
  }
  if (itmToUpdate !== undefined) {
    itmToUpdate.latitude = "" + latestLocation.coords.latitude;
    itmToUpdate.longitude = "" + latestLocation.coords.longitude;
    itmToUpdate.accuracy = "" + latestLocation.coords.accuracy.toFixed(1);
    console.log("Updated latest " + whatIsAwaitingAccuracy + ", id=" + itmToUpdate.id);
  }

  switch(whatIsAwaitingAccuracy) {
    case "site":
      bkupSiteList();
//      aux_spec_for = "sites"; // in case we need this
      break;
    case "spp_itm":
      bkupSpeciesList();
//      aux_spec_for = "spp_items"; // in case we need this
      break;
    case "new_plholder":
      bkupPlaceholders();
//      aux_spec_for = "spp_items"; // in case we need this
      break;
    default:
      // do nothing
  }

  console.log("About to clear 'periodicLocationCheckFlag' in 'Wait for Accuracy'");
  clearInterval(periodicLocationCheckFlag);
  console.log("In 'Wait for Accuracy', about to stopTrackingPosition");
  stopTrackingPosition();
  locationDeferred = false;
  accuracyAccepted = false;
  targetAccuracyOK = false;
  latestLocation = undefined;
  whatIsAwaitingAccuracy = "";
  // refresh data, no matter what
  shwSitesTimeout = setTimeout(showSites, 10);
  // ask for AuxData, if any
  enterAnyAuxData();
});

document.getElementById('btn_accept_accuracy').addEventListener('click', function () {
  accuracyAccepted = true;
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnWaitForAccuracyScreen')).hide();

});

var site_card_hdr = document.getElementById('siteCardHeader');

function showSites() {
  // show the current site data
  if (site_info_array.length == 0) {
    site_card_hdr.innerHTML = '(No sites yet)';
    current_site_id = "";
    return;
  };

  // for testing, run this
 // findRegion();

  console.log("in 'showSites()', about to display current site name");

  
  console.log("in 'showSites()', about to generate list of sites");
  // for testing, 'new...' first
  let sites_listitems = '<li class="dropdown-item" id = "siteAddNew"><h3>(Add new site)</h3></li>';
  site_info_array.forEach((obj, index) => {
    if (obj.id == current_site_id) {
      console.log('current_site_id is ' + current_site_id + ', for site "' + obj.name + '"');
      site_card_hdr.innerHTML = '' + obj.name;
    }
    sites_listitems += '<li class="dropdown-item" id = "' + obj.id + '"><h3>' +  obj.name + '</h3></li>';
  });
  sitesNewOrAddList.innerHTML = sites_listitems;

  // fill in species list for this site
  let this_site_spp_array = site_spp_array.filter(spp_obj =>
      spp_obj.site_id === current_site_id)
      .sort((s1, s2) => (s1.date < s2.date) ? 1 : ((s1.date > s2.date) ? -1 : 0));
  let this_site_spp_list = document.getElementById('sppListForCurSite');
  let spp_listitems_string = "";
  if (this_site_spp_array.length == 0) {
    this_site_spp_list.innerHTML = '<li>no species yet</li>';
    return;
  }
  this_site_spp_array.forEach(spp_obj => {
    // both real species and placeholders have a display field 'species'
    if (spp_obj.type === "ph") { // a placeholder
      spp_listitems_string += '<li id="' + spp_obj.id + '">'
        + spp_obj.species;
      // placeholders do not have Uncertainty
    } else { // a real species
      let sst = spp_obj.species;
      if (spp_obj.uncertainty == "species") {
        sst = "Most likely " + spp_obj.species + ", but can't determine species."
      }
      if (spp_obj.uncertainty == "genus") {
        sst = "Probably " + spp_obj.species + ", but unsure at genus level."
      }
      spp_listitems_string += '<li id="' + spp_obj.id + '">' + sst ;
    };
    // add any auxData
    let aDArr = aux_data_array.filter(a => a.parent_id == spp_obj.id);
    aDArr.forEach(a => {
      spp_listitems_string += ', ' + a.name + ' = ' + a.value;
    });
    spp_listitems_string += '</li>'; // finish the list item
  });
  this_site_spp_list.innerHTML = spp_listitems_string;
  // add a listener to the species list
  // From what I have been able to find out, event listeners are deleted with the
  // element if there are no refernces to that element, so re-creating them each
  // time like this should work.
  this_site_spp_list.addEventListener('click', function (e) {
    // spp list is parent of all the list items
    var target = e.target; // Clicked element
    while (target && target.parentNode !== this_site_spp_list) {
      target = target.parentNode; // If the clicked element isn't a direct child
      if(!target) { return; } // If element doesn't exist
    }
    if (target.tagName === 'LI') { // tagName returns uppercase
      current_spp_item_id = target.id; // store in global, to track which item worked on
//        console.log("list ID: " + e.currentTarget.id);
//        console.log("item ID: " + current_spp_item_id);
//        let spp = target.textContent;
//        console.log(spp);
      var vnSppDtlModal = new bootstrap.Modal(document.getElementById('vnSppDetailScreen'), {
        keyboard: false
      });
      vnSppDtlModal.show();
    };
  }); // end of filling in species list  for current site
}; // end of fn showSites

// Why does the following work? Is 'vnSppDetailScreen' and object readable by its ID?
vnSppDetailScreen.addEventListener('shown.bs.modal', function (event) {
//  alert("in vnSppDetailScreen 'shown.bs.modal'");
  let detailed_spp_item = site_spp_array.find(itm => itm.id === current_spp_item_id);
  if (current_spp_item_id === "undefined") {
    return;
  }
  document.getElementById('spp-for-details').innerHTML = detailed_spp_item.species;

  // it makes no sense to apply uncertainty to Placeholders, hide those buttons
  // (you either know it's the same thing you already entered as a Placeholder, 
  // or you make up a new Placeholder)
  for (let bt of document.getElementsByClassName("hide-for-ph")) {
    if (detailed_spp_item.type === "ph") { // a placeholder
      bt.style.display = "none";
    } else {
      bt.style.display = "block";
    }
  }
  document.getElementById('spp-detail-location').innerHTML
    = '(' + detailed_spp_item.latitude
    + ', ' + detailed_spp_item.longitude
    + '), accuracy ' + detailed_spp_item.accuracy + ' m';
  document.getElementById('spp-detail-timestamp').innerHTML
    = detailed_spp_item.date;
});

document.getElementById('btn-delete-spp-item').addEventListener('click', function (e) {
//  var target = e.target; // Clicked element
// console.log("in click event for 'btn-delete-spp-item'");
 bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppDetailScreen')).hide();
 // first, remove any AuxData
 aux_data_array = aux_data_array.filter(d => d.parent_id != current_spp_item_id);
 bkupAuxData();
 let i = site_spp_array.findIndex(itm => itm.id === current_spp_item_id);
 site_spp_array.splice(i, 1);
 bkupSpeciesList();
 showSites();
});

document.getElementById('btn-mark-uncertain-spp').addEventListener('click', function (e) {
// console.log("in click event for 'btn-mark-uncertain-spp'");
 site_spp_array.find(itm => itm.id === current_spp_item_id).uncertainty = "species";
 bkupSpeciesList();
 bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppDetailScreen')).hide();
 showSites();
});

document.getElementById('btn-mark-uncertain-genus').addEventListener('click', function (e) {
// console.log("in click event for 'btn-mark-uncertain-genus'");
 site_spp_array.find(itm => itm.id === current_spp_item_id).uncertainty = "genus";
 bkupSpeciesList();
 bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppDetailScreen')).hide();
 showSites();
});

document.getElementById('btn-mark-not-uncertain').addEventListener('click', function (e) {
// console.log("in click event for 'btn-mark-not-uncertain'");
 site_spp_array.find(itm => itm.id === current_spp_item_id).uncertainty = "";
 bkupSpeciesList();
 bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppDetailScreen')).hide();
 showSites();
});

// Why does the following work? Is 'vnPhListScreen' and object readable by its ID?
vnPhListScreen.addEventListener('shown.bs.modal', function (event) {
  let ph_list_html = "";
  if (placeholders_array.length == 0) {
    ph_list_html = '<li>(No placeholders yet)</li>';
  } else {
    placeholders_array.forEach(ph => {
      ph_list_html += '\n<li class="ph_title" id="'
        + encodeURIComponent(ph.code)+ '">\n'
        + ph.code + ': ' + ph.keywords.join(" ")  + '</li>';
    });
  };
  document.getElementById("ph_list").innerHTML = ph_list_html;
});

// Why does the following work? Is 'vnPlaceholderInfoScreen' and object readable by its ID?
vnPlaceholderInfoScreen.addEventListener('shown.bs.modal', function (event) {
//  alert("in vnPlaceholderInfoScreen 'shown.bs.modal'");
  if (current_ph_code === "" || cur_placeholder === undefined) {
    document.getElementById('placeholder_code_label').innerHTML = "(no code)";
    document.getElementById('placeholder_keywords').value = "";
    document.getElementById('placeholder_location').innerHTML = "(no location)";
    document.getElementById('placeholder_date').innerHTML = "(no date)";
    document.getElementById('placeholder_pix').innerHTML = "(no pix)";
    return;
  }
  if (placeholder_state === "new") {
    document.getElementById('placeholder_code_label').innerHTML
        = 'New placeholder "' + cur_placeholder.code + '"';
    phScreenComplete = false; // flag to delete incomplete placeholder if screen dismissed
  }
  if (placeholder_state === "edit") {
    document.getElementById('placeholder_code_label').innerHTML
        = 'Editing placeholder "' + cur_placeholder.code + '"';
    phScreenComplete = true; // don't delete this placeholder, even if screen dismissed
  }
  document.getElementById('placeholder_keywords').value
      = cur_placeholder.keywords.join(" ");
  document.getElementById('placeholder_location').innerHTML
       = '(' + cur_placeholder.latitude
       + ', ' + cur_placeholder.longitude
       + '), accuracy ' + cur_placeholder.accuracy + ' m';
   document.getElementById('placeholder_date').innerHTML
       = cur_placeholder.date;
  showPhPix();
});

vnPlaceholderInfoScreen.addEventListener('hidden.bs.modal', function (event) {
  bkupPlaceholders();
  if (phScreenComplete) { // any Placeholder edits will have to go past this point
    console.log("in 'vnPlaceholderInfoScreen.hidden', placeholder_state = " + placeholder_state);
    console.log("in 'vnPlaceholderInfoScreen.hidden', cur_placeholder");
    console.log(cur_placeholder);
    // get all the species items that are based on the current placeholder
    site_spp_array.filter(itm => itm.ph_id === cur_placeholder.id)
      .map(itm => { return itm.id; }).forEach(iid => {
        // update any fields that may have changed
        console.log("in 'vnPlaceholderInfoScreen.hidden', updating placeholder spp item " + iid);
        let sp_elem = site_spp_array.find(i => i.id === iid);
        console.log("in 'vnPlaceholderInfoScreen.hidden', sp_elem");
        console.log(sp_elem);
        sp_elem.keywords = cur_placeholder.keywords.join(" ").split(" ");
        sp_elem.species = cur_placeholder.code + ': ' + cur_placeholder.keywords.join(" ");
        sp_elem.latitude = (sp_elem.latitude == "") ? cur_placeholder.latitude : sp_elem.latitude;
        sp_elem.longitude = (sp_elem.longitude == "") ? cur_placeholder.longitude : sp_elem.longitude;
        sp_elem.accuracy = (sp_elem.accuracy == "") ? cur_placeholder.accuracy : sp_elem.accuracy;
      });
  } else { //  !phScreenComplete,  occurs if screen dismissed by "X" button
    // new placeholder was never completed, remove it from the array
    cur_placeholder = undefined; // unattach any reference
    // remove the incomplete placeholder
    console.log('about to remove incomplete Placeholder "'
      + placeholders_array.find(p => p.id === current_ph_id).code + '"');
    placeholders_array = placeholders_array.filter(ph => ph.id != current_ph_id);
    bkupPlaceholders();
    // remove any species item for it
    var i;
    while ((i = site_spp_array.findIndex(itm => itm.ph_id === current_ph_id)) > -1) {
      console.log('about to remove incomplete Ph item "'
        + site_spp_array[i].species + '"');
      site_spp_array.splice(i, 1);
      bkupSpeciesList();
    }
    // stop the locations ticker
    clearInterval(periodicLocationCheckFlag);
    stopTrackingPosition();
    accuracyAccepted = true;
    locationDeferred = false;
    latestLocation = undefined;
    whatIsAwaitingAccuracy = "";
  }
  // flag that work is finished
  placeholder_state = ""
  cur_placeholder = undefined;
  current_ph_code = "";
  showSites();
});

function showPhPix() {
  let ph_pix_html = "";
  try {
    if (cur_placeholder.photos.length == 0) {
      ph_pix_html = "no photos yet"
    } else {
      ph_pix_html += '    <div class="container">'
         + '\n               <div class="row imagetiles">';
      cur_placeholder.photos.forEach(itm => {
        ph_pix_html += '<div class="col-lg-3 col-md-3 col-sm-3 col-xs-6">'
           + '<img src=' + URL.createObjectURL(itm)
           + ' class="img-responsive">'
           + '</div>';
      });
      ph_pix_html += '    </div>\n               </div>';
    }
  } catch(err) {
    ph_pix_html = err.message;
  }
  console.log(ph_pix_html);
  document.getElementById('placeholder_pix').innerHTML = ph_pix_html;
}

document.getElementById('ph_list').addEventListener('click', function (e) {
  // list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== document.getElementById('ph_list')) {
      target = target.parentNode; // If the clicked element isn't a direct child
      if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    // the element id is encodeURIComponent(ph.code), to assure no spaces
    //
    current_ph_code = decodeURIComponent(target.id);
//    console.log("current_ph_code = " + current_ph_code);
    // get ph record
    cur_placeholder = placeholders_array.find(ph => ph.code == current_ph_code);
    placeholder_state = "edit";
    // close this screen
    bootstrap.Modal.getOrCreateInstance(document.getElementById('vnPhListScreen')).hide();
    // open ph for editing
    var vnPhInfoModal = new bootstrap.Modal(document.getElementById('vnPlaceholderInfoScreen'), {
      keyboard: false
    });
    vnPhInfoModal.show()
  }
});

document.getElementById('ph-img-file-input').addEventListener('change', () => {
//  console.log('ph-img-file-input file input change');
//  console.log(document.getElementById('ph-img-file-input').files.length + ' files chosen');
  let img_files = [];
  for (const ph_file of document.getElementById('ph-img-file-input').files) {
//    console.log('' + ph_file.name);
//    console.log('type ' + ph_file.type);
    if (ph_file.type.match(/^image\//)) {
//      console.log('file is an image: ' + ph_file.name + '');
      if (ph_file.name.length > 30) {
        // find a better way to detect if the photo was taken by carmera from
        //  within the file input browse, than just the long filename
        alert("Take pictures outside this app.");
        return;
      } else {
        img_files.unshift(ph_file);
//        console.log('URL: ' + URL.createObjectURL(ph_file));
      }
//      ph_pix_html += '<div><img src="' + URL.createObjectURL(ph_file) + '" alt="a picture"></div>';
    }
  }

  if (img_files.length > 0) {
    cur_placeholder.photos = img_files.concat(cur_placeholder.photos);
    bkupPlaceholders();
    showPhPix();
  }
});

document.getElementById('btn-add-ph-pix').addEventListener('click', () => {
  // allows clicking button, which fits in with page layout, to get pictures
  // rather than using the file input
  if (document.getElementById('ph-img-file-input')) {
    document.getElementById('ph-img-file-input').click();
  }
}, false);

document.getElementById('btn-save-placeholder-info').addEventListener('click', function (e) {
  let phKeywordsString = document.getElementById('placeholder_keywords').value.toString().trim();
  let phKeywordsArray = phKeywordsString.split(" ").filter(st => st.length > 2);
  if (phKeywordsArray.length < 2) {
    alert("Need a few keywords, to find this placeholder later");
    document.getElementById('placeholder_keywords').focus();
    return;
  }
  cur_placeholder.keywords = phKeywordsArray;
  bkupPlaceholders();
  if (placeholder_state === "new") {
    phScreenComplete = true; // don't delete this placeholder on modal.hide
    // may need to defer the location

    if (waitForSppLocTarget && !targetAccuracyOK) {
      current_ph_id = cur_placeholder.id; // current_ph_id is the general placeholder
      // current_spp_item_id is the instance of the placeholder
      accuracyAccepted = false; // can be manually accepted
      locationDeferred = true;
      whatIsAwaitingAccuracy = "new_plholder";
      bootstrap.Modal.getOrCreateInstance(document.getElementById('vnPlaceholderInfoScreen')).hide();
      var vnAwaitAcc = new bootstrap.Modal(document.getElementById('vnWaitForAccuracyScreen'), {
        keyboard: false
      });
      vnAwaitAcc.show();
      return; // don't continue with defaults below
    } else { // finish up
      // ticker may already be stopped if targetAccuracyOK
      clearInterval(periodicLocationCheckFlag);
      stopTrackingPosition();
      accuracyAccepted = true;
      locationDeferred = false;
      latestLocation = undefined;
      whatIsAwaitingAccuracy = "";
    }
  } // end of placeholder_state === "new"
  // trigger to refresh site list
  shwSitesTimeout = setTimeout(showSites, 10);
  // clear the keywords
  document.getElementById('placeholder_keywords').value = "";

  // dismiss the modal
  console.log('About to hide the Save Placeholder modal');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnPlaceholderInfoScreen')).hide();
});

function insertPlHolderItm() {
  // inserts a species item into site_spp_array for the current placeholder
  // assumes these globals: current_site_id, cur_placeholder, latestLocation
  // returns the id of the newly inserted element in site_spp_array
  // use the code and keywords as one string "species"
  let ph_entry_date = new Date();
  let new_ph_item = {
    // if 'id' used as HTML element id, prefix assures it does not start with a number
    "id": 'ph_' + ph_entry_date.getTime().toString(),
    "site_id": current_site_id,
    "type": 'ph', // a placeholder, vs. 'sp' for a real species
    "ph_id": cur_placeholder.id, // allows for lookup
    "code": cur_placeholder.code,
    "keywords": cur_placeholder.keywords,
    "species": cur_placeholder.code + ': ' + cur_placeholder.keywords.join(" "),
    "date": ph_entry_date,
    "latitude": "" + latestLocation.coords.latitude,
    "longitude": "" + latestLocation.coords.longitude,
    "accuracy": "" + latestLocation.coords.accuracy.toFixed(1)
  };
  site_spp_array.unshift(new_ph_item);
  bkupSpeciesList();
  return new_ph_item.id;
}

document.getElementById('btn-add-aux-spec-for-site').addEventListener('click', function (e) {
  aux_spec_state = "new";
  aux_spec_for = "sites";
//  console.log('About to hide the Aux Data List modal');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataListScreen')).hide();
  var vnAxSpcDtl = new bootstrap.Modal(document.getElementById('vnAuxDataSpecInfoScreen'), {
    keyboard: false
  });
  vnAxSpcDtl.show();
});

document.getElementById('btn-add-aux-spec-for-spp').addEventListener('click', function (e) {
  aux_spec_state = "new";
  aux_spec_for = "spp_items";
//  console.log('About to hide the Aux Data List modal');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataListScreen')).hide();
  var vnAxSpcDtl = new bootstrap.Modal(document.getElementById('vnAuxDataSpecInfoScreen'), {
    keyboard: false
  });
  vnAxSpcDtl.show();
});

document.getElementById('aux-specs-list-for-sites').addEventListener('click', function (e) {
  // list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== document.getElementById('aux-specs-list-for-sites')) {
    target = target.parentNode; // If the clicked element isn't a direct child
    if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    current_aux_spec_id = target.id;
    aux_spec_state = "edit";
    aux_spec_for = "sites";
    bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataListScreen')).hide();
    var vnAxSpcDtl = new bootstrap.Modal(document.getElementById('vnAuxDataSpecInfoScreen'), {
      keyboard: false
    });
    vnAxSpcDtl.show();
  }
});

document.getElementById('aux-specs-list-for-spp').addEventListener('click', function (e) {
  // list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== document.getElementById('aux-specs-list-for-spp')) {
    target = target.parentNode; // If the clicked element isn't a direct child
    if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    current_aux_spec_id = target.id;
    aux_spec_state = "edit";
    aux_spec_for = "spp_items";
    bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataListScreen')).hide();
    var vnAxSpcDtl = new bootstrap.Modal(document.getElementById('vnAuxDataSpecInfoScreen'), {
      keyboard: false
    });
    vnAxSpcDtl.show();
  }
});

vnAuxDataListScreen.addEventListener('shown.bs.modal', function (event) {
  let sitesAuxSpecs = "";
  let sppAuxSpecs = "";
  aux_specs_array.forEach(auxSpec => {
    let auxSpecListItm = '<li id="' + auxSpec.id + '">'
      + '&quot;' + auxSpec.name + '&quot;, '
      + (auxSpec.default === "" ? 'no default, ' : 'default = ' + auxSpec.default + ', ')
      + (auxSpec.min === "" ? 'no minimum, ' : 'minimum = ' + auxSpec.min + ', ')
      + (auxSpec.max === "" ? 'no maximum, ' : 'maximum = ' + auxSpec.max + ', ')
      + (auxSpec.required ? 'required' : 'optional') + '</li>';
    switch(auxSpec.for) {
      case "sites":
        sitesAuxSpecs += auxSpecListItm;
        break;
      case "spp_items":
        sppAuxSpecs += auxSpecListItm;
        break;
      default:
        // do nothing
    }
  });
  // for sites
  if (sitesAuxSpecs == '') {
    document.getElementById("none-yet-msg-aux-sites").innerHTML
      = '(not collecting any Auxiliary Date for Sites yet)';
    document.getElementById("aux-specs-list-for-sites").innerHTML = '';
  } else {
    document.getElementById("none-yet-msg-aux-sites").innerHTML = '';
    document.getElementById("aux-specs-list-for-sites").innerHTML = sitesAuxSpecs;
  }
  // for species items
  if (sppAuxSpecs == '') {
    document.getElementById("none-yet-msg-aux-spp").innerHTML
      = '(not collecting any Auxiliary Date for Species yet)';
    document.getElementById("aux-specs-list-for-spp").innerHTML = '';
  } else {
    document.getElementById("none-yet-msg-aux-spp").innerHTML = '';
    document.getElementById("aux-specs-list-for-spp").innerHTML = sppAuxSpecs;
  }
});

vnAuxDataSpecInfoScreen.addEventListener('shown.bs.modal', function (event) {
  switch(aux_spec_for) {
    case "sites":
      document.getElementById("aux-spec-hdr-msg").innerHTML = "Auxilary Data item to collect for sites"
      break;
    case "spp_items":
      document.getElementById("aux-spec-hdr-msg").innerHTML = "Auxilary Data to collect for species items"
      break;
    default:
      // do nothing
  }
  switch(aux_spec_state) {
    case "new":
      document.getElementById("inputAuxSpecName").value = "";
      document.getElementById("inputAuxSpecDefault").value = "";
      document.getElementById("inputAuxSpecMin").value = "";
      document.getElementById("inputAuxSpecMax").value = "";
      document.getElementById("ckAuxSpecRequired").checked = false;
      document.getElementById("btn-save-auxdata-spec").value = "Save";
      // no need to Delete a new item
      document.getElementById("btn-delete-auxdata-spec").style.visibility = "hidden";
      break;
    case "edit":
      let a = aux_specs_array.find(a => a.id == current_aux_spec_id);
      document.getElementById("inputAuxSpecName").value = a.name;
      document.getElementById("inputAuxSpecDefault").value = "" + a.default;
      document.getElementById("inputAuxSpecMin").value = "" + a.min;
      document.getElementById("inputAuxSpecMax").value = "" + a.max;
      document.getElementById("ckAuxSpecRequired").checked = a.required;
      document.getElementById("btn-save-auxdata-spec").value = "Save Changes";
      // this is the option to delete an existing spec
      document.getElementById("btn-delete-auxdata-spec").style.visibility = "visible";
      break;
    default:
      // do nothing
  }
});

document.getElementById('btn-save-auxdata-spec').addEventListener('click', function (e) {
  // the only thing required is 'name'
  let auxSpecNameString = document.getElementById("inputAuxSpecName").value.toString().trim();
  if (auxSpecNameString.length < 2) {
    alert("Need a name at least 2 characters long");
    document.getElementById("inputAuxSpecName").value = auxSpecNameString;
    document.getElementById("inputAuxSpecName").focus();
    return;
  }
  // create or update item
  switch(aux_spec_state) {
    case "new":
      let as_obj = {
        // not using all fields yet
        // if 'id' used as HTML element id, prefix assures it does not start with a number
        "id": 'as_' + new Date().getTime().toString(),
        "for": aux_spec_for,
        "name": auxSpecNameString,
        "type": "number",
        "default": "" + document.getElementById("inputAuxSpecDefault").value.toString().trim(),
        "min": "" + document.getElementById("inputAuxSpecMin").value.toString().trim(),
        "max": "" + document.getElementById("inputAuxSpecMax").value.toString().trim(),
        "required": document.getElementById("ckAuxSpecRequired").checked,
        "order": "0"
      };
      current_aux_spec_id = as_obj.id;
      // new item at the beginning
      aux_specs_array.unshift(as_obj);
      bkupAuxSpecs();
      break;
    case "edit":
      let a = aux_specs_array.find(a => a.id == current_aux_spec_id);
      a.name = auxSpecNameString;
      a.default = "" + document.getElementById("inputAuxSpecDefault").value.toString().trim();
      a.min = "" + document.getElementById("inputAuxSpecMin").value.toString().trim();
      a.max = "" + document.getElementById("inputAuxSpecMax").value.toString().trim();
      a.required = document.getElementById("ckAuxSpecRequired").checked;
      break;
    default:
      // do nothing
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataSpecInfoScreen')).hide();
});

document.getElementById('btn-delete-auxdata-spec').addEventListener('click', function (e) {
  // remove this specification, but retain any data for it already collected
  let ix = aux_specs_array.findIndex(s => {
    return s.id === current_aux_spec_id;
  });
  if (ix === -1) {
    alert("Aux Data spec to delete not found");
  } else {
    aux_specs_array.splice(ix, 1);
    bkupAuxSpecs();
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataSpecInfoScreen')).hide();
});

function enterAnyAuxData() {
  // if 'aux_spec_for' != "", it will be "sites" or "spp_items"
  if (aux_specs_array.filter(a => a.for == aux_spec_for).length > 0) {
    var vnAxDat = new bootstrap.Modal(document.getElementById('vnAuxDataEntryScreen'), {
      keyboard: false
    });
    vnAxDat.show();
  }
}

vnAuxDataEntryScreen.addEventListener('shown.bs.modal', function (event) {
  document.getElementById('auxdata_entry_inputs').innerHTML = "";
  let sArr = aux_specs_array.filter(a => a.for == aux_spec_for);
  // TODO sort by listing order
  if (sArr.length == 0) {return;} // should not happen
  var auxHdr = "";
  switch (aux_spec_for) {
    case "sites":
      auxHdr = 'For Site &quot;' + site_info_array.find(s => s.id == current_site_id).name + '&quot;';
      break;
    case "spp_items":
      auxHdr = 'For &quot;' + site_spp_array.find(s => s.id == current_spp_item_id).species + '&quot;';
      break;
    default:
  };

  document.getElementById('aux-entry-hdr-msg').innerHTML = auxHdr;
  var auxBlx = "";
  // The 'auxspec_' prefix for labels prevents them having the same id as 
  // the corresponding input. Otherwise, the input value reads as zero
  sArr.forEach(s => {
    // 'dt_' prefix distinguishes the <input> from the list item that otherwise
    // has the same ID in the 'vnAuxDataListScreen' modal
    let inpid = 'dt_'+ s.id;
    let lbldtls = '' + (s.min == "" ? 'no minimum, ' : 'minimum = ' + s.min + ', ')
    + (s.max == "" ? 'no maximum, ' : 'maximum = ' + s.max + ', ')
    + (s.required ? 'required' : 'optional');
    auxBlx += ""
    + '<div class="input-group mb-3">'
    + '<span class="input-group-text" id="auxspec-' + inpid
    + '"><h3>' + s.name + '</h3></span>'
    + '  <input type="number" id="' + inpid + '"'
    + ((s.default === "") ? '' : ' value="' + s.default + '"')
    + ((s.min === "") ? '' : ' min="' + s.min + '"')
    + ((s.max === "") ? '' : ' max="' + s.max + '"')
    + ' aria-describedby="auxspec-' + inpid + '" >'
    + '</div>'
    + '<span><h3>' + lbldtls + '</h3></span>'
    + '';
  });
  // console.log("auxBlx");
  // console.log(auxBlx);
  document.getElementById('auxdata_entry_inputs').innerHTML = auxBlx;
});

vnAuxDataEntryScreen.addEventListener('hidden.bs.modal', function (event) {
  document.getElementById('auxdata_entry_inputs').innerHTML = "";
  shwSitesTimeout = setTimeout(showSites, 10);
});

document.getElementById('btn-save-auxdata').addEventListener('click', function (e) {
  let sArr = aux_specs_array.filter(a => a.for == aux_spec_for);
  // console.log("sArr");
  // console.log(sArr);
  var aOK = true; // default until some vital test fails
    sArr.forEach(ck => {
      let inpid = 'dt_' + ck.id; // 'dt_' prefix distinguishes from the list item that otherwise
      // has the same ID in the 'vnAuxDataListScreen' modal
      let stCk = document.getElementById(inpid).value.toString().trim();
//      console.log('"' + ck.name + '", ' + 'id = ' + inpid 
//        + ', stCk = ' + stCk + ', value = ' + document.getElementById(inpid).value);
      if ((ck.required === true) && (stCk === "")) {
        alert('"' + ck.name + '" is required');
        document.getElementById(inpid).focus();
        aOK = false; // flag for when outside the current arrow fn
        return; // from the current arrow fn, iterating the array
      }
      if ((ck.min) && stCk && (Number(stCk) < Number(ck.min))) { // already checked if required
//        console.log('"' + ck.name + '" below minimum, correcting ' + stCk + ' to ' + ck.min);
        alert('"' + ck.name + '" was below minimum, corrected ' + stCk + ' to ' + ck.min);
        stCk = ck.min;
        document.getElementById(inpid).value = "" + stCk;
        // document.getElementById(inpid).focus();
        // aOK = false; // flag for when outside the current arrow fn
        // return; // from the current arrrow fn, iterating the array
      }
      if ((ck.max) && stCk && (Number(stCk) > Number(ck.max))) { // already checked if required
        console.log('"' + ck.name + '" above maximum, correcting ' + stCk + ' to ' + ck.max);
        alert('"' + ck.name + '" was above maximum, corrected ' + stCk + ' to ' + ck.max);
        stCk = ck.max;
        document.getElementById(inpid).value = "" + stCk;
        // document.getElementById(inpid).focus();
        // aOK = false; // flag for when outside the current arrow fn
        // return; // from the current arrrow fn, iterating the array
      }
    });
  // maybe other tests?
  if (!aOK) {return;}
  // If all tests passed, save AuxData
  // if the id of an input is an all-numeric string, the value always reads as
  // zero; I have no idea why, but the 'as_' prefix fixes that
  sArr.forEach(sp => {
    let inpid = 'dt_' + sp.id;
    console.log('"' + sp.name + '", id = ' + inpid + ', value = ' + document.getElementById(inpid).value);
    let stVal = document.getElementById(inpid).value;
    if (stVal === "") { // no need to save empties
      console.log('stVal === ""');
      if (stVal == "") {
        console.log('stVal == ""');
      } else {
        console.log('stVal != ""');
      }
    } else {
      console.log("Valid stVal = " + stVal);
      var parID = "";
      switch (sp.for) {
        case "sites":
          parID = current_site_id;
          break;
        case "spp_items":
          parID = current_spp_item_id;
          break;
        default:
      }
      let auxDObj = {
        // could there be dupicate ids? if created fast enough?
        // seems like no problem, will be fetched by parent_id
        // and all of them used
        // if 'id' used as HTML element id, prefix assures it does not start with a number
        "id": 'ad_' + new Date().getTime().toString(),
        "for": sp.for, // may be redundant
        "parent_id": parID, // id of the site or species item
        "spec_id": sp.id, // may be redundant
        "name": sp.name,
        "value": stVal
      };
      // console.log("auxDObj");
      // console.log(auxDObj);
      aux_data_array.unshift(auxDObj);
      bkupAuxData();
      
    } // end of if not empty
  }); // end of adding all aux data items
  // console.log("aux_data_array");
  // console.log(aux_data_array);
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataEntryScreen')).hide();
  // shwSitesTimeout = setTimeout(showSites, 10);
});

document.getElementById('btn-cancel-auxdata').addEventListener('click', function (e) {
  // the only way we would be here is if the site or species is half-done, waiting for auxdata
  // back out, and delete the site or species too

  var i;
  switch (aux_spec_for) {
    case "sites":
      i = site_info_array.findIndex(itm => itm.id === current_site_id);
      site_info_array.splice(i, 1);
      bkupSiteList();
      break;
    case "spp_items":
      i = site_spp_array.findIndex(itm => itm.id === current_spp_item_id);
      site_spp_array.splice(i, 1);
      bkupSpeciesList();
      break;
    default:
  }
  // showSites(); on this modal hide
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnAuxDataEntryScreen')).hide();
});

vnSendDataScreen.addEventListener('shown.bs.modal', function (event) {
//  alert("in vnSendDataScreen 'shown.bs.modal'");
	if (site_info_array.length == 0) {
    sites_available_to_send_list.innerHTML = '';
    site_chosen_to_send = -1;
    document.getElementById('siteChosenToSend').innerHTML =
        '<h3>No sites yet. Nothing to send.</h3>';
    return;
  }

  let strSitesAvaiableList = '';
  site_info_array.forEach((obj, index) => {
    strSitesAvaiableList += '<li class="dropdown-item" id = "siteToSend_'
        + index + '"><h3>' +  obj.name + '</h3></li>';
  })
  sites_available_to_send_list.innerHTML = strSitesAvaiableList;
  document.getElementById('siteChosenToSend').innerHTML = '';
});

sites_available_to_send_list.addEventListener('click', function (e) {
  // list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== sites_available_to_send_list) {
      target = target.parentNode; // If the clicked element isn't a direct child
      if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    // the element id is the string "siteToSend_" (to avoid confusion with
    // any other elements) followed by the index number in the Sites array
    //
    site_chosen_to_send = parseInt((target.id).split("_")[1]);
//      console.log("site_chosen_to_send = " + site_chosen_to_send);
    document.getElementById('siteChosenToSend').innerHTML =
        '<h3>' + target.textContent + '</h3>'
  }
});

document.getElementById('btn-send-data').addEventListener('click', sendData);

function sendData() {
//  alert("in sendData function");
  let emailAddrString = document.getElementById('email_address_box').value.toString().trim();
  // validation here
  if (site_info_array.length == 0) {
    alert("No sites yet. Nothing to send.");
    return;
  }
  if (site_chosen_to_send == -1) {
    alert("no site chosen");
    return;
  }

  if (emailAddrString == "") {
    alert("no email address");
    return;
  }

  console.log(emailAddrString);
  let siteObj = site_info_array[site_chosen_to_send];
  let emailSubjectStr = "VegNab webapp data, " + siteObj.name;
  console.log('siteObj: ' + siteObj);
  let emailBodyStr = 'Site name: ' + siteObj.name + '\n'
    + 'Notes: ' + siteObj.notes + '\n'
    + 'Date: ' + siteObj.date.toISOString() + '\n';
  if (false) { // // TODO: validate here
    emailBodyStr += 'Location unknown\n';
  } else {
    emailBodyStr += 'Location: (' + siteObj.latitude
        + ', ' + siteObj.longitude
        + ') accuracy ' + siteObj.accuracy + ' meters\n';
  }
  // add any auxiliary data for the site
  let this_site_aux_data_array = aux_data_array.filter(d => d.parent_id === siteObj.id);
  this_site_aux_data_array.forEach(ad => {
    emailBodyStr += ad.name + ': ' + ad.value + '\n';
  });
  let this_site_spp_array = site_spp_array.filter(spp_obj =>
    spp_obj.site_id === siteObj.id)
    .sort((s1, s2) => (s1.date < s2.date) ? 1 : (s1.date > s2.date) ? -1 : 0);
  if (this_site_spp_array.length == 0) {
    emailBodyStr += '\n(No species yet)';
  } else {
    console.log(this_site_spp_array);
    let descr_string = "";
    this_site_spp_array.forEach((itm, spp_index) => {
      // both real species and placeholders have a 'species' field for display
      if (itm.type === "ph") { // a placeholder
        descr_string = itm.species;
        // placeholders do not have Uncertainty
      } else { // a real species
        let sst = itm.species;
        if (itm.uncertainty == "species") {
          sst = "Probably " + itm.species + ", but can't determine species"
        }
        if (itm.uncertainty == "genus") {
          sst = "Look like " + itm.species + ", but unsure at genus level"
        }
        descr_string = sst;
      }
      // add any auxiliary data
      let this_aux_data_array = aux_data_array.filter(d => d.parent_id === itm.id);
      this_aux_data_array.forEach(ad => {
        descr_string += '; "' + ad.name + '" = ' + ad.value;
      });
      emailBodyStr += '\n' + descr_string
          + '; ' + itm.date.toISOString()
          + '; ' + '(' + itm.latitude + ', ' + itm.longitude
              + ') accuracy ' + itm.accuracy + ' meters';

    });
    // done with species items, add the info for any placeholders used
    let this_site_ph_array = placeholders_array.filter(ph_obj =>
      this_site_spp_array.find(itm => (itm.code === ph_obj.code)));
    if (this_site_ph_array.length > 0) {
      console.log(this_site_ph_array);
      emailBodyStr += '\n\n Placeholders used:';
      this_site_ph_array.forEach(ph_obj => {
        emailBodyStr += '\n\n' + ph_obj.code + ": " + ph_obj.keywords.join(" ");
        emailBodyStr += '\nrecorded ' + ph_obj.date.toISOString();
        emailBodyStr += ' on site "'
          + site_info_array.find(site => site.id === ph_obj.site_id).name + '"';
        emailBodyStr += ' at (' + ph_obj.latitude + ', ' + ph_obj.longitude
                + ') accuracy ' + ph_obj.accuracy + ' meters';
        // reference any photos
        if (ph_obj.photos.length > 0) {
          emailBodyStr += '\nPhotos:'
          ph_obj.photos.forEach(img => {
            emailBodyStr += '\nFilename: ' + img.name
              + '\n    lastModified: ' + img.lastModified
              + '\n    bytes: ' + img.size;
              // test if a photo requested from the camera, not already stored,
              // and therefore exists only as a blob in the browser
              if (img.name.length > 30) {
                // TODO find a more reliable test than length of filename
                emailBodyStr += '\n      This photo cannot be saved on your phone ';
                // TODO try to find a way to upload it, and make it available
              }
          }); // end of referencing this photo
        }; // end of referencing this placeholder's photos
      }); // end of inserting this placeholder
    }; // end of inserting placeholders
    console.log(emailBodyStr);
  }
    //  let emailBodyStr = '"Site 1\ntoday\nABCO\tAbies concolor"';
  // spaces, linebreaks and tabs get correctly encoded
  // spaces and linebreaks come through in Gmail, but tabs turn into spaces
  let emailMsg = 'mailto:' + emailAddrString
    + '?subject=' + encodeURIComponent(emailSubjectStr)
    + '&body=' +  encodeURIComponent(emailBodyStr);
  // check message is not too long, etc.

  window.open(emailMsg); // works on phone, not on laptop

  console.log('About to hide the Send Data modal');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSendDataScreen')).hide();
} // end of fn sendData

document.getElementById('btn-reset-app').addEventListener('click', function () {
  if (confirm("This will erase all your data. Are you sure?")) {
    // clear the arrays, in ascending order of importance, and nesting
    aux_data_array = [];
    bkupAuxData();
    aux_specs_array = [];
    bkupAuxSpecs();
    found_spp_array = [];
    bkupFoundSpp();
    placeholders_array = [];
    bkupPlaceholders();
    site_spp_array = [];
    bkupSpeciesList();
    site_info_array = [];
    bkupSiteList();
    // trigger to refresh site list and species
    shwSitesTimeout = setTimeout(showSites, 200);
    alert("Data erased, and app reset to defaults");
  } else {
    // drop through to dismissing this screen
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnResetAppScreen')).hide();
});

// Why does the following work? Is 'vnSettingsScreen' an object readable by its ID?
vnSettingsScreen.addEventListener('shown.bs.modal', function (event) {
//  alert("in vnSettingsScreen 'shown.bs.modal'");
  // set up Regions section
  let region_item = regions_array.find(itm => itm.code === region_code);
  if (region_item === "undefined") {
    document.getElementById('regionChosen').innerHTML
        = "no region chosen";
  } else {
    document.getElementById('regionChosen').innerHTML
        = "<h3>" + region_item.name + "</h3>";
  }
  if (regions_array.length == 0) {
    settingsFormRegionsList.innerHTML = '';
  } else {
    let strRegionsAvaiableList = '';
    regions_array.forEach((obj, index) => {
      strRegionsAvaiableList += '<li class="dropdown-item" id = "regionCode_'
          + obj.code + '"><h3>' +  obj.name + '</h3></li>';
    })
    settingsFormRegionsList.innerHTML = strRegionsAvaiableList;
  }
  // Regions section done
  // set up "simple spp" vs "all subspp and varieties" section
  // evidently, button group is held together by them all having the same "name"
  if (include_subspp_var) {
    document.getElementById('allSubsppVars').checked = true;
  } else {
    document.getElementById('simpleSppOnly').checked = true;
  }
  // set up Site accuracy section
  // set input value as string, even if numeric
  document.getElementById("inputSiteTargetAccuracy").value = "" + siteLocTargetAccuracy;
  document.getElementById("ckWaitSiteAcc").checked = waitForSiteLocTarget;
  // set up Species accurady section
  document.getElementById("inputSppTargetAccuracy").value = "" + sppLocTargetAccuracy;
  document.getElementById("ckWaitSppAcc").checked = waitForSppLocTarget;
  // set up 'data format' section
  switch(sentDataFormat) {
    case "fmtHumanReadable":
      document.getElementById('sendDataHumanReadable').checked = true;
      break;
    case "fmtXml":
      document.getElementById('sendDataAsXML').checked = true;
      break;
    case "fmtJson":
      document.getElementById('sendDataAsJSON').checked = true;
      break;
    default:
      // code block
    }
});

// klunky, separate listeners for each radio button
document.getElementById("simpleSppOnly").addEventListener('change', function (e) {
  if (this.checked) {
    include_subspp_var = false;
    // see if the following takes too long
    makeLocalAndNonlocalSppArrays().then(
      function(value) {showAppStatus(value);},
      function(error) {showListsError(error);}
    );
  }
});

document.getElementById("allSubsppVars").addEventListener('change', function (e) {
  if (this.checked) {
    include_subspp_var = true;
    // see if the following takes too long
    makeLocalAndNonlocalSppArrays().then(
      function(value) {showAppStatus(value);},
      function(error) {showListsError(error);}
    );
  }
});

document.getElementById("inputSiteTargetAccuracy").addEventListener("change", function (e) {
  siteLocTargetAccuracy = e.target.value;
});

document.getElementById("ckWaitSiteAcc").addEventListener('click', function (e) {
  waitForSiteLocTarget = e.target.checked;
});

document.getElementById("inputSppTargetAccuracy").addEventListener("change", function (e) {
  sppLocTargetAccuracy = e.target.value;
});

document.getElementById("ckWaitSppAcc").addEventListener('click', function (e) {
  waitForSppLocTarget = e.target.checked;
});

// klunky, separate listeners for each radio button
document.getElementById("sendDataHumanReadable").addEventListener('change', function (e) {
  if (this.checked) { sentDataFormat = this.value; }});

document.getElementById("sendDataAsXML").addEventListener('change', function (e) {
  if (this.checked) { sentDataFormat = this.value; }});

document.getElementById("sendDataAsJSON").addEventListener('change', function (e) {
  if (this.checked) { sentDataFormat = this.value; }});

settingsFormRegionsList.addEventListener('click', function (e) {
  // list is parent of all the list items
  var target = e.target; // Clicked element
  while (target && target.parentNode !== settingsFormRegionsList) {
      target = target.parentNode; // If the clicked element isn't a direct child
      if(!target) { return; } // If element doesn't exist
  }
  if (target.tagName === 'LI') { // tagName returns uppercase
    // the element id is the string "regionCode_" (to avoid confusion with
    // any other elements) followed by the two-letter code of the region
    //
    region_code = (target.id).split("_")[1];
//      console.log("region_code = " + region_code);
    document.getElementById('regionChosen').innerHTML =
        '<h3>' + target.textContent + '</h3>';
//    const updateRegionTimeout = setTimeout(makeLocalAndNonlocalSppArrays, 10);
    makeLocalAndNonlocalSppArrays().then(
      function(value) {showAppStatus(value);},
      function(error) {showListsError(error);}
    );
  }
});

vnHelpAboutScreen.addEventListener('shown.bs.modal', function () {
  // following can't work because 'cacheName' is defined inside of 'sw.js', 
  //  which is in a different environment
//  document.getElementById('serviceworker-version').innerHTML = 'ServiceWorker version: "' + cacheName + '"'
  // on service worker registration, exchanged messages which should have set this variable
  if (swVersion) {
    document.getElementById('serviceworker-version').innerHTML = 'ServiceWorker version: "' + swVersion + '"'
  } else {
    document.getElementById('serviceworker-version').innerHTML = 'ServiceWorker version not known'
  }
});

})(); // Immediately-Invoked Function Expression (IIFE)
