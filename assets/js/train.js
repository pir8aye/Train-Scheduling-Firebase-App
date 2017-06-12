// FIREBASE CONFIG
var config = {
        apiKey: "AIzaSyAaB6WcM_oga0zDRvy6KTc03K1qaAmNnrI",
        authDomain: "trains-f6b6a.firebaseapp.com",
        databaseURL: "https://trains-f6b6a.firebaseio.com",
        projectId: "trains-f6b6a",
        storageBucket: "trains-f6b6a.appspot.com",
        messagingSenderId: "339385469335"
};
firebase.initializeApp(config);


//NOTES TO SELF
// ID AND CLASS LIST FROM INDEX.HTML
// train-x = TRAIN NAME
// city-x = DESTINATION
// first-leaves-x = TIME OF FIRST TRAIN
// leaves-every-x = TIME BETWEEN TRAINS
// irvine-express = TABLE NAME
// add-button-x = ADD NEW TRAIN BUTTON


// CLEAR ALL TEXT INPUTS AFTER NEW TRAIN IS ADDED
var clearInputs = function() {
  $("#train-x").val("");
  $("#city-x").val("");
  $("#first-leaves-x").val("");
  $("#leaves-every-x").val("");
};


var createNewIrvineExpress = firebase.database();


// STORE TRAIN SCHEDULE IN FIREBASE
$("#add-button-x").on("click", function() {


// LETS CHECK TO SEE IF THE FORM IS EMPTY FIRST
 if ( document.getElementById('train-x').value === '' || document.getElementById('city-x').value === '' || document.getElementById('first-leaves-x').value === '' || document.getElementById('leaves-every-x').value === '' ) {
      alert("You need to enter all train information");
      return false;
} else {

  // SETUP VARIABLES FOR TRAIN SCHEDULE INFORMATION
  // GET THE TRAIN NAME INPUT TEXT
  var train = $("#train-x").val().trim();
  // GET THE TRAVELING TO CITY INPUT TEXT
  var city = $("#city-x").val().trim();
  // GET THE TRAIN NAME INPUT TEXT
  var firstLeaves = moment($("#first-leaves-x").val().trim(), "HH:mm").subtract(10, "years").format("X");
  // GET THE TIME BETWEEN TRAINS INPUT TEXT
  var leavesEvery = $("#leaves-every-x").val().trim();

  // VARIABLE FOR FIREBASE OBJECT
  // name
  // destination
  // firstTrain
  // frequency

  var addIrvineExpress = { name: train, destination: city, firstTrain: firstLeaves, frequency: leavesEvery };

  // PUSH ALL DATA TO THE DATABASE
  createNewIrvineExpress.ref().push(addIrvineExpress);

  // EMPTY THE INPUTS
  clearInputs();

// LET'S ADD A RETURN FALSE TO PREVENT THE FUNCTION FROM EXECUTING UNLESS THE BUTTON IS CLICKED
  return false;
    }
});

/* 
ADD THE NEW TRAIN TO THE TABLE

EXAMPLE FROM FIREBASE API AND CHILD_ADDED FROM https://stackoverflow.com/questions/41517682/onchild-added-vs-oncechild-added
Test for the existence of certain keys within a DataSnapshot

var ref = firebase.database().ref("users/ada");
ref.once("value")
  .then(function(snapshot) {
    var name = snapshot.child("name").val(); // {first:"Ada",last:"Lovelace"}
    var firstName = snapshot.child("name/first").val(); // "Ada"
    var lastName = snapshot.child("name").child("last").val(); // "Lovelace"
    var age = snapshot.child("age").val(); // null
  });

 Assume we have the following data in the Database:
{
  "name": {
    "first": "Ada",
    "last": "Lovelace"
  }
}

// Test for the existence of certain keys within a DataSnapshot
var ref = firebase.database().ref("users/ada");
ref.once("value")
  .then(function(snapshot) {
    var a = snapshot.exists();  // true
    var b = snapshot.child("name").exists(); // true
    var c = snapshot.child("name/first").exists(); // true
    var d = snapshot.child("name/middle").exists(); // false
  });
Loop through users in order with the forEach() method. The callback
provided to forEach() will be called synchronously with a DataSnapshot
for each child:
var query = firebase.database().ref("users").orderByKey();
query.once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
     key will be "ada" the first time and "alan" the second time
      var key = childSnapshot.key;
      childData will be the actual contents of the child
      var childData = childSnapshot.val();
  });
});


When you use once, you're asking for a single event of the indicated type. 
So once("child_added" fires a single child_added event.

The fact that your on fires multiple times, is likely a race condition because of the way you ordered the calls. 
I'd expect this to also invoke only once:

ref.on('child_added',function(child,prev){
  console.log(child.key+prev);
  ref.off();
}
*/



