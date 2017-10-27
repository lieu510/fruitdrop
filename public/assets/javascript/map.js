// Initialize Firebase
var config = {
    apiKey: "AIzaSyCFPYDY47Q6bxwSlbIS7PFpGKFmIId0ZhU",
    authDomain: "fruit-drop-1506557698689.firebaseapp.com",
    databaseURL: "https://fruit-drop-1506557698689.firebaseio.com",
    projectId: "fruit-drop-1506557698689",
    storageBucket: "fruit-drop-1506557698689.appspot.com",
    messagingSenderId: "425209410204"
};

/********
 MAP PAGE JS
 **********/

var geocoder;
var map;
var image = "assets/images/peach.png";
var activeInfoWindow;

function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var searchItemStart = getUrlParameter('searchItem');
var searchZip = getUrlParameter('searchZip');
var searchRadius = getUrlParameter('searchRadius');


function initMap() {
    
    geocoder = new google.maps.Geocoder();
    var bounds = new google.maps.LatLngBounds();
    var infoWindowContent = [];
    //<div>Icons made by Twitter from https://www.flaticon.com/ Flaticon is licensed by http://creativecommons.org/licenses/by/3.0/ Creative Commons BY 3.0
    var myLatlng1 = new google.maps.LatLng(34.0522, -118.2437);
    var mapOptions = {
        zoom: 10,
        center: myLatlng1,
        mapTypeId: 'roadmap',
    };

    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    var lat;
    var lng;
    var mapCenter;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            mapCenter = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(mapCenter);
        });
    } else {
        map.setCenter(myLatlng1);
    }
    
    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        if (searchRadius < 10000 ) {
            this.setZoom(12);
        } else if (searchRadius >= 10000 && searchRadius < 20000 ) {
            this.setZoom(11);
        } else if (searchRadius >= 20000 && searchRadius < 50000 ) {
            this.setZoom(10);
        } else if (searchRadius >= 50000 ) {
            this.setZoom(9);
        }
        google.maps.event.removeListener(boundsListener);
    });
