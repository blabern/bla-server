const { model } = require("mongoose");

const User = model("User");

exports.update = async (userData) => {
  let user = await User.findOne({ email: userData.email }).exec();

  // It's a signup.
  if (!user) {
    user = new User(userData);
  }

  Object.assign(user, userData);
  await user.save();
  return user;
};
