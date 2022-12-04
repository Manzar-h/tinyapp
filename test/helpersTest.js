const { assert } = require('chai');

const {generateRandomString, getUserByEmail, urlsForUser} = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);

  });

  it('should return undefined with an email that is not in our database', function() {
    const user = getUserByEmail("manzar@t.com", testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});