/*
SEARCH
*/
    if (!searchZip && !searchItemStart) { // No Item or Zip Code
        
        firebase.database().ref("listings").on("value", function(snapshot) {
            displayListingsSearch(snapshot.val());
            displayMarkers(snapshot.val());
        });
    } else if (searchItemStart && searchZip && searchRadius) { // Search Item and Zip Code
        geocoder.geocode({ 'address': searchZip }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                lat = results[0].geometry.location.lat();
                lng = results[0].geometry.location.lng();
                mapCenter = new google.maps.LatLng(lat, lng);
                map.setCenter(mapCenter);
            } else {
                console.log("Geocode Coords was not successful for the following reason: " + status);
            }
        });
        //make search string lower case
        searchItemStart = searchItemStart.toLowerCase();

        //make singular
        if (searchItemStart.endsWith("s")) {
            searchItemStart = searchItemStart.substring(0, searchItemStart.length - 1);
        }
        var searchItemEnd = searchItemStart + "\uf8ff";
        var listingsObj = {};
        var recentPostsRef = firebase.database().ref('listings').orderByChild('item').startAt(searchItemStart).endAt(searchItemEnd).limitToFirst(50);
        recentPostsRef.once('value')
            .then(function(dataSnapshot) {

                dataSnapshot.forEach(function(childSnapshot) {

                    var b = new google.maps.LatLng(childSnapshot.val().latlng.lat, childSnapshot.val().latlng.lng);

                    var distance = parseFloat(google.maps.geometry.spherical.computeDistanceBetween(mapCenter,b).toFixed());

                    if (distance <= searchRadius) {
                        listingsObj[childSnapshot.key] = childSnapshot.val();
                    }
                    

                });
                displayListingsSearch(listingsObj);
                displayMarkers(listingsObj);
            }).then(function(dataSnapshot) {
                dataSnapshot.forEach(function(childSnapshot) {

                    var b = new google.maps.LatLng(childSnapshot.val().latlng.lat, childSnapshot.val().latlng.lng);

                    var distance = parseFloat(google.maps.geometry.spherical.computeDistanceBetween(mapCenter,b).toFixed());
                    if (distance <= searchRadius) {
                        listingsObj[childSnapshot.key] = childSnapshot.val();
                    }

                });
                displayListingsSearch(listingsObj);
                displayMarkers(listingsObj);
            });
    } else if (searchZip && searchItemStart === "" && searchRadius) { // Search Zip Code only
        geocoder.geocode({ 'address': searchZip }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                lat = results[0].geometry.location.lat();
                lng = results[0].geometry.location.lng();
                mapCenter = new google.maps.LatLng(lat, lng);
                map.setCenter(mapCenter);
            } else {
                console.log("Geocode Coords was not successful for the following reason: " + status);
            }
        });
        var listingsObj = {};
        var recentPostsRef = firebase.database().ref('listings');

        recentPostsRef.once('value')
            .then(function(dataSnapshot) {

                dataSnapshot.forEach(function(childSnapshot) {

                    var b = new google.maps.LatLng(childSnapshot.val().latlng.lat, childSnapshot.val().latlng.lng);

                    var distance = parseFloat(google.maps.geometry.spherical.computeDistanceBetween(mapCenter,b).toFixed());
                    if (distance <= searchRadius) {
                        console.log(childSnapshot.val());
                        listingsObj[childSnapshot.key] = childSnapshot.val();
                    }

                });
                console.log(listingsObj);
                displayListingsSearch(listingsObj);
                displayMarkers(listingsObj);

            }).then(function(dataSnapshot) {
                dataSnapshot.forEach(function(childSnapshot) {

                    var b = new google.maps.LatLng(childSnapshot.val().latlng.lat, childSnapshot.val().latlng.lng);

                    var distance = parseFloat(google.maps.geometry.spherical.computeDistanceBetween(mapCenter,b).toFixed());
                    if (distance <= searchRadius) {
                        listingsObj[childSnapshot.key] = childSnapshot.val();
                    }

                });
                displayListingsSearch(listingsObj);
                displayMarkers(listingsObj);
            });
    } else if (searchItemStart && searchZip === "") { // Search Item only

        //make search string lower case
        searchItemStart = searchItemStart.toLowerCase();

        //make singular
        if (searchItemStart.endsWith("s")) {
            searchItemStart = searchItemStart.substring(0, searchItemStart.length - 1);

        }

        //add search ending string
        var searchItemEnd = searchItemStart + "\uf8ff";

        var recentPostsRef = firebase.database().ref('listings').orderByChild('item').startAt(searchItemStart).endAt(searchItemEnd).limitToFirst(50);
        recentPostsRef.once('value')

            .then(function(dataSnapshot) {
                //display search results table
                displayListingsSearch(dataSnapshot.val());
                displayMarkers(dataSnapshot.val());
            })
    }
}
function displayMarkers(items) {
    
    for (var i in items) {
        (function(i) {
            setTimeout(function() {
            geocoder.geocode({ 'address': items[i].street + items[i].zipCode }, makeCallback(i));             
        }, 500 * i);
        })(i);
    }

    function makeCallback(dataMakerIndex) {

            var geocodeCallBack = function(results, status) {

            if (status !== google.maps.GeocoderStatus.OK) {
                console.log("Geocode callback was not successful for the following reason: " + status);
            } else {
                var i = dataMakerIndex;
                var marker = new google.maps.Marker({
                    map: map,
                    position: { lat: items[i].latlng.lat, lng: items[i].latlng.lng },
                    icon: image
                });

                var infowindow = new google.maps.InfoWindow();
                // create an infowindow2 
                var infowindow2 = new google.maps.InfoWindow();

                infowindow.setContent('<h3 class="mapInfo">' + items[i].item + '</h3>');

                // On Mouseover
                google.maps.event.addListener(marker, 'mouseover', function() {

                    // Close active window if exists 
                    if (activeInfoWindow != null) activeInfoWindow.close();

                    // Close info Window on mouseclick if already opened
                    infowindow.close();

                    // Open new InfoWindow for mouseover event
                    infowindow.open(map, marker);

                    // Store new open InfoWindow in global variable
                    activeInfoWindow = infowindow;
                });

                // On mouseout
                google.maps.event.addListener(marker, 'mouseout', function() {
                    infowindow.close();
                });

                var userProfile = "https://gracepark.github.io/fruitdrop/public/profile.html?uid=" + items[i].uid;

                infowindow2.setContent('<h3 class="mapInfo">' + items[i].item + '</h3>' + '<p style="text-align: center">View Details: </p>' + 'You can find all the details to pick up your produce today by visiting the <a style="color: #f55859" href="' + userProfile +
                    '">User Profile</a>');

                // Open the infowindow
                google.maps.event.addListener(marker, 'click', function() {
                    //Close active window if exists               
                    if (activeInfoWindow != null) activeInfoWindow.close();

                    // Open InfoWindow - on click 
                    infowindow2.open(map, marker);

                    // Close "mouseover" infoWindow
                    infowindow.close();

                    // Store new open InfoWindow in global variable
                    activeInfoWindow = infowindow2;
                });
            }
        }

        return geocodeCallBack;
    }
}

