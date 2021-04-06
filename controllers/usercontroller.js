const {
  User,Role,Override,Ora,ActiveOff
} = require("../models");
const Response = require("../helper/response");
const {findUserById} = require("../helper/userHelper");
const bcrypt = require("bcryptjs");
const {  StatusCodes} = require('http-status-codes');

exports.userIndex = async (req, res) => {
  const response  = new Response();
  try {
    const result = await User.findAndCountAll({
      include:[{
        model:Role,
        as:"role",
        attributes:["nama"]
      }],
      order: [["user_id", "DESC"]],
    });
    response.setMessage("All User with Role");
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}
exports.userMe = async (req, res) => {
  const response  = new Response();
  const {
    userId
  } = req.user;
  try {
    const result = await User.findOne({
      where: {
        user_id: userId
      },
      include:[{
        model:Role,
        as:"role",
        attributes: ['nama']
      }]
    });
    response.setMessage("Detail User");
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}

exports.userDetail = async (req, res) => {
  const response  = new Response();
  const {
    userId
  } = req.params;
  try {
    const result = await User.findOne({
      where: {
        user_id: userId
      },
      include:[{
        model:Role,
        as:"role",
        attributes: ['nama']
      }]
    });
    response.setMessage("Detail User with Role");
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}

exports.createUser = async (req,res) => {
  const response = new Response();
  const emailExist = await User.findOne({
    where: {
      email: req.body.email,
    },
  });
  if (emailExist)
  {
    response.setMessage("Email Already Exists");
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  try {
    req.body.password = hashPassword;
    const user = await User.create(req.body);
    response.setMessage("Create User");
    response.setData(user);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}
exports.updateUser = async (req,res) => {
  const response = new Response();
  const {userId} = req.params;
  
  try {
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(req.body.password, salt);
      req.body.password = hashPassword;
    }
    const userUpdate = await findUserById(userId);
    await userUpdate.update(req.body,{
      returning:true
    });
    response.setMessage("Update User");
    response.setData(userUpdate);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}
exports.deleteUser = async (req,res) => {
  const response = new Response();
  const {userId} = req.params;
  try {
    const userRemove = await User.destroy({
      where: {
        user_id:userId
      }
    });
    response.setMessage("Remove User");
    response.setData(userRemove);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}
exports.userRole = async (req,res) => {
  const response = new Response();
  const {
    roleId
  } = req.params;
  const role = await Role.findOne({
    where:{
      role_id:roleId
    },
    attributes:["nama"],
    raw:true
  });
  try {
    const result = await User.findAll({
      where: {
        role_id: roleId
      },
      include:[{
        model:Role,
        as:"role",
        attributes: ['nama']
      }],
      order: [["user_id", "DESC"]],
    });
    response.setMessage(`All User is role ${role.nama}`);
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  
}
exports.listRole = async (req,res) => {
  const response = new Response();
  try {
    const result = await Result.findAll();
    response.setMessage("Data Role");
    response.setData(result);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}

exports.listOverridePengusul = async (req,res) => {
  const response = new Response();
  const {userId} = req.user;
  const override = await Override.findAll({
    where:{
      pengusul_id:userId 
    },
    include:[
      {
        model:Ora
      },
      {
        model:ActiveOff
      }
    ]
  });
    response.setMessage("Data Override");
    response.setData(override);
    return res.status(StatusCodes.OK).json(response);
}

exports.updatePassword = async(req,res) => {
  const response = new Response();
  const {userId} = req.user;

  try {
    const userData = await User.findOne({
      where: {
        user_id:userId
      }
    });
    const validPass = await bcrypt.compare(req.body.passwordLama, userData.password);
    if (!validPass) {
      response.setMessage("old passwords don't match");
      response.setStatus(false);
      return res.json(response);
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.passwordBaru, salt);
    req.body.password = hashPassword;
    const userUpdate = await userData.update(req.body, {
      returning:true
    });
    response.setMessage("Update Password User Success");
    response.setData(userUpdate);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}