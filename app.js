var express = require('express');
var path = require('path');
var app = express();
var bodyParser = require('body-parser');
var twilio = require('twilio');

var oConnections = {};

// Define the port to run on
app.set('port', process.env.PORT || parseInt(process.argv.pop()) || 5100);

// Define the Document Root path
var sPath = path.join(__dirname, '.');

app.use(express.static(sPath));
app.use(bodyParser.urlencoded({ extended: true }));

function fEnd(req, res){
  var sFrom = req.body.From;
  oConnections[sFrom].fCurState = fHelp;
  var twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Thank you for taking the time to chat with us. Have a great day :)');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

}

function fBookConfirmation(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    oConnections[sFrom].fCurState = fSportsDeals;
    twiml.message("Perfect. I will save your phone number and I will text you our gym availability.");
  }else if(sAction.toLowerCase().search("no") != -1){
    twiml.message("No worries. Is there anything else I can help you with today?");
    oConnections[sFrom].fCurState = fEnd;

  }else{
    twiml.message("Sorry, wrong option. Try again!");
    oConnections[sFrom].fCurState = fBook;

  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}
function fBook(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    oConnections[sFrom].fCurState = fBookConfirmation;
    twiml.message("Would you like me to give you a time to come in and book the gym?");
  }else if(sAction.toLowerCase().search("no") != -1){
    twiml.message("No worries. Is there anything else I can help you with today?");
    oConnections[sFrom].fCurState = fEnd;

  }else{
    twiml.message("Sorry, wrong option. Try again!");
    oConnections[sFrom].fCurState = fChooseSport;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}
function fChooseSport(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("basketball") != -1){
    oConnections[sFrom].fCurState = fBook;
    twiml.message("You pay $5 on tuesdays for the whole time you're using the gym! Type yes if you like this deal!");
  }else if(sAction.toLowerCase().search("volleyball") != -1){
    twiml.message("You get to play for free everytime you come with at least 6 people! type yes if you like this deal!");
    oConnections[sFrom].fCurState = fBook;
  }else{
    twiml.message("Wrong option! Please try again.");
    oConnections[sFrom].fCurState = fSportsDeals;

  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}
function fSportsDeals(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    oConnections[sFrom].fCurState = fChooseSport;
    twiml.message("Choose the sport that you'd like to know more!");
  }else if(sAction.toLowerCase().search("no") != -1){
    twiml.message("No worries. Is there anything else I can help you with today?");
    oConnections[sFrom].fCurState = fEnd

  }else{
    twiml.message("Sorry, wrong option. Try again!");
    oConnections[sFrom].fCurState = fDeclareSports;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fDeclareSports(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("ok") != -1){
    oConnections[sFrom].fCurState = fSportsDeals;
    twiml.message("Would you like to know our deals for each sport?");
  }else{
    twiml.message("Wrong option!");
    oConnections[sFrom].fCurState = fInfo;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fInfo(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("business hours") != -1){
    twiml.message("We are open from Mondays - Saturdays, 8 am - 6 pm. Type ok to continue.");
    oConnections[sFrom].fCurState = fDeclareSports;
  }else if(sAction.toLowerCase().search("services") != -1){
    twiml.message("We provide recreational services such as volleyball and basketball. Type ok to continue");
    oConnections[sFrom].fCurState = fDeclareSports;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fDeclare(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    oConnections[sFrom].fCurState = fInfo;
    twiml.message("Great! Do you want to know our business hours or our services that we provide?");
  }else{
    twiml.message("I suppose you're talking to the wrong person.");
    oConnections[sFrom].fCurState = fHelp;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}


function fHelp(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("Is this the first time that you've heard about us?");
    oConnections[sFrom].fCurState = fDeclare;
  }else{
    twiml.message("Thank you for your service! Have a great day!");
    oConnections[sFrom].fCurState = fEnd;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fBeginning(req, res){
  var sFrom = req.body.From;
  oConnections[sFrom].fCurState = fHelp;
  var twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Hi ... My name is Jojo. Would you like me to help you with something today?');
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());

}

//define a method for the twilio webhook
app.post('/sms', function(req, res) {
  var sFrom = req.body.From;
  if(!oConnections.hasOwnProperty(sFrom)){
    oConnections[sFrom] = {"fCurState":fBeginning};
  }
  oConnections[sFrom].fCurState(req, res);
});

// Listen for requests
var server = app.listen(app.get('port'), () =>{
  var port = server.address().port;
  console.log('Listening on localhost:' + port);
  console.log("Document Root is " + sPath);
});
