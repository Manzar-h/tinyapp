//Returns a string of 6 random alphanumeric characters:
const generateRandomString = () => {
  return Math.random().toString(36).substring(2,8);
};

//Return user, if find email address in Database.
const getUserByEmail = function(email, users) {
  let foundUser = null;
  for (let userID in users) {
    if (email === users[userID].email) {
      foundUser = users[userID];
    }
  }
  return foundUser;
};

//Return an object of URLs with same userID as the user
const urlsForUser = function(ID, urlDatabase)  {
  const userURL = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase[urlID].userID === ID) {
      const obj = {
        longURL: urlDatabase[urlID].longURL,
        userID: urlDatabase[urlID].userID
      };
      userURL[urlID] = obj;
    }
  }
  return userURL;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser };