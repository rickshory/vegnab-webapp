(function () {

// for testing, region is "OR" (Oregon)
// todo: automatically acquire or input region
var region_code = "OR";
// for testing, ignore subspecies and varieties
// todo: make this an option
var include_subspp_var = false;

// value returned by setInterval, for periocally checking the location for a
// site; used to clear the ticker using clearInterval
var sitePeriodcLocationCheckFlag;
var sppItemPeriodcLocationCheckFlag; // same for species item
var browser_supports_geolocation = false; // until determined true
// return value used to halt position tracking
// by calling clearWatch on this id
var position_tracker_id = 0;

var latestLocation; // latest location acquired
var siteLocation; // site location to use
// numeric, but will only be inserted as text into sent data
var siteLat = "";
var siteLon = "";
var siteAcc = "";

// numeric, but will only be inserted as text into sent data
var sppItemLat = "";
var sppItemLon = "";
var sppItemAcc = "";

locationOptions = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};

// keep acquiring site location until accuracy is <= this
// user can manually accept greater innaccuracty
var defaultSiteLocationAcceptableAccuracy = 7;
var siteAccuracyAccepted = true; // 'false' flags new site, until accuracy accepted
var sppItemLocationTargetAccuracy = 7;
var sppItemAccuracyAccepted = true; // 'false' flags new item, until accuracy accepted

// Create a map to manage site species list click listeners as they are 
// added and removed
const siteSppListHandlers = new Map();
var site_info_array = [];
var current_site_id = "";
var site_chosen_to_send = -1;
var latest_site_date = new Date();
var site_spp_array = []; // the species items for all the sites, internally
// indexed by which site each one belongs to.
var nrcs_spp_array = [];
var local_spp_array = [];
var nonlocal_spp_array = [];
var showSitesTimeout = setTimeout(showSites, 10); // first time, there are no
// sites, so nothing visible will happen
var match_list = document.getElementById("match-list");
var sites_available_to_send_list = document.getElementById("sendFormSitesList");

fetch('nrcs_spp.txt')
  .then(response => response.text())
  .then(data => {
		let tmp_array = data.split("\n");
		nrcs_spp_array = tmp_array.map(str => {
			spp_flds = str.split("\t");
			let spp_obj = {
				"nrcs_code": spp_flds[0],
				"base_species": spp_flds[1],
        "subspp_var": (spp_flds[2] == null ? "" : spp_flds[2]),
        "common_names": (spp_flds[3] == null ? "" : spp_flds[3]),
				"distribution": (spp_flds[4] == null ? "" : spp_flds[4])
			};
			return spp_obj;
		});
//	  console.log(nrcs_spp_array);
		makeLocalAndNonlocalSppArrays();
  });

function makeLocalAndNonlocalSppArrays() {
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
			"item_description": orig_obj.base_species + orig_obj.subspp_var
          + orig_obj.common_names,
			"is_local": true
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
      "item_description": orig_obj.base_species + orig_obj.subspp_var
          + orig_obj.common_names,
			"is_local": false
		};
		return new_properties;
	});
//	console.log(nonlocal_spp_array);
}

