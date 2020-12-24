// @flow
const { UserModel } = require("./models");

type UpdateType = (UserModel) => Promise<UserModel>;

const update: UpdateType = async (userData) => {
  let user = await UserModel.findOne({ email: userData.email }).exec();

  // It's a signup.
  if (!user) {
    user = new UserModel({
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  Object.assign(user, userData);
  user.updatedAt = new Date();
  await user.save();
  return user;
};

module.exports = { update };
