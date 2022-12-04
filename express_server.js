const {generateRandomString, getUserByEmail, urlsForUser} = require('./helpers');
const express = require("express");
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(morgan('dev'));

app.use(cookieSession({
  name: 'user_id',
  keys: ['user_id'],
  maxAge: 24 * 60 * 60 * 1000
}));

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
  jd0ljx: {
    id: "jd0ljx",
    email: "m@m.com",
    password: "$2a$10$EfPeMPAQxfNbmXOEWYHOf.BIkliFMCHiAB/zM3bYoOssAmbr3TTk6",
  }
};

app.get("/", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h2>Please login to update! <h2> First Login!<a href ="/login">Login</a>`);
  }
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: user_id};
  res.redirect(`/urls/${shortURL}`);
});

//Delete Method to delete a url from the database.
app.post('/urls/:id/delete', (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h2>Not Logged in!<h2>Please Try Again: <a href ="/login">Login</a>`);
  }
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h2>Invalid shortcode <h2> <a href ="/urls">Please Try Again</a>`);
  }
  if (urlDatabase[shortURL].userID !== user_id) {
    return res.status(400).send(`<h2>his short code doesn't belong to you!<h2> <a href ="/urls">Please try Again</a>`);
  }
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h2>Login first!<h2>Please Try Again: <a href ="/login">Login </a>`);
  }
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h2>Invalid Short Code!<h2> <a href ="/urls">Please Try Again.</a>`);
  }
  if (urlDatabase[shortURL].userID !== user_id) {
    return res.status(400).send(`<h2>This short code doesn't belong to you!!<h2> <a href ="/urls">Please try again.</a>`);
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
      res.status(400).send(`<h2>This short url not found!<h2> <a href ="/u/:id">Please Try Again</a>`);
    } else {
      res.redirect(longURL);
    }
  } else {
    res.status(400).send(`<h2>This short url not found!<h2> <a href ="/urls">Please Try Again</a>`);
  }
});

app.get("/urls", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h2>Please login!<h> <a href ="/login">Login</a>`);
  }
  let userURL = urlsForUser(user_id, urlDatabase);
  const user = users[user_id];
  const templateVars = { user, urls: userURL };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    res.send(`<h2>Please Login!<h2> <a href ="/login">Login:</a>`);
    return res.redirect('/login');
  }
  const user = users[user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const user_id = req.session['user_id'];
  if (!user_id) {
    return res.status(400).send(`<h2>Please Login!<h2> <a href ="/login">Login: </a>`);
  }
  const user = users[user_id];
  const shortURL = req.params.id;
  if (!urlDatabase[shortURL]) {
    return res.status(400).send(`<h2>This shortcode does not exist!<h2> <a href ="/urls">Please Try Again!.</a>`);
  }
  if (urlDatabase[shortURL].userID !== user_id) {
    return res.status(400).send(`<h2>This is not your shortcode!<h2> <a href ="/urls">Please Try Again</a>`);
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
  req.session = null;
  res.redirect('/login');
});

// Method for registartion form
app.get("/register", (req, res) => {
  const user_id = req.session['user_id'];
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
    return res.status(400).send(`<h2>Please provide an email AND a password!<h2>Please Try Again: <a href ="/register">Register</a>`);
  }
  if (getUserByEmail(email, users)) {
    return res.status(400).send(`<h2>Email already registerd.!<h2>Please Try Again: <a href ="/register">Register</a>`);
  }
  const user_id = generateRandomString();
  req.session.user_id = user_id;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id: user_id,
    email: email,
    password: hashedPassword
  };
  users[user_id] = user;
  res.redirect('/urls');
});

//Method for Login form
app.get('/login', (req, res) => {
  const user_id = req.session['user_id'];
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
    return res.status(400).send(`<h2>Please provide an email AND a password!<h2>Please Try Again: <a href ="/login">Login</a>`);
  }
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(400).send(`<h2>Email not registered yet!<h2>Please Register First: <a href ="/register">Register</a>`);
  }
  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(400).send(`<h2>Email or password is incorrect!<h2>Please Try Again! <a href ="/login">Login</a>`);
  }
  const user_id = user.id;
  req.session.user_id = user_id;
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});