function updateMatchList() {
	console.log("updateMatchList");
	var search_term = sppSearchInput.value.toLowerCase();
	// todo: deal with backspace removal of characters
	match_list.innerHTML = ""; // clear any previous content
	if (search_term.length > 1) {
		// first, get the strict matches on item_code for local species
		let spp_match_array = local_spp_array.filter(obj =>
			obj.item_code.toLowerCase().startsWith(search_term));

			if (search_term.length > 2) {
				// get local full-text matches local
				// at least 3 characters
				// to include short genera such as "Poa" and "Zea"

				// no need to duplicate any item_code matches
				let local_no_code_array = local_spp_array.filter(obj =>
					!spp_match_array.includes(obj));
				let local_fulltext_spp_match_array = local_no_code_array.filter(obj =>
					obj.item_description.toLowerCase().includes(search_term));
				spp_match_array = spp_match_array.concat(local_fulltext_spp_match_array);
				spp_match_array.sort(); // internally sort local spp, by code

				// add matches of non-local species, CSS will color them differently
				// first, get strict code matches
				let nonlocal_spp_match_array = nonlocal_spp_array.filter(obj =>
					obj.item_code.toLowerCase().startsWith(search_term));
				// next, get full-text matches
				// no need to repeat any of the code matches
				let nonlocal_no_code_array = nonlocal_spp_array.filter(obj =>
					!nonlocal_spp_match_array.includes(obj));

				let nonlocal_fulltext_spp_match_array = nonlocal_no_code_array.filter(obj =>
					obj.item_description.toLowerCase().includes(search_term));
				// put the nonlocal code and full-text results together
				nonlocal_spp_match_array =
					nonlocal_spp_match_array.concat(nonlocal_fulltext_spp_match_array);
				// internally sort
				nonlocal_spp_match_array.sort();
				// put the nonlocal below the local
//				console.log(nonlocal_spp_match_array);
				spp_match_array = spp_match_array.concat(nonlocal_spp_match_array);
				// don't sort here; leave the nonlocal after the sorted local species
			}
    // build list contents, then assign innerHTML all at once
    let list_string = "";
    spp_match_array.forEach(obj => {
			let display_class = obj.is_local ? "local" : "nonlocal";
			list_string += '<li class="' + display_class +
        '" id="' + obj.item_code + '">' + obj.item_code +
		 		': ' + obj.item_description + '</li>';
		});
    match_list.innerHTML = list_string;
	}
}

match_list.addEventListener('click', function (e) {
  // match_list is parent of all the list items
    var target = e.target; // Clicked element
    while (target && target.parentNode !== match_list) {
        target = target.parentNode; // If the clicked element isn't a direct child
        if(!target) { return; } // If element doesn't exist
    }
    if (target.tagName === 'LI'){ // tagName returns uppercase
//        alert(target.id);
        let spp = target.textContent;
        console.log(spp);
        // for testing, use the code and description as one string "species"
        let spp_entry_date = new Date();
        let new_spp_item = {
          "id": spp_entry_date.getTime().toString(),
          "site_id": current_site_id,
          "species": spp,
          "date": spp_entry_date,
          "latitude": sppItemLat,
          "longitude": sppItemLon,
          "accuracy": sppItemAcc
        };
        site_spp_array.unshift(new_spp_item);
        // trigger to refresh site list
        showSitesTimeout = setTimeout(showSites, 10);
        // clear the search for next time
        // dismiss the modal
        console.log('About to hide the Species Search modal');
        bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSppSearchScreen')).hide();
    }
});

var sppSearchModal = document.getElementById('vnSppSearchScreen');
var sppSearchInput = document.getElementById('search-box');
sppSearchInput.addEventListener("input", updateMatchList);
sppSearchModal.addEventListener('shown.bs.modal', function () {
  sppSearchInput.value = "";
  match_list.innerHTML = "";
  sppSearchInput.focus();
  // start acquiring location, in anticipation of the species
  sppItemAccuracyAccepted = false;
  console.log("about to call startTrackingPosition");
  startTrackingPosition();
  console.log("about to start spp location checking ticker");
  sppItemPeriodcLocationCheckFlag = setInterval(checkSppItemPositionAccuracy, 500);
})

sppSearchModal.addEventListener('hidden.bs.modal', function () {

// TODO: option to pause here to wait for better accuracy
  sppItemAccuracyAccepted = true; // flag OK, one way or the other
  // stop acquiring location, use what we have at this point
  console.log("about to stop spp location checking ticker");
  clearInterval(sppItemPeriodcLocationCheckFlag);
  console.log("about to call stopTrackingPosition");
  stopTrackingPosition();
})

