// @flow
const { Schema, ObjectId, model } = require("mongoose");

class UserDocument /*:: extends Mongoose$Document*/ {
  email: string;
  locale: string;
  sub: string;
  createdAt: Date;
  updatedAt: Date;
  familyName: string;
  givenName: string;
  preferredUsername: string;
}

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  locale: { type: String, required: true },
  sub: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  updatedAt: { type: Date, default: Date.now, required: true },
  familyName: String,
  givenName: String,
  preferredUsername: String,
});

UserSchema.loadClass(UserDocument);

// prettier-ignore
const User: Class<UserDocument> = model("User", UserSchema);

class HistoryEntryDocument /*:: extends Mongoose$Document */ {
  createdAt: Date;
  subtitle: string;
  words: {| pos: number, text: string |}[];
  userId: bson$ObjectId;
}

const HistoryEntrySchema = new Schema({
  createdAt: { type: Date, required: true },
  subtitle: { type: String, required: true },
  words: { type: [{ pos: Number, text: String }], required: true },
  userId: { type: ObjectId, required: true },
});

HistoryEntrySchema.loadClass(HistoryEntryDocument);

// prettier-ignore
const HistoryEntry: Class<HistoryEntryDocument> = model("HistoryEntry", HistoryEntrySchema);

class PurchaseDocument /*:: extends Mongoose$Document */ {
  email: string;
  customerId: string;
  invoiceId: string;
  paymentIntentId: string;
  subscriptionId: string;
  reason: string;
  paidAt: Date;
  periodStart: Date;
  periodEnd: Date;
  status: string;
}

const PurchaseSchema = new Schema({
  email: { type: String, required: true },
  customerId: { type: String, required: true },
  invoiceId: { type: String, required: true },
  paymentIntentId: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  reason: { type: String, required: true },
  paidAt: { type: Date, required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  status: { type: String, required: true },
});

PurchaseSchema.loadClass(PurchaseDocument);
// prettier-ignore
const Purchase: Class<PurchaseDocument> = model("Purchase", PurchaseSchema);

module.exports = {
  User,
  HistoryEntry,
  Purchase,
};
