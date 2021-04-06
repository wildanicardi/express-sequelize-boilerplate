const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const {findUserById} = require("../helper/userHelper");

exports.sendMail = async (data,subject,message) => {
  const transport = nodemailer.createTransport({
    host: 'smtp.mailgun.org',         
    port: 587,
    auth: {             
       user: 'postmaster@siwi.wisudapknstan.id', // generated ethereal user
       pass: '15f1722a69b59227207d76c621332561-73e57fef-9c03e445'  // generated ethereal password   
    },
    // debug:true,
    // logger:true
  });
  const handlebarOptions = {
    viewEngine: {
      extName: ".hbs",
      partialsDir: "./mailTemplate/",
      layoutsDir: "./mailTemplate/",
      defaultLayout: false
    },
    viewPath: "./mailTemplate/",
    extName: ".hbs"
  };
  let name = data.nama;
  transport.use("compile", hbs(handlebarOptions));
  const mailOptions = {
    from: 'pertamina@gmail.com',
    to: data.email,
    subject: subject,
    template:"sendMail",
    context: {
      message,
      name
    }
  };
  
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
    console.log(error.message);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}

exports.broadcastMail = async(data,subject, message) => {
  let dataEmail= [];

  dataEmail[0] = await findUserById(data.reviewer1_id);
  dataEmail[1] = await findUserById(data.reviewer2_id);
  dataEmail[2] = await findUserById(data.pemberi_izin_id);
  dataEmail[3] = await findUserById(data.pengawas_id);
  dataEmail[4] = await findUserById(data.pelaksana_id);
  dataEmail[5] = await findUserById(data.pengusul_id);

  await dataEmail.forEach(async (value) => {
    await this.sendMail(value,subject,message);
  });

  return dataEmail;
}