var vnAddSiteButton = document.getElementById('btn-add-site');
var vnSiteDate = document.getElementById('site_date');
var vnSiteLocation = document.getElementById("site_location");

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    vnSiteLocation.innerHTML = "Geolocation is not supported by this browser.";
  }
}

function startTrackingPosition() {
  if (navigator.geolocation) {
    browser_supports_geolocation = true;
    position_tracker_id = navigator.geolocation.watchPosition(trackPosition,
        locationError, locationOptions);
  } else {
    browser_supports_geolocation = false;
  }
}

function stopTrackingPosition() {
  navigator.geolocation.clearWatch(position_tracker_id);
}

function trackPosition(position) {
  // called every time postion changes
  latestLocation = position;
}

function locationError(err) {
  console.warn('ERROR(' + err.code + '): ' + err.message);
/*
switch(err.code) {
  case err.PERMISSION_DENIED:
    x.innerHTML = "User denied the request for Geolocation."
    break;
  case err.POSITION_UNAVAILABLE:
    x.innerHTML = "Location information is unavailable."
    break;
  case err.TIMEOUT:
    x.innerHTML = "The request to get user location timed out."
    break;
  case err.UNKNOWN_ERROR:
    x.innerHTML = "An unknown error occurred."
    break;
}
*/

}

function showPosition(position) {
  vnSiteLocation.innerHTML = "Latitude: " + position.coords.latitude +
  "<br>Longitude: " + position.coords.longitude +
  "<br>Accuracy: " + position.coords.accuracy.toFixed(1) + " meters";
}

function checkSitePositionAccuracy() {
  // called for a new site, periocally, until position is accurate enough
  console.log("entered checkSitePositionAccuracy");
  if (latestLocation.coords.accuracy <= defaultSiteLocationAcceptableAccuracy) {
    siteAccuracyAccepted = true;
    siteLocation = latestLocation; // remember, and no longer null
  }
  siteLat = "" + latestLocation.coords.latitude;
  siteLon = "" + latestLocation.coords.longitude;
  siteAcc = "" + latestLocation.coords.accuracy.toFixed(1);
  let stLoc = "Latitude: " + latestLocation.coords.latitude +
      "<br>Longitude: " + latestLocation.coords.longitude;
  if (!siteAccuracyAccepted) {
    stLoc += "<br>Target accuracy: " + defaultSiteLocationAcceptableAccuracy + " meters";
  }
  stLoc += "<br>Accuracy: " + latestLocation.coords.accuracy.toFixed(1) + " meters";
  vnSiteLocation.innerHTML = stLoc;
  if (siteAccuracyAccepted) {
    // stop the ticker that periocally calls this function
    console.log("echeckSitePositionAccuracy found siteAccuracyAccepted, stopping ticker");
    clearInterval(sitePeriodcLocationCheckFlag);
    return;
  }
}

function checkSppItemPositionAccuracy() {
  // called for a new species item, periocally, until position is accurate enough
  console.log("entered checkSppItemPositionAccuracy");
  if (latestLocation.coords.accuracy <= sppItemLocationTargetAccuracy) {
    sppItemAccuracyAccepted = true;
  }
  sppItemLat = "" + latestLocation.coords.latitude;
  sppItemLon = "" + latestLocation.coords.longitude;
  sppItemAcc = "" + latestLocation.coords.accuracy.toFixed(1);
  // let stLoc = "Latitude: " + latestLocation.coords.latitude +
  //     "<br>Longitude: " + latestLocation.coords.longitude;
  // if (!sppItemAccuracyAccepted) {
  //   stLoc += "<br>Target accuracy: " + defaultSiteLocationAcceptableAccuracy + " meters";
  // }
  // stLoc += "<br>Accuracy: " + latestLocation.coords.accuracy.toFixed(1) + " meters";
  // vnSiteLocation.innerHTML = stLoc;
  if (sppItemAccuracyAccepted) {
    // stop the ticker that periocally calls this function
    console.log("checkSppItemPositionAccuracy found sppItemAccuracyAccepted, stopping ticker");
    clearInterval(sppItemPeriodcLocationCheckFlag);
    return;
  }
}
/* sppItemLat  sppItemLon  sppItemAcc */


