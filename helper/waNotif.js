const axios = require("axios");
const {phoneNumberUser} = require("../helper/userHelper");
require("dotenv").config();

exports.sendNotification = async (to,msg) => {
  const token = process.env.WA_TOKEN; 
  const instance = axios.create({
    'content-type': "application/json",
    'Authorization': token,
  });
  
  const notif = await instance.get(`https://console.wablas.com/api/send-message?token=${token}&phone=${to}&message=${msg}`);

  return notif;
}

exports.broadcastWa = async(data,message) => {
  let dataPhoneNumber = [];

  dataPhoneNumber[0] = await phoneNumberUser(data.reviewer1_id);
    dataPhoneNumber[1] = await phoneNumberUser(data.reviewer2_id);
    dataPhoneNumber[2] = await phoneNumberUser(data.pemberi_izin_id);
    dataPhoneNumber[3] = await phoneNumberUser(data.pengawas_id);
    dataPhoneNumber[4] = await phoneNumberUser(data.pelaksana_id);
    dataPhoneNumber[5] = await phoneNumberUser(data.pengusul_id);

  dataPhoneNumber.forEach(async (value) => {
       await this.sendNotification(value,message);
  });

  return dataPhoneNumber;
}