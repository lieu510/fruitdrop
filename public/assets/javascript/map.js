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

var searchItem = getUrlParameter('searchItem');
var searchZip = getUrlParameter('searchZip');
var searchResults = null;

function initMap() {
    var activeInfoWindow;
    var geocoder = new google.maps.Geocoder();
    var map;
    var infoWindowContent = [];
    //<div>Icons made by Twitter from https://www.flaticon.com/ Flaticon is licensed by http://creativecommons.org/licenses/by/3.0/ Creative Commons BY 3.0
    var image = "../assets/images/peach.png"
    var myLatlng1 = new google.maps.LatLng(34.0522, -118.2437);
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        zoom: 10,
        center: myLatlng1,
        mapTypeId: 'roadmap',
    };

    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);

    // Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(initialLocation);
        });
    } else {
        map.setCenter(myLatlng1);
    }

    // Get the addresses from Firebase and push to an array
    var dataMaker = [];

    firebase.database().ref("listings").on("value", function(snapshot) {
        snapshot.forEach(function(childSnapshot) {

            var add = childSnapshot.val();
            dataMaker.push(add);

        });
        displayMarkers();
    });

    function displayMarkers() {
        for (i = 0; i < dataMaker.length; i++) {
            geocoder.geocode({ 'address': dataMaker[i].street + dataMaker[i].zipCode }, makeCallback(i));
        }

        function makeCallback(dataMakerIndex) {
            var geocodeCallBack = function(results, status) {

                if (status !== google.maps.GeocoderStatus.OK) {
                    console.log("Geocode was not successful for the following reason: " + status);
                } else {

                    var i = dataMakerIndex;
                    var marker = new google.maps.Marker({
                        map: map,
                        position: { lat: dataMaker[i].lat, lng: dataMaker[i].long },
                        icon: image
                    });
                    var infowindow = new google.maps.InfoWindow();
                    // create an infowindow2 
                    var infowindow2 = new google.maps.InfoWindow();

                    infowindow.setContent('<h3 class="mapInfo">' + dataMaker[i].item + '</h3>');

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

                    var userProfile = "https://gracepark.github.io/fruitdrop/public/profile.html?uid=" + dataMaker[i].uid;

                    infowindow2.setContent('<h3 class="mapInfo">' + dataMaker[i].item + '</h3>' + '<p style="text-align: center">View Details: </p>' + 'You can find all the details to pick up your produce today by visiting the <a style="color: #f55859" href="' + userProfile +
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

    // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
    var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
        this.setZoom(14);
        google.maps.event.removeListener(boundsListener);
    });
}