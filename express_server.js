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
    password: "abcd",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234",
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
      foundUser = users[userId];
    }
  }
  return foundUser;
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send("Please login to update!");
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Delete Method to delete a url from the database.
app.post('/urls/:id/delete', (req, res) => {
  const urlId = req.params.id;
  delete urlDatabase[urlId];
  res.redirect('/urls');
});

// create the update route => when the user clicks on update from the show page
app.post('/urls/:id', (req, res) => {
  const urlId = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[urlId] = longURL;
  res.redirect('/urls');
});


app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.status(400).send("Short url not found!");
  } else {
    res.redirect(longURL);
  }
});

// Following three get methods update for Cookies in Expres Assignment
app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.redirect('/login');
  }
  const user = users[user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"]};
  res.render("urls_show", templateVars);
});

app.post('/logout', (req, res) => {
  const user_id = req.body.user_id;
  res.clearCookie('user_id', user_id);
  res.redirect('/login');
});


// Method for registartion form
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  if  (user_id) {
    return res.redirect('/urls');
  }
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("register", templateVars);
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }
  if (getUserByEmail(email)) {
    return res.status(400).send('Email already registerd.');
  }
  const user_id = generateRandomString();
  const user = {
    id: user_id,
    email: email,
    password: password
  };
  users[user_id] = user;
  res.cookie('user_id', user);
  res.redirect('/urls');
});


//Method for Login form
app.get('/login', (req, res) => {
  const user_id = req.cookies['user_id'];
  if  (user_id) {
    return res.redirect('/urls');
  }
  const user = users[user_id];
  const templateVars = { user, urls: urlDatabase };
  res.render("login", templateVars);
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // are email and/or password undefined
  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(400).send("Email not registered yet!");
  }
  if (user.password !== password) {
    return res.status(400).send("Email or password is incorrect!");
  }
  const user_id = user.id;
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});