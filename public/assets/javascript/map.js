    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCFPYDY47Q6bxwSlbIS7PFpGKFmIId0ZhU",
        authDomain: "fruit-drop-1506557698689.firebaseapp.com",
        databaseURL: "https://fruit-drop-1506557698689.firebaseio.com",
        projectId: "fruit-drop-1506557698689",
        storageBucket: "fruit-drop-1506557698689.appspot.com",
        messagingSenderId: "425209410204"
    };
    firebase.initializeApp(config);

    var provider = new firebase.auth.GoogleAuthProvider();
    var user;
    var currentUser;
    var activeInfoWindow;
    // Map Page
    var geocoder;
    var markers = [];

    function initMap() {
        geocoder = new google.maps.Geocoder();
        var map;
        var infoWindowContent = [];
        var myLatlng1 = new google.maps.LatLng(34.0522, -118.2437);
        var bounds = new google.maps.LatLngBounds();
        var mapOptions = {
            zoom: 10,
            center: myLatlng1,
            mapTypeId: 'roadmap'
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
        var addresses = [];
        var infoMaker = [];
        var dataMaker = [];

        firebase.database().ref("listings").on("value", function(snapshot) {

            snapshot.forEach(function(childSnapshot) {

                // dataMaker.push(childSnapshot.val());

                var add = childSnapshot.child("street").val() + " " + childSnapshot.child("zipCode").val();
                add.key = childSnapshot.key;
                addresses.push(add);

                var fruit = childSnapshot.child("item").val()
                // Info Window Content
                var infoWindowContent = ['<div class="info_content">' +
                    '<h3>' + fruit + '</h3>' +
                    '<p>Get your ' + fruit + ' here!</p>' + '</div>'
                ]

                infoMaker.push(infoWindowContent);

                childSnapshot.forEach(function(grandchildSnapshot) {
                    var user = grandchildSnapshot.val();
                    dataMaker.push(user);
                    var parent = grandchildSnapshot.ref.parent.key;
                })
            });
            displayMarkers();
        });

        function displayMarkers() {
            for(i = 0; i < dataMaker.length; i++) {
                
                geocoder.geocode({'address': dataMaker[i].street + dataMaker[i].zipCode}, makeCallback(i));

            }

            function makeCallback(dataMakerIndex) {
                var geocodeCallBack = function(results, status) {

                if (status !== google.maps.GeocoderStatus.OK) {
                    console.log("Geocode was not successful for the following reason: " + status);
                } else {
                    var point = results[0].geometry.location;

                    var i = dataMakerIndex;
                    var marker = new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location
                    });
                    var infowindow = new google.maps.InfoWindow();
                    // create an infowindow2 -  for mouseclick
                    var infowindow2 = new google.maps.InfoWindow();

                    infowindow.setContent('<h3 class="mapInfo">'+ dataMaker[i].item + '</h3>');

                    // On Mouseover
                    google.maps.event.addListener(marker, 'mouseover', function() {
                
                        // Close active window if exists - [one might expect this to be default behaviour no?]              
                        if(activeInfoWindow != null) activeInfoWindow.close();

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

                    infowindow2.setContent('<h3 class="mapInfo">'+ dataMaker[i].item + '</h3>' + '<p>Pick up your ' + dataMaker[i].item + ' here!</p>' );   

                    // Open the infowindow
                    google.maps.event.addListener(marker, 'click', function() {
                        //Close active window if exists               
                        if(activeInfoWindow != null) activeInfoWindow.close();

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