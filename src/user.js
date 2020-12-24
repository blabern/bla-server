// @flow
const { User } = require("./models");

type UpdateType = (User) => Promise<User>;

const update: UpdateType = async (userData) => {
  let user = await User.findOne({ email: userData.email }).exec();

  // It's a signup.
  if (!user) {
    user = new User({
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
