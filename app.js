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

function fPlay(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("yes") != -1){
    twiml.message("Oh glory. Here it is. I got it for you. Do you throw it again?");
  }else if(sAction.toLowerCase().search("no") != -1){
    twiml.message("Oh well. Wait .... Over there is that a stick or a fire hydrant?");
    oConnections[sFrom].fCurState = fStickOrHydrant;
  }else{
    twiml.message("Wow! I've never seen you do " + sAction + " before. Wait .... Over there is that a stick or a fire hydrant?")
    oConnections[sFrom].fCurState = fStickOrHydrant;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fStick(req, res){
  var sFrom = req.body.From;
  var sAction = req.body.Body;
  var twiml = new twilio.twiml.MessagingResponse();
  if(sAction.toLowerCase().search("eat") != -1){
    oConnections[sFrom].fCurState = fStickOrHydrant;
    twiml.message("Yum! Sticks are the best thing ever lot's of roughage. Wait .... Over there is that a stick or a fire hydrant?");
  }else if(sAction.toLowerCase().search("take") != -1){
    twiml.message("Please play with me. Do you throw the stick?");
    oConnections[sFrom].fCurState = fPlay;
  }else{
    twiml.message("Wow! I've never done " + sAction + " before. Wait .... Over there is that a stick or a fire hydrant?")
    oConnections[sFrom].fCurState = fStickOrHydrant;
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
  }else {
    twiml.message("Thank you for your service! Have a great day!");
    oConnections[sFrom].fCurState = fBeginning;
  }
  res.writeHead(200, {'Content-Type': 'text/xml'});
  res.end(twiml.toString());
}

function fBeginning(req, res){
  var sFrom = req.body.From;
  oConnections[sFrom].fCurState = fHelp;
  var twiml = new twilio.twiml.MessagingResponse();
  twiml.message('Hi ... My name is Jojo. Would you like me to help you something today?');
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
