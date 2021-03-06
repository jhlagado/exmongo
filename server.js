// server.js
// where your node app starts

// init
// setup express for handling http requests
var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static('public')); // http://expressjs.com/en/starter/static-files.html
var connected=false;
app.listen(3000);
console.log('Listening on port 3000');
    
// setup nunjucks for templating in views/index.html
var nunjucks = require('nunjucks');
nunjucks.configure('views', { autoescape: true, express: app });

// setup our datastore
var datastore = require("./datastore").sync;
datastore.initializeApp(app);

// create routes
app.get("/", function (request, response) {
  try {
    initializeDatastoreOnProjectCreation();
    var posts = datastore.get("posts");
    response.render('index.html', {
      title: "Welcome!",
      posts: posts.reverse()
    });
  } catch (err) {
    console.log("Error: " + JSON.stringify(err));
    handleError(err, response);
  }
});

app.post("/posts", function (request, response) {
  try {
    // Get the existing posts from the MongoDB and put it into an array called posts
    var posts = datastore.get("posts");
    // We get the contents of the submitted form and append it to the posts array
    posts.push(request.body); // the form data is in request.body because we're using the body-parser library to help make dealing with requests easier
    // We store the updated posts array back in our database posts entry
    datastore.set("posts", posts);
    // And then we redirect the view back to the homepage
    response.redirect("/");
  } catch (err) {
    handleError(err, response);
  }
});

app.get("/reset", function (request, response) {
  try {
    datastore.removeMany(["posts", "initialized"]);
    response.redirect("/");
  } catch (err) {
    handleError(err, response);
  }
});

app.get("/delete", function (request, response) {
  try {
    datastore.set("posts", []);
    response.redirect("/");
  } catch (err) {
    handleError(err, response);
  }
});

function handleError(err, response) {
  response.status(500);
  response.send(
    "<html><head><title>Internal Server Error!</title></head><body><pre>"
    + JSON.stringify(err, null, 2) + "</pre></body></pre>"
  );
}

// ------------------------
// DATASTORE INITIALIZATION

function initializeDatastoreOnProjectCreation() {
  if(!connected){
    connected = datastore.connect();
  }
  if (!datastore.get("initialized")) {
    datastore.set("posts", initialPosts);
    datastore.set("initialized", true);
  }  
}

var initialPosts = [
  {
    title: "Hello!",
    body: "Among other things, you could make a pretty sweet blog."
  },
  {
    title: "Another Post",
    body: "Today I saw a double rainbow. It was pretty neat."
  }
];