var vnSiteInfoModal = document.getElementById('vnSiteInfoScreen');
// following syntax breaks the addEventListener
// var vnSiteInfoModal = new bootstrap.Modal(document.getElementById('vnSiteInfoScreen'), {
//   keyboard: true
// });
var vnSiteName = document.getElementById('site_name');
var vnSiteNotes = document.getElementById('site_notes');

vnSiteInfoModal.addEventListener('shown.bs.modal', function (event) {
	latest_site_date = new Date();
	vnSiteDate.innerHTML = latest_site_date.toString();
  siteLocation = null; // null flags that it is not yet determined
  getLocation();
  siteAccuracyAccepted = false;
  console.log("about to call startTrackingPosition");
  startTrackingPosition();
  console.log("about to start site location checking ticker");
  sitePeriodcLocationCheckFlag = setInterval(checkSitePositionAccuracy, 2000);
});

vnSiteInfoModal.addEventListener('hide.bs.modal', function (event) {
//	event.preventDefault();
	console.log("In modal Hide event");
  siteAccuracyAccepted = true;
  clearInterval(sitePeriodcLocationCheckFlag);
  stopTrackingPosition();
});

document.getElementById('btn-save-site-info').addEventListener('click', storeSiteInfo);

function storeSiteInfo() {
//	console.log("In storeSiteInfo fn");
//	console.log('self element : ' + self.id);
	let SiteNameString = vnSiteName.value.toString().trim();
//	console.log('site_name : '+ SiteNameString);
	// do verification
  if (SiteNameString === "") {
    alert("Need a site name");
    vnSiteName.value = ""; // in case some whitespace was there
    vnSiteName.focus();
    return;
  }
  let SiteNotesString = vnSiteNotes.value.toString().trim();
//  console.log('site_notes : '+ SiteNotesString);
  if (SiteNotesString === "") {
    alert("Need some site notes");
    vnSiteNotes.value = ""; // in case some whitespace was there
    vnSiteNotes.focus();
    return;
  }
  // // TODO: check that location is within tolerance
  // for now, just use latest location

  // store data
  let site_obj = {
    // multiple sites would never be created in the same millisecond, so id
    // would be unique
    "id": new Date().getTime().toString(),
    "name": SiteNameString,
    "notes": SiteNotesString,
    "date": latest_site_date,
    "latitude": siteLat,
    "longitude": siteLon,
    "accuracy": siteAcc
  };
  current_site_id = site_obj.id;
  // new item at the beginning
  site_info_array.unshift(site_obj);
  // clear form for next time
  vnSiteName.value = "";
  vnSiteNotes.value = "";
  // trigger to refresh site list
  showSitesTimeout = setTimeout(showSites, 10);
  // dismiss the modal
  console.log('About to hide the Site Info modal');
  bootstrap.Modal.getOrCreateInstance(document.getElementById('vnSiteInfoScreen')).hide();
}

var sites_accordion = document.getElementById("sites-accordion");

