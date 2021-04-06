const jwt = require('jsonwebtoken');
const Response = require("../helper/response");
const {  StatusCodes} = require('http-status-codes');

exports.auth = (req, res, next) => {
  const response = new Response();
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    response.setMessage("Acces Denied");
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
  try {
    const verified = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    response.setMessage("Invalid Token");
    response.setStatus(false);
    return res.status(StatusCodes.BAD_REQUEST).json(response);
  }
}