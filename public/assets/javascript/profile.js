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
            if (uid === user.uid) {
                currentUser = firebase.auth().currentUser;
                displaySelfInfo();
            } else {
                firebase.database().ref("users").child(uid).once("value").then(function(snapshot) {
                    currentUser = {
                        uid: uid,
                        photoURL: snapshot.val().photoURL,
                        displayName: snapshot.val().displayName,
                        email: snapshot.val().email
                    };
                    displayInfo();
                });
                $("#edit-profile").css("display", "none");
                $("#add").css("display", "none");
            }
        }
    });

    // firebase.database().ref("listings").child(user.uid).on('child_added', function(childSnapshot, prevChildKey) {
    //     var newItem = childSnapshot.child('item').val();
    //     console.log("newitem: ", newItem);
    //     if (newItem) {
    //         firebase.database().ref("items").child(newItem).push(childSnapshot.key());

    //     }
    // });

    function displaySelfInfo() {
        $("#profile-pic").attr("src", currentUser.photoURL);
        $("#profile-name").text(currentUser.displayName);
        $("#email").html(currentUser.email);
        firebase.database().ref("users").child(currentUser.uid).on("child_added", function(childSnapshot) {
            $("#bio").text(childSnapshot.val().bio);
            $("#personal-link").html(childSnapshot.val().personal).attr("href", "http://" + childSnapshot.val().personal);
        });
        // create column to edit and delete listing
        $("#table-headers").append("<th>Edit</th><th>Delete</th>");
        displayListings();
    }
    // Display user's listings in profile
    function displayListings() {
        firebase.database().ref("listings").on("child_added", function(childSnapshot) {
            // check children apply to current user
            if (childSnapshot.child('uid').val() === currentUser.uid) {
                // add to profile
                $("#listings").append("<tr><td>" + childSnapshot.val().item +
                    "</td><td>" + childSnapshot.val().quantity +
                    "</td><td>" + childSnapshot.val().street + " " + childSnapshot.val().zipCode +
                    "</td><td>" + childSnapshot.val().date + 
                    "</td><td><button class='edit-listing' data-id='" + childSnapshot.key + "'>Edit</button>" + 
                    "</td><td><button class='delete-listing' data-id='" + childSnapshot.key + "'>Delete</button>" + 
                    "</td></tr>"
                );
            }
        });
    }

    function displayInfo() {
        $("#profile-pic").attr("src", currentUser.photoURL);
        $("#profile-name").text(currentUser.displayName);
        $("#email").html("<a href='mailto:" + currentUser.email + "'>" + currentUser.email + "</a>");
        firebase.database().ref("users").child(currentUser.uid).on("child_added", function(childSnapshot) {
            $("#bio").text(childSnapshot.val().bio);
            $("#personal-link").html(childSnapshot.val().personal).attr("href", "http://" + childSnapshot.val().personal);
        });
        // Display user's listings in profile
        firebase.database().ref("listings").on("child_added", function(childSnapshot) {
            // check children apply to current user
            if (childSnapshot.child('uid').val() === currentUser.uid) {
                //add to profile
                $("#listings").append("<tr><td>" + childSnapshot.val().item +
                    "</td><td>" + childSnapshot.val().quantity +
                    "</td><td>" + childSnapshot.val().street + " " + childSnapshot.val().zipCode +
                    "</td><td>" + childSnapshot.val().date + "</td></tr>"
                );
            }

        });
    }

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
        $('#submit-edit').attr("id", "submit-add");
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
        // Input to firebase
        var newListing = firebase.database().ref("listings").push({
            item: item,
            quantity: quantity,
            street: street,
            zipCode: zipCode,
            date: date,
            uid: currentUser.uid
        });

        //add new listing to items list on firebase
        firebase.database().ref("items").child(item).push(newListing.key);

        $('#addListing').modal('hide');
    });

    var listingId;
    // Display form to edit listing
    $(document).on("click", ".edit-listing", function() {
        listingId = $(this).attr("data-id");
        // grab existing values from firebase
        firebase.database().ref("listings").child(listingId).once("value").then(function(snapshot) {
            $("#item").val(snapshot.val().item);
            $("#quantity").val(snapshot.val().quantity);
            $("#street").val(snapshot.val().street);
            $("#zip-code").val(snapshot.val().zipCode);
            $("#date").val(snapshot.val().date);
        });
        $('#addListing').modal('show');
        $('#submit-add').attr("id", "submit-edit");
    });

    // Submit form to edit listing
    $(document).on("click", "#submit-edit", function(event) {
        event.preventDefault();

        // Get the input values
        var item = $("#item").val();
        var quantity = $("#quantity").val();
        var street = $("#street").val();
        var zipCode = $("#zip-code").val();
        var date = $("#date").val();
        // update listing in firebase
        firebase.database().ref("listings").child(listingId).update({
            item: item,
            quantity: quantity,
            street: street,
            zipCode: zipCode,
            date: date,
        });

        $("#item").empty();
        $("#quantity").empty();
        $("#street").empty();
        $("#zip-code").empty();
        $("#date").empty();
        $('#addListing').modal('hide');
        $("#listings").empty();
        displayListings();
    });

    // delete listing
    $(document).on("click", ".delete-listing", function() {
        listingId = $(this).attr("data-id");
        // grab existing values from firebase
        firebase.database().ref("listings").child(listingId).remove();
        $("#listings").empty();
        displayListings();
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

        firebase.database().ref("users").child(currentUser.uid).update({
            bio: bio,
            personal: personalSite
        })
        $("#profile-new").modal("hide");
    });
});