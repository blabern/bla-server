// @flow
const { model } = require("mongoose");
const camelcaseKeys = require("camelcase-keys");

const Purchase = model("Purchase");
const User = model("User");
const { CONVERTKIT_HOOK_NAME } = process.env;

type PurchaseType = {|
  id: string,
  userId: string,
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

type CreateType = (string, {}) => Promise<PurchaseType>;

const create: CreateType = async (hookName, data) => {
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
};

exports.create = create;