function showSites() {
  // show the sites in an accordion list, top item expanded by default
  if (site_info_array.length == 0) {
    sites_accordion.innerHTML = '<h2>No sites yet</h2>';
    current_site_id = "";
    return;
  }

  let sites_accordion_listitems = "";
  site_info_array.forEach((obj, index) => {
    if (index === 0) {
      current_site_id = obj.id;
    }
    sites_accordion_listitems += '<div class="card">' +
'  <div class="card-header" id="heading' + (index + 1) + '">' +
'    <a class="' + (index == 0 ? '' : 'collapsed ') +
'btn" data-bs-toggle="collapse" href="#collapse' + (index + 1) +
'" aria-expanded="' + (index == 0 ? 'true' : 'false') +
'" aria-controls="collapse' + (index + 1) + '">' +
'    <h3>' +  obj.name + '</h3>' +
'    </a>' +
'  </div>' +
'  <div id="collapse' + (index + 1) + '" class="collapse' +
(index == 0 ? ' show' : '') + '" data-bs-parent="#sites-accordion">' +
'    <div class="card-body">' +
'      <button type="button" id="' + obj.id +
'" class="btn btn-primary  btn-lg" data-bs-toggle="modal"' +
'        data-bs-target="#vnSppSearchScreen">' +
'        Add species' +
'      </button>' +
'      <ul id="spp-list-for-' + obj.id + '" class="list-unstyled">' +
'      </ul>' +
'    </div>' +
'  </div>' +
'</div>';
  });
  sites_accordion.innerHTML = sites_accordion_listitems;

 // fill in species lists for sites
 site_info_array.forEach((obj, index) => {
   let this_site_spp_array = site_spp_array.filter(spp_obj =>
     spp_obj.site_id === obj.id)
     .sort((s1, s2) => (s1.spp_date < s2.spp_date) ? 1 : (s1.spp_date > s2.spp_date) ? -1 : 0);
  let this_site_spp_list = document.getElementById("spp-list-for-" + obj.id);
  let spp_listitems_string = "";
  this_site_spp_array.forEach((spp_obj, spp_index) => {
    spp_listitems_string += '<li id="' + spp_obj.id + '">' +
    spp_obj.species + '</li>';
  })
  this_site_spp_list.innerHTML = spp_listitems_string;
}) // end of filling in species lists for sites

  // Assign listeners after all HTML written, emperically works.
  // If assigned in the same loop as writing hTML, only the first button
  // gets its listener, others not.
  site_info_array.forEach((obj, index) => {
    document.getElementById(obj.id).addEventListener('click',
    function(event) {
      // Manage global 'current_site_id', to be used on any
      //  species items added in the modal that opens from this button click.
      // Also manage the listener of the existing site's species list
      // if there was a site previouly current, its list has a listener
      if (!(current_site_id == "")) { // remove the old listener
        let oldList = document.getElementById("spp-list-for-" + current_site_id)
        oldList.removeEventListener("click", myFunction);
      }
      current_site_id = event.currentTarget.id;
      // The 'New spp' button on each site's card has the same id (numeric
      // text) as that site's internal id.
    }, false)
  }) // end of adding event listeners
} // end of fn showSites
// From what I have been able to find out, event listeners are deleted with the
// element if there are no refernces to that element, so re-creating them each
// time like this should work.

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
    if (target.tagName === 'LI'){ // tagName returns uppercase
//        alert(target.id);
      // the element id is the string "siteToSend_" (to avoic confusion with
      // any other elements) followed by the index number in the Sites array
      //
//      let ar = (target.id).split("_");
//      console.log(ar);
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
  let emailSubjectStr = "VegNab webapp data";
  let siteObj = site_info_array[site_chosen_to_send];
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
  let this_site_spp_array = site_spp_array.filter(spp_obj =>
    spp_obj.site_id === siteObj.id)
    .sort((s1, s2) => (s1.spp_date < s2.spp_date) ? 1 : (s1.spp_date > s2.spp_date) ? -1 : 0);
  if (this_site_spp_array.length == 0) {
    emailBodyStr += '\n(No species yet)';
  } else {
    this_site_spp_array.forEach((spp_obj, spp_index) => {
      emailBodyStr += '\n' + spp_obj.species
          + '; ' + spp_obj.date.toISOString()
          + '; ' + '(' + spp_obj.latitude + ', ' + spp_obj.longitude
              + ') accuracy ' + spp_obj.accuracy + ' meters';
    })
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

})(); // Immediately-Invoked Function Expression (IIFE)
