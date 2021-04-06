const {
  User
} = require("../models");
require("dotenv").config();
const Response = require("../helper/response");
const {  StatusCodes} = require('http-status-codes');
const {
  registerValidation,
  loginValidation,
  findByCredentials,
} = require("../helper/validation");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.registerUser = async (req, res) => {
  const {
    nama,
    email,
    password,
    role_id,
    jabatan,
    phoneNumber
  } = req.body;
  const response  = new Response();
  const {
    error
  } = registerValidation({
    email,
    password,
  });
  if (error)
  {
    response.setMessage("Wrong Validation");
    response.setStatus(false);
    return res.json(response);
  }
  const emailExist = await User.findOne({
    where: {
      email: email,
    },
  });
  if (emailExist)
  {
    response.setMessage("Email Already Exists");
    response.setStatus(false);
    return res.json(response);
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  try {
    const result = await User.create({
      nama,
      email,
      role_id,
      jabatan,
      phoneNumber,
      password: hashPassword,
    });
    response.setMessage("Register Success");
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
};
exports.login = async (req, res) => {
  const {
    email,
    password
  } = req.body;
  const response  = new Response();
  const {
    error
  } = loginValidation({
    email,
    password,
  });
  if (error)
  {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
  try {
    const user = await findByCredentials({
      email,
      password,
    },res);
    const token = jwt.sign({
        userId: user.user_id,
      },
      process.env.TOKEN_SECRET
    );
    const result = {
      access_token:token,
      user:user
    }
    response.setMessage("Login Success");
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
};