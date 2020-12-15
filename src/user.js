const { model } = require("mongoose");

const User = model("User");

exports.update = async (userData) => {
  let user = await User.findOne({ email: userData.email }).exec();

  // It's a signup.
  if (!user) {
    user = new User({
      ...userData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }

  Object.assign(user, userData);
  user.updatedAt = Date.now();
  await user.save();
  return user;
};