createNewIrvineExpress.ref().on("child_added", function(childSnapshot, prevChildKey) {

  // FIREBASE OBJECT
  // name
  // destination
  // firstTrain
  // frequency

  var nameOfTrain = childSnapshot.val().name;

  var nameOfCity = childSnapshot.val().destination;
  
  var trainLeavesFirst = childSnapshot.val().firstTrain;

  var trainFrequency = childSnapshot.val().frequency;

  // Calculate the minutes until arrival using hardcore math
  // To calculate the minutes till arrival, take the current time in unix subtract the FirstTrain time
  // and find the modulus between the difference and the frequency.


  // FROM MOMENTS.JS API https://momentjs.com/docs/#/parsing/unix-timestamp/
  // Unix Timestamp (seconds) 
  //To create a moment from a Unix timestamp (seconds since the Unix Epoch), use moment.unix(Number).
  //moment.unix(Number)
  //var day = moment.unix(1318781876);
  //This is implemented as moment(timestamp * 1000), so partial seconds in the input timestamp are included.
  //var day = moment.unix(1318781876.721);


  // CREATE AN ALGORITHM TO HANDLE TRAIN TIMES
  // Difference 1.0.0
  // moment().diff(Moment|String|Number|Date|Array);
  // moment().diff(Moment|String|Number|Date|Array, String);
  // moment().diff(Moment|String|Number|Date|Array, String, Boolean);
  // GET A UNIX VALUE
  // moment(1318874398806).unix(); // this will equal 1318874398

  //UNIX TIME GIVES US A CONSTANT TIME VARIABLE TO WORK WITH

                                                //    vvvv trainLeavesFirst is a childSnapshot of firstTrain from Firebase in minutes     
  var differenceTimes = moment().diff(moment.unix(trainLeavesFirst), "minutes");
    console.log ("difference in time: " + differenceTimes); // lets see what we get

     // vvvv minutesLeft is going to be          vvvv trainLeavesFirst     vv divided by the trainFrequency i.e. if the first train leaves at 6:00 converted to unix time (something long and crazy) and we divide by a train frequency of 60 minutes
  var minutesLeft = moment().diff(moment.unix(trainLeavesFirst), "minutes") % trainFrequency;
  console.log ("minutes left: " + minutesLeft); // lets see what we get

      // now we have a totalTime variable that takes the trainFrequency i.e 60 minutes - minutesLeft = 6 
  var totalTime = trainFrequency - minutesLeft;
  console.log ("total time: " + totalTime); // lets see what we get

  /* FROM THE CONSOLE:
difference in time: 5261035   (This is the total minutes since Jan 01 1970. (UTC))
minutes left: 35  (minutes that have passed from the LeavesEvery time) (200 - 35) = totalTime (165 minutes)
total time: 165 (This is the minutes away the next train is from arriving)



       _---~~(~~-_.
     _{         )    )
   ,   ) -~~- ( ,-'    )_
  (  `-,_..` ., )--   '_,)
 ( ` _)  (  -~( -_ `  ,  }
 (_-  _  ~_- ~~~~`,  ,'   )
   `~ -^(    _ _;-,( (()))
         ~~~~ {_ -_(())
                `\   }
                  { }

/////////// MY BRAIN HURTS ///////////


*/


//NOW WE NEED TO GET THE TIME OF THE NEXT TRAIN LEAVING FOR EACH LOCATION

  // USE MOMENT.JS TO GENERATE THE NEXT TRAIN TIME FROM https://momentjs.com/docs/#/parsing/unix-timestamp/
 // You can eliminate the lowercase l tokens and they will be created automatically by replacing 
 // long tokens with the short token variants.
/*
                              moment.updateLocale('en', {
                              longDateFormat : {
 THIS IS THE FORMAT I NEED  >>>>  LT: "hh:mm A",
                                  LTS: "h:mm:ss A",
                                  L: "MM/DD/YYYY",
                                  LL: "MMMM Do YYYY",
                                  LLL: "MMMM Do YYYY LT",
                                  LLLL: "dddd, MMMM Do YYYY LT"
    }
});
*/
  // PARSING HOUR AND MINUTES
  // USE MOMENT .ADD AND .FORMAT

  //moment().add(123, 'm');

  //moment("123", "hmm").format("HH:mm") === "01:23"
  //moment("1234", "hmm").format("HH:mm") === "12:34"
  
  // WE ARE USING JUST MINUTES SO WE'LL USE "m"
  // SO var nextTrainTime = moment().add(totalMinutes, "m").format(hh:mm A)


// WE GOT A totalTime OF 165 (REALLY THE TIME LEFT) FROM ABOVE NOW WE TAKE THAT 165 AND CONVERT IT TO MINUTES THEN FORMAT IT INTO HH:MM A
// SO WE ARE TAKING THE ORIGINAL UNIX TIME WE HAD FROM ABOVE AND ADDING 165 MINUTES TO IT THEN CONVERTING THAT TIME TO HOURS AND MINUTES
// THIS WILL GIVE US A TIME IN THE FUTURE EQUIVALENT TO 165 MINUTES FROM THIS MOMENT
// THANK YOU MOMENT JS !!!  
  var nextTrainTime = moment().add(totalTime, "m").format("hh:mm A");
 console.log ("arrival time: " + nextTrainTime); // lets see what we get
 //FROM THE CONSOLE:
 // arrival time: 08:40 PM (Looks correct!)


 //FINALLY, LETS THROW ALL THIS NEW GENERATED INFO INTO THE IRVIN-EXPRESS TABLE
 // OUR 5 VARIABLES
 // nameOfTrain = name from firebase
 // nameOfCity = city name from firebase
 // trainFrequency = frequency from firebase
 // nextTrainTime = what we generated using moment.js and is a 00:00 time format
 // totalTime = what we generated from moment.js is really the time till the next train leaves and is formatted in minutes.


  // APPEND THE NEW TRAIN SCHEDULE TO IRVINE-EXPRESS tbody TABLE TAG 
  // JOINED TOGETHER WITH </td><td> TAGS TO DISPLAY INFO ACROSS COLUMNS OF THE TABLE
  $("#irvine-express > tbody").append("<tr> <td>" + nameOfTrain + "</td> <td>" + nameOfCity + "</td> <td>" + trainFrequency + "</td> <td>" + nextTrainTime + "</td> <td>" + totalTime + "</td> </tr>");

});