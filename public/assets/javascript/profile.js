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

$(document).ready(function() {

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
    var uid = getUrlParameter('uid');
    var currentUser;

    firebase.auth().onAuthStateChanged(user => {
        if (user) {
            var userUid = user.uid;
            if (uid == userUid) {
                currentUser = firebase.auth().currentUser;
                $("#email").html(currentUser.email);

            } else {
                firebase.database().ref("bio").child(uid).once("value").then(function(snapshot) {
                    currentUser = {
                        uid: uid,
                        photoURL: snapshot.val().photoURL,
                        displayName: snapshot.val().displayName,
                    }
                });
                $("#edit-profile").css("display", "none");
                $("#add").css("display", "none");
            }

            $("#profile-pic").attr("src", currentUser.photoURL);
            $("#profile-name").text(currentUser.displayName);
            firebase.database().ref("bio").child(currentUser.uid).on("child_added", function(childSnapshot) {
                $("#bio").text(childSnapshot.val().bio);
                $("#personal-link").html(childSnapshot.val().personal).attr("href", "http://" + childSnapshot.val().personal);
            });
            // Display user's listings in profile and to Firebase
            firebase.database().ref("listings").child(currentUser.uid).on("child_added", function(childSnapshot) {
                //add to firebase
                var newItem = childSnapshot.child('item').val();
                console.log("newitem: ", newItem);
                if (newItem) {
                    firebase.database().ref("items").child(newItem).push(childSnapshot.key);

                }
                //add to profile
                $("#listings").append("<tr><td>" + childSnapshot.val().item +
                    "</td><td>" + childSnapshot.val().quantity +
                    "</td><td>" + childSnapshot.val().street + " " + childSnapshot.val().zipCode +
                    "</td><td>" + childSnapshot.val().date + "</td></tr>");
            });
        }
    });

    // firebase.database().ref("listings").child(user.uid).on('child_added', function(childSnapshot, prevChildKey) {
    //     var newItem = childSnapshot.child('item').val();
    //     console.log("newitem: ", newItem);
    //     if (newItem) {
    //         firebase.database().ref("items").child(newItem).push(childSnapshot.key());

    //     }
    // });



    function logout() {
        firebase.auth().signOut().then(function() {
            window.location = "index.html";
        }).catch(function(error) {
            console.log(error);
        });
    }

    $("#logout").on("click", function() {
        logout();
    });

    // Display form to add listing
    $("#add").on("click", function() {
        $('#addListing').modal('show');
    });

    // Submit form to add listing
    $(document).on("click", "#submit-add", function(event) {
        event.preventDefault();

        // Get the input values
        var item = $("#item").val();
        var quantity = $("#quantity").val();
        var street = $("#street").val();
        var zipCode = $("#zip-code").val();
        var date = $("#date").val();
        // Input to firebase under user's unique ID
        firebase.database().ref("listings").child(currentUser.uid).push({
            item: item,
            quantity: quantity,
            street: street,
            zipCode: zipCode,
            date: date
        })
        $('#addListing').modal('hide');
    });

    // Display form to edit profile
    $("#edit-profile").on("click", function() {
        $("#profile-new").modal("show");
    });
    // Submit form to update profile
    $(document).on("click", "#submit-profile", function(event) {
        event.preventDefault();

        var bio = $("#user-bio").val().trim();
        var personalSite = $("#personal").val().trim();

        firebase.database().ref("bio").child(currentUser.uid).update({
            bio: bio,
            personal: personalSite
        })
        $("#profile-new").modal("hide");
    });
     // Facebook Share button
    $(document).on("click", "#fb-share", function() {
     FB.ui({
         method: 'share',
         href: 'https://developers.facebook.com/docs/',
     }, function(response) {});
 });
   
});