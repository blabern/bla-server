// @flow
const stripe = require("./stripe");

type ReadType = (string) => Promise<{| history: boolean |}>;

const read: ReadType = async (userId) => {
  const allPurchases = []; //await stripe.read(userId);
  return {
    // TODO make sure purchase have actual valid subscription for the month
    history: allPurchases.length > 0,
  };
};

module.exports = { read };
