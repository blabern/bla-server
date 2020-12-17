const { Schema, model, ObjectId } = require("mongoose");

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
  userId: { type: ObjectId, required: true },
});

const Purchase = new Schema({
  id: { type: Number, required: true },
  transactionId: { type: String, required: true },
  status: { type: String, required: true },
  emailAddress: { type: String, required: true },
  currency: { type: String, required: true },
  transactionTime: { type: Date, required: true },
  subtotal: { type: Number, required: true },
  shipping: { type: Number, required: true },
  discount: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  products: [
    {
      unitPrice: { type: Number, required: true },
      quantity: { type: Number, required: true },
      sku: { type: String, required: true },
      name: { type: String, required: true },
    },
  ],
});

module.exports = {
  User,
  HistoryEntry,
  Purchase,
};
