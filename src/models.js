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
const UserModel: Class<UserDocument> = model("User", UserSchema);

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
const HistoryEntryModel: Class<HistoryEntryDocument> = model("HistoryEntry", HistoryEntrySchema);

class SubscriptionDocument /*:: extends Mongoose$Document */ {
  email: string;
  subscriptionId: string;
  createdAt: Date;
  updatedAt: Date;
  status:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid";
}

const SubscriptionSchema = new Schema({
  email: { type: String, required: true },
  subscriptionId: { type: String, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  status: { type: String, required: true },
});

SubscriptionSchema.loadClass(SubscriptionDocument);
// prettier-ignore
const SubscriptionModel: Class<SubscriptionDocument> = model("Subscription", SubscriptionSchema);

module.exports = {
  UserModel,
  HistoryEntryModel,
  SubscriptionModel,
};
