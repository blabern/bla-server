const { model } = require("mongoose");
const camelcaseKeys = require("camelcase-keys");

const Purchase = model("Purchase");
const { CONVERTKIT_HOOK_NAME } = process.env;

exports.create = async (hookName, data) => {
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
