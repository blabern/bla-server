const { Schema, model } = require("mongoose");

const User = new Schema({
  email: { type: String, required: true, unique: true },
  locale: { type: String, required: true },
  sub: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  familyName: String,
  givenName: String,
  preferredUsername: String,
});

const HistoryEntry = new Schema({
  createdAt: { type: Date, required: true },
  subtitle: { type: String, required: true },
  words: { type: [{ pos: Number, text: String }], required: true },
});

module.exports = {
  User,
  HistoryEntry,
};
