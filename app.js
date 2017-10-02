var express = require('express');
var path = require('path');
var app = express();

// Define the port to run on
app.set('port', 5100);

// Define the Document Root path
var sPath = path.join(__dirname, '.');

app.use(express.static(sPath));

// Define a method for the webhook
app.get("/api/chatbot", (req, res)=>{ 
    res.send("Hello from the chatbot");

});

// Listen for requests
var server = app.listen(app.get('port'), () =>{
  var port = server.address().port;
  console.log('Listening on localhost:' + port);
  console.log("Document Root is " + sPath);
});