// @flow
const { model } = require("mongoose");
const camelcaseKeys = require("camelcase-keys");

const Purchase = model("Purchase");
const User = model("User");
const { CONVERTKIT_HOOK_NAME } = process.env;

type ConvertkitPurchaseType = {|
  id: string,
  transactionId: string,
  status: string,
  emailAddress: string,
  currency: string,
  transactionTime: Date,
  subtotal: number,
  shipping: number,
  discount: number,
  tax: number,
  total: number,
  products: [
    {|
      unitPrice: number,
      quantity: number,
      sku: string,
      name: string,
    |}
  ],
|};

type PurchaseType = {|
  ...ConvertkitPurchaseType,
  userId: string,
|};

type CreateType = (string, ConvertkitPurchaseType) => Promise<PurchaseType>;

const create: CreateType = async (hookName, data) => {
  // $FlowIgnore
  return "Convertkit has no way to test hooks, it sucks and I can't use hooks.";
  /*
  if (hookName !== CONVERTKIT_HOOK_NAME) {
    throw new Error("Unauthorized");
  }
  const camelCasedData = camelcaseKeys(data, { deep: true });
  const user = await User.find({ email: camelCasedData.emailAddress }).exec();
  if (!user) {
    throw new Error("Purchase made for unknown user");
  }
  camelCasedData.userId = user._id;
  const purchase = new Purchase(camelCasedData);
  await purchase.save();
  return purchase;
  */
};

module.exports = { create };
