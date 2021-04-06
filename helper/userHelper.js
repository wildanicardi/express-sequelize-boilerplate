const {
User
} = require("../models");

exports.findUserById = async (userId) => {
  const user = await User.findOne({
    where:{
      user_id:userId
    }
  });
  return user;
}
exports.phoneNumberUser = async (userId) => {
  const user = await User.findOne({
    where:{
      user_id:userId
    }
  });
  return user.phoneNumber;
}