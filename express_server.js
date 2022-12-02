const express = require("express");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080

// set the view engine to ejs
app.set("view engine", "ejs");

app.use(cookieParser());
app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//User database for Registering New Users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


//Returns a string of 6 random alphanumeric characters:
const generateRandomString = () => {
  return Math.random().toString(36).substring(6);
};

//Helper Function:
const getUserByEmail = function(email) {
  let foundUser = null;
  for (let userId in users) {
    if (email === users[userId].email) {
      foundUser = userId;
    }
  }
  return foundUser;
};


//Delete Method to delete a url from the database.
app.post('/urls/:id/delete', (req, res) => {
  const urlId = req.params.id;

  // delete that url from the database
  delete urlDatabase[urlId];

  // redirect to the list of urls
  res.redirect("/urls");
});

// create the update route => when the user clicks on update from the show page
app.post('/urls/:id', (req, res) => {
  // extract the id from the path of the url
  const urlId = req.params.id;

  // extract the user input from the form (post data)
  // req.body
  const longURL = req.body.longURL;

  // update our db for that url
  urlDatabase[urlId] = longURL;
  res.redirect(`/urls`);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// Following three get methods update for Cookies in Expres Assignment
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {username: req.cookies["username"]};//username cookie
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]}; // username cookie
  res.render("urls_show", templateVars);
});

// added 2 post methods for "login" and "logout"
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  const username = req.body.username;
  res.clearCookie('username', username);
  res.redirect('/urls');
});

// Method for registartion form
app.get("/register", (req, res) => {
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // are email and/or password undefined
    if (!email || !password) {
      return res.status(400).send('Please provide an email AND a password');
    }
    if (getUserByEmail(email)) {
      return res.status(400).send("You've already registered this email!");
    }
  res.cookie('email', email);
  const userId = generateRandomString();
  users.userId = {
    id: userId,
    email: email,
    password: password
  };
  console.log(users);
  res.cookie('userId', userId);  
    res.redirect('/urls');
});



app.get("/", (req, res) => {
  res.send("Hello!");
});

/*
previous exercises:
app.get("/hello", (req, res) => {
  const templateVars = { greeting: "Hello World!" };
  res.render("hello_world", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
*/

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
