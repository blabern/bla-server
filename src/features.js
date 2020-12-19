// @flow
const stripe = require("./stripe");

type ReadType = (bson$ObjectId) => Promise<{| history: boolean |}>;

const read: ReadType = async (userId) => {
  const hasActiveSubscription = await stripe.hasActiveSubscription(userId);
  return {
    history: hasActiveSubscription,
  };
};

module.exports = { read };
