const { Schema, model } = require("mongoose");

const User = new Schema({
  email: String,
  familyName: String,
  givenName: String,
  preferredUsername: String,
  locale: String,
  sub: String,
});

module.exports = {
  User,
};