var paginationMax = 0;

// Display user's listings in profile
function displayListingsSearch(listings) {
    //clear search table
    $("#listings").empty();
    $("#listings-table").show();

    var pageNum = 1;
    var listingCount = 1;
    var pageClass = "";
    for (var listing in listings) {
        
        var startTime = moment(listings[listing].date, "MM/DD/YY").format("YYYYMMDD");
        var location = listings[listing].street + " " + listings[listing].zipCode;
        var calendarLink = "<a href='http://www.google.com/calendar/render?action=TEMPLATE&text=Fruitdrop: " + listings[listing].item + " available&dates=" + startTime + "/" + startTime + "&location=" + location + "' target='_blank' class='linkButton'>" + listings[listing].date + "</a>";
        // add to table
        $("#listings").append("<tr class='page-num-" + pageNum + "'><td>" + listings[listing].item +
            "</td><td>" + listings[listing].quantity +
            "</td><td>" + location +
            "</td><td>" + calendarLink +
            "</td><td><button class='view-profile' data-id='" + listings[listing].uid + "'>View</button>" +
            "</td></tr>"
        );

                //group pages into groups of 10 listings
        if (listingCount % 10 === 0) {
            //increment page count
            pageNum++;

        }
        //increase listing counter
        listingCount++;
    }
    // Pagination - Previous page
    $("#search-pagination").append("<li class='page-item disabled' id='pagination-previous'><div class='page-link' tabindex='-1'>Previous</div></li>");

    //Pagination - navigation items
    for (var page = 1; page <= pageNum; page++) {
        //hide all pages after the page 1
        if (page !== 1) {
            pageClass = ".page-num-" + page;
            $(pageClass).hide();
        }

        if (page === 1) {
            $("#search-pagination").append("<li class='page-item activated'><div class='page-link'>" +
                +page + "</div></li>"
            );
        } else {
            $("#search-pagination").append("<li class='page-item' ><div class='page-link'>" +
                +page + "</div></li>"
            );
        }


    }

    // Pagination - Next page
    $("#search-pagination").append("<li class='page-item' id='pagination-next'><div class='page-link'>Next</div></li>");

    //save max number of pages for results
    paginationMax = pageNum;
};



/*
EVENT LISTENERS
*/
//link to map.html page with search parameters
$("#search-button").on("click", function() {
    event.preventDefault();
    var searchItem = $("#search-item").val();
    var searchZipCode = $("#search-zip").val();
    var searchRadius = $("#search-radius").val() * 1609.34;
    window.location = "map.html?searchItem=" + searchItem + "&searchZip=" + searchZipCode + "&searchRadius=" + searchRadius;
});

//link to profile for the listing's owner
$(document).on("click", ".view-profile", function() {
    event.preventDefault();
    //obtain profile id of user from listing
    var userID = $(this).attr("data-id");
    //navigate to selected listing's user page
    window.location = "profile.html?uid=" + userID;
});

//navigate pagination
$(document).on("click", ".page-item", function() {

    //don't do anything is nav is disabled
    if (!$(this).hasClass("disabled")) {

        //remove disable class
        $(".disabled").removeClass("disabled");

        var currentPage = $(".activated").children().text();
        var selection = $(this).children().text();
        var pageItemArr = [];

        //add page item to array to help set active
        $(".page-item").each(function() {
            pageItemArr.push($(this));

        });

        //remove the active class from the current nav item
        $(".activated").removeClass("activated");

        if (selection === "Previous") {
            selection = parseInt(currentPage, 10) - 1;
        }

        if (selection === "Next") {
            selection = parseInt(currentPage, 10) + 1;
        }

        if (selection !== "Previous" && selection !== "Next") {
            selection = parseInt(selection, 10);

            if (selection === 1) {
                $("#pagination-previous").addClass("disabled");
            }
            if (selection === paginationMax) {
                $("#pagination-next").addClass("disabled");
            }

            //set active nav page
            pageItemArr[selection].addClass("activated");

            var currentPageClass = ".page-num-" + currentPage;
            var selectedPageClass = ".page-num-" + selection;
            //hide data from previous page
            $(currentPageClass).hide();

            //show data from selected page
            $(selectedPageClass).show();
        }


    }

});
