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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
//Helper Function:
const urlsForUser = function(id) {
  const userURL = {};
  for (let urlID of urlDatabase) {
    if (urlDatabase[urlID].userID === id) {
      userURL[urlID] = {
        longURL: urlDatabase[urlID].longURL,
        userID: urlDatabase[urlID].userID
      };
    }
  }
  return userURL;
};

app.get("/", (req, res) => {
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h1>Please login to update! <h1> <a href ="/login">Login: First Login!</a>`);
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: user_id};
  res.redirect(`/urls/${shortURL}`);
});

//Delete Method to delete a url from the database.
app.post('/urls/:id/delete', (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h1>Not Loggen in!<h1> <a href ="/login">Login: Please Try Again</a>`);
  }
  const user = users[user_id];
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h1>Invalid shortcode <h1> <a href ="/urls">Please Try Again</a>`);
  }
  if (urlDatabase[shortURL].userID != user_id) {
    return res.status(400).send(`<h1>his short code doesn't belong to you!<h1> <a href ="/urls">Please try Again</a>`);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h1>Login first!<h1> <a href ="/login">Login: Please Try Again</a>`);
  }
  const user = users[user_id];
  const id = req.params.id;
  if (!urlDatabase[id]) {
    return res.status(400).send(`<h1>Invalid Short Code!<h1> <a href ="/urls">Please Try Again.</a>`);
  }
  if (urlDatabase[id].userID !== user_id) {
    return res.status(400).send(`<h1>This short code doesn't belong to you!!<h1> <a href ="/urls">Please try again.</a>`);
  }
  const urlId = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[urlId] = longURL;
  res.redirect('/urls');
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase[req.params.id]) {
    const longURL = urlDatabase[req.params.id].longURL;
    if (!longURL) {
      res.status(400).send(`<h1>This short url not found!<h1> <a href ="/u/:id">Please Try Again</a>`);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(400).send(`<h1>This short url not found!<h1> <a href ="/urls">Please Try Again</a>`);
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h1>Please login!<h1> <a href ="/login">Login: </a>`);
  }
  let userURL = urlsForUser(user_id);
  const user = users[user_id];
  const templateVars = { user, urls: userURL };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    res.send(`<h1>Please Login!<h1> <a href ="/login">Login:</a>`);
    return res.redirect('/login');
  }
  const user = users[user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.cookies['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h1>Please Login!<h1> <a href ="/login">Login: </a>`);
  }
  const user = users[user_id];
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h1>This shortcode does not exist!<h1> <a href ="/urls">Please Try Again!.</a>`);
  }
  if (urlDatabase[shortURL].userID !== user_id) {
    return res.status(400).send(`<h1>This is not your shortcode!<h1> <a href ="/urls">Please Try Again</a>`);
  }
  const longURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    id: shortURL,
    longURL,
    user
  };
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
    return res.status(400).send(`<h1>Please provide an email AND a password!<h1> <a href ="/register">Registration: Please Try Again</a>`);
  }
  if (getUserByEmail(email)) {
    return res.status(400).send(`<h1>Email already registerd.!<h1> <a href ="/register">Registration: Please Try Again</a>`);
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
  if (!email || !password) {
    return res.status(400).send(`<h1>Please provide an email AND a password!<h1> <a href ="/login">Login: please Try Again</a>`);
  }
  const user = getUserByEmail(email);
  if (!user) {
    return res.status(400).send(`<h1>Email not registered yet!<h1> <a href ="/register">Register: Please Register First</a>`);
  }
  if (user.password !== password) {
    return res.status(400).send(`<h1>Email or password is incorrect!<h1> <a href ="/login">Login: please try Again</a>`);
  }
  const user_id = user.id;
  res.cookie('user_id', user_id);
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});