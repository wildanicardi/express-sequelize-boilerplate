const Joi = require("joi");
const {
  User
} = require("../models");
const bcrypt = require("bcryptjs");
const Response = require("../helper/response");
const {  StatusCodes} = require('http-status-codes');
//validation register
exports.registerValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};
//validation login
exports.loginValidation = data => {
  const schema = Joi.object({
    email: Joi.string()
      .required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};
exports.findByCredentials = async ({
  email,
  password
},res) => {
  const response = new Response();

  const user = await User.findOne({
    where: {
      email: email
    }
  });
  if (!user) {
    response.setMessage("Wrong Email");
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  const validPass = await bcrypt.compare(password, user.password);
  if (!validPass) {
    response.setMessage("Wrong Password");
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  return user;
};