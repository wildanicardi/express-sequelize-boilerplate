const {
  User,Override,Ora,ActiveOff,Logbook,moc
} = require("../models");
const { Op } = require('sequelize');
const {phoneNumberUser,findUserById} = require("../helper/userHelper");
const {sendNotification,broadcastWa} = require("../helper/waNotif");
const {findOneOverride} = require("../helper/overrideHelper");
const {sendMail,broadcastMail} = require("../helper/mail");
const Response = require("../helper/response");
const {  StatusCodes} = require('http-status-codes');
// create override
exports.create = async (req,res) => {
  const response = new Response();
  const {userId} = req.user;
  let dataPhoneNumber = [];
  let dataEmail= [];
  try {
    req.body.pengusul_id = userId;
    dataPhoneNumber[0] = await phoneNumberUser(userId);
    dataPhoneNumber[1] = await phoneNumberUser(req.body.reviewer2_id.user_id);
    dataPhoneNumber[2] = await phoneNumberUser(req.body.reviewer1_id.user_id);
    dataPhoneNumber[3] = await phoneNumberUser(req.body.pemberi_izin_id.user_id);
    dataPhoneNumber[4] = await phoneNumberUser(req.body.pengawas_id.user_id);
    dataPhoneNumber[5] = await phoneNumberUser(req.body.pelaksana_id.user_id);

    dataEmail[0] = await findUserById(req.body.reviewer1_id.user_id);
    dataEmail[1] = await findUserById(req.body.reviewer2_id.user_id);
    dataEmail[2] = await findUserById(req.body.pemberi_izin_id.user_id);
    dataEmail[3] = await findUserById(req.body.pengawas_id.user_id);
    dataEmail[4] = await findUserById(req.body.pelaksana_id.user_id);
    dataEmail[5] = await findUserById(userId);
    const overrideCreate = await Override.create({
      ...req.body,
      reviewer1_id:req.body.reviewer1_id.user_id,
      reviewer2_id:req.body.reviewer2_id.user_id,
      pemberi_izin_id:req.body.pemberi_izin_id.user_id,
      pengawas_id:req.body.pengawas_id.user_id,
      pelaksana_id:req.body.pelaksana_id.user_id,
    });
    let message = `Override Berhasil Dibuat dengan Tag Number ${overrideCreate.tag}, Silahkan cek halaman Override Dashboard anda`;
    dataPhoneNumber.forEach(async (value) => {
      await sendNotification(value,message);
    });
    dataEmail.forEach(async (value) => {
      await sendMail(value,"Create Override",message);
    });

    response.setMessage("Create Override Success");
    response.setData(overrideCreate);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
//delete override by id
exports.deleteOverride = async (req,res) => {
  const response = new Response();
  const {overrideId} = req.params;
  try {
    const overrideRemove = await Override.destroy({
      where: {
        override_id:overrideId
      }
    });
    response.setMessage("Remove Override");
    response.setData(overrideRemove);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// list all override
exports.list = async (req,res) => {
  const response = new Response();
  try {
    const override = await Override.findAll({
      order:[["override_id","DESC"]]
    });
    response.setMessage("List Override");
    response.setData(override);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// detail override, by id override
exports.detail = async(req,res) => {
  const response  = new Response();
  const {
    overrideId
  } = req.params;
  const result = await Override.findOne({
    where:{
      override_id:overrideId
    },
    include:[
      {
        model:User,
        as:"pengusul",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        },
      },
      {
        model:User,
        as:"reviewer1",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        },
      },
      {
        model:User,
        as:"reviewer2",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        },
      },
      {
        model:User,
        as:"pemberi_izin",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        },
      },
      {
        model:User,
        as:"pengawas",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        },
      },
      {
        model:User,
        as:"pelaksana",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        },
      },
      {
        model:Ora
      },
      {
        model:moc
      },
      {
        model:ActiveOff
      }
    ]
  });
  response.setMessage("Detail Override");
  response.setData(result);
  return res.status(StatusCodes.OK).json(response);
}
// update override
exports.update = async (req,res) => {
  const response  = new Response();
  const {
    overrideId
  } = req.params;

  try {
    let izinTindakan = [];
    let alasanPenutupan = [];
    if (req.body.izinTindakan) {  
      await req.body.izinTindakan.forEach(element => {
        izinTindakan.push({
          name:element.name,
          label:element.label,
          isChecked:element.isChecked,
        });
      });
      req.body.izinTindakan = izinTindakan;
    }
    if (req.body.alasanPenutupan) {  
      await req.body.alasanPenutupan.forEach(element => {
        alasanPenutupan.push({
          name:element.name,
          label:element.label,
          isChecked:element.isChecked,
        });
      });
      req.body.alasanPenutupan = alasanPenutupan;
    }
    const overrideData = await findOneOverride(overrideId);
    const overrideUpdate = await overrideData.update(req.body,{
        returning:true
    });

    let message = `Override dengan Tag Number ${overrideData.tag} Berhasil Diusulkan, Silahkan cek detail dokumen pengusulan Override di Dashboard anda`;
    let subject = "Create Pengusulan";
    await broadcastMail(overrideData,subject,message);
    await broadcastWa(overrideData,message);
    
    response.setMessage("Update Override Success");
    response.setData(overrideUpdate);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// get data override menunggu izin
exports.overrideWaitingPermission = async(req,res) => {
  const response  = new Response();
  const {userId} = req.user
  try {
    const override = await Override.findAll({
      where:{
        pemberi_izin_id:userId,
        checklistReviewer1:true,
        checklistReviewer2:true,
      },
      include:[
        {
          model:Ora
        },
        {
          model:ActiveOff
        }
      ],
      order:[["override_id","DESC"]]
    });
    response.setMessage("Get Data Approved untuk pemberi izin");
    response.setData(override);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// get data override dan checklist untuk pengawas
exports.overridePengawas = async(req,res) => {
  const response  = new Response();
  const {userId} = req.user
  try {
    const override = await Override.findAll({
      where:{
        pengawas_id:userId,
      },
      include:[
        {
          model:ActiveOff
        },
        {
          model:Ora
        }
      ],
      order:[["override_id","DESC"]]
    });
    response.setMessage("Get Data Approved for pengawas");
    response.setData(override);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// get data override dan checklist untuk pelaksana
exports.overridePelaksana = async(req,res) => {
  const response  = new Response();
  const {userId} = req.user
  try {
    const override = await Override.findAll({
      where:{
        pelaksana_id:userId,
      },
      include:[
        {
          model:ActiveOff
        },
        {
          model:Ora
        }
      ],
      order:[["override_id","DESC"]]
    });
    response.setMessage("Get Data Approved for pelaksana");
    response.setData(override);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// get list data override in reviewer 
exports.listOverrideReviewer = async (req,res) => {
  const response  = new Response();
  const {userId} = req.user
  try {
    const override = await Override.findAll({
      where:{
        [Op.or]:[
          {
            reviewer1_id:userId
          },
          {
            reviewer2_id:userId
          }
        ]
      },
      include:[
        {
          model:Ora
        },
        {
          model:ActiveOff
        }
      ],
      order:[["override_id","DESC"]]
    });
    response.setMessage("Get Data Approved for reviewer");
    response.setData(override);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// create ORA
exports.createOra = async (req,res) => {
  const response = new Response();
  const {overrideId} = req.params;
  const {jenis} = req.query;
  let dataCreate = [];
  try {
    req.body.forEach(value => {
      dataCreate.push({
        sertifikat_override_id:overrideId,
        awalKejadian:value.awalKejadian,
        awalKeparahan:value.awalKeparahan,
        awalResiko:value.awalResiko,
        rekomendasi:value.rekomendasi,
        pj:value.pj,
        sisaKejadian:value.sisaKejadian,
        sisaKeparahan:value.sisaKeparahan,
        sisaResiko:value.sisaResiko,
        bahaya:value.bahaya,
        jenis:jenis
      })
    });
    const ora = await Ora.bulkCreate(dataCreate);
    response.setMessage("Create Ora Success");
    response.setData(ora);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// update ora
exports.updateOra = async (req,res) => {
  const response = new Response();
  const {jenis} = req.query;
  const {overrideId,oraId} = req.params;
  try {
    req.body.jenis = jenis;
    req.body.sertifikat_override_id = overrideId;
    const ora = await Ora.update(req.body,{
      where:{
        ora_id:oraId
      }
    });
    response.setMessage("Update Ora Success");
    response.setData(ora);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

//delete ora by id
exports.deleteOra = async (req,res) => {
  const response = new Response();
  const {oraId} = req.params;
  try {
    const oraRemove = await Ora.destroy({
      where: {
        ora_id:oraId
      }
    });
    response.setMessage("Remove Ora");
    response.setData(oraRemove);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// data ora by override id
exports.detailOraOverride =async(req,res) => {
  const response  = new Response();
  const {
    overrideId
  } = req.params;
  const {jenis} = req.query;
  const result = await Ora.findAll({
    where:{
      sertifikat_override_id:overrideId,
      jenis:jenis
    }
  });
  response.setMessage("Data Ora by override id");
  response.setData(result);
  return res.status(StatusCodes.OK).json(response);
}

// detail ora
exports.detailOra =async(req,res) => {
  const response  = new Response();
  const {
    overrideId,oraId
  } = req.params;
  const result = await Ora.findAll({
    where:{
      ora_id:oraId,
      sertifikat_override_id:overrideId
    }
  });
  response.setMessage("Detail Ora");
  response.setData(result);
  return res.status(StatusCodes.OK).json(response);
}

// update status  cheklist pengaktifan/penonaktifan approved
exports.updateActiveNon = async (req,res) => {
  const response = new Response();
  const {overrideId,activeId} = req.params;
  const {jenis} = req.query;
  try {
    req.body.jenis = jenis;
    req.body.status = "approved";
    req.body.approvedAt = new Date();
    const activeOff = await ActiveOff.update(req.body,{
      where:{
        sertifikat_override_id:overrideId,
        active_id:activeId
      }
    });
    response.setMessage(`Update ${jenis} Success`);
    response.setData(activeOff);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// detail checklist pengaktifan/penonaktifan
exports.detailActiveNon = async (req,res) => {
  const response = new Response();
  const {overrideId} = req.params;
  const {jenis} = req.query;
  try {
    const activeOff = await ActiveOff.findOne({
      where:{
        sertifikat_override_id:overrideId,
        jenis:jenis
      },
      include:[{
        model:Override,
        include:[
          {
          model:User,
          as:"pelaksana",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          }
          },
          {
            model:User,
            as:"pengusul",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"reviewer1",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"reviewer2",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"pemberi_izin",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"pengawas",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
        ]
      }]
    });
    response.setMessage(`Detail ${jenis} override`);
    response.setData(activeOff);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// create cheklist override
exports.createChecklistOverride = async (req,res) => {
  const response  = new Response();
  const {userId} = req.user;
  const {
    overrideId
  } = req.params;
  try {
  const userData = await findUserById(userId);
  const override = await findOneOverride(overrideId);

  let status;
  let checklistOverride;
  if (req.body.checklist == true) {
    if(userId == override.reviewer1_id){
      checklistOverride = await override.update({
        status:"PENGUSULAN - APPROVED REVIEWER 1",
        checklistReviewer1:req.body.checklist,
        tanggalReviewer1:new Date()
      })
    }else if(userId == override.reviewer2_id){
      checklistOverride = await override.update({
        status:"PENGUSULAN - APPROVED REVIEWER 2",
        checklistReviewer2:req.body.checklist,
        tanggalReviewer2:new Date()
      })
    }else if(userId == override.pemberi_izin_id){
      checklistOverride = await override.update({
        status:"PENGUSULAN - APPROVED",
        checklistPemberiIzin:req.body.checklist,
        tanggalPemberiIzin:new Date(),
        approvedPengaktifan:new Date()
      })
    }
    status = "Approved";
  }else {
    checklistOverride = await override.update({
      status:`PENGUSULAN - REJECTED OLEH ${userData.nama}`,
      commentar:req.body.commentar
    });
    status = "Rejected";
  }
  let message;
  status === "Approved" ? message = `Override dengan Tag Number ${override.tag} , berhasil Disetujui oleh ${userData.nama}` :
  message = `Override dengan Tag Number ${override.tag} , Ditolak oleh ${userData.nama} dengan alasan ${req.body.commentar}`;

 await broadcastMail(override,status,message);
  await broadcastWa(override,message);

    response.setMessage("Create checklist override success");
    response.setData(checklistOverride);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// create cheklist override
exports.createChecklistPenutupanOverride = async (req,res) => {
  const response  = new Response();
  const {userId} = req.user;
  const {
    overrideId
  } = req.params;
  try {
  const userData = await findUserById(userId);
  const override = await findOneOverride(overrideId);

  let checklistOverride;
  if (req.body.checklist == true) {
    if(userId == override.reviewer1_id){
      checklistOverride = await override.update({
        status:"PENUTUPAN - APPROVED REVIEWER 1",
        checklistPenutupanReviewer1:req.body.checklist,
        tanggalPenutupanReviewer1:new Date()
      })
    }else if(userId == override.reviewer2_id){
      checklistOverride = await override.update({
        status:"PENUTUPAN - APPROVED REVIEWER 2",
        checklistPenutupanReviewer2:req.body.checklist,
        tanggalPenutupanReviewer2:new Date()
      })
    }else if(userId == override.pemberi_izin_id){
      checklistOverride = await override.update({
        status:"TUTUP",
        checklistPenutupanPemberiIzin:req.body.checklist,
        tanggalPenutupanPemberiIzin:new Date(),
        approvedPenutupan:new Date()
      });
      
      let message = `Override dengan Tag Number ${override.tag}  telah ditutup. Silahkan cek detail dokumen penonaktifan Override di Dashboard anda`;
      let subject = "Create Checklist Penutupan";
      await broadcastMail(override,subject,message);
      await broadcastWa(override,message);
    }  
  }else {
    checklistOverride = await override.update({
      status:`PENUTUPAN - REJECTED OLEH ${userData.nama}`,
      commentar:req.body.commentar
    });
  }
    response.setMessage("Create checklist Penutupan override success");
    response.setData(checklistOverride);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) { 
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}


// create logbook
exports.createLogbook = async (req,res)=>{
  const response = new Response();
  const {overrideId} = req.params;
  const {jenis} = req.query;
  let dataCreate = [];
  try {
    req.body.forEach(value => {
      dataCreate.push({
        sertifikat_override_id:overrideId,
        unit:value.unit,
        tag:value.tag,
        tanggal:value.tanggal,
        jam:value.jam,
        jenis:jenis
      })
    });
    const logbook = await Logbook.bulkCreate(dataCreate);
    response.setMessage("Create Logbook Success");
    response.setData(logbook);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// detail logbook by override id
exports.logbookOverride = async (req,res)=>{
  const response = new Response();
  const {overrideId} = req.params;
  const {jenis} = req.query;
  try {
    const logbook = await Logbook.findAll({
      where:{
        sertifikat_override_id:overrideId,
        jenis:jenis
      },
      include:[{
        model:Override,
        include:[
          {
          model:ActiveOff,
            where:{
              jenis:jenis
            }
          },
          {
          model:User,
          as:"pelaksana",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          }
          },
          {
            model:User,
            as:"pengusul",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"reviewer1",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"reviewer2",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"pemberi_izin",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
          {
            model:User,
            as:"pengawas",
            attributes:{
              exclude:["password","createdAt","updatedAt"]
            },
          },
        ]
      }],
      order:[["logbook_id","DESC"]]
    });
    response.setMessage(`Data Logbook Override ${jenis}`);
    response.setData(logbook);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// detail logbook
exports.detailLogbook = async (req,res)=>{
  const response = new Response();
  const {overrideId,logbookId} = req.params;
  try {
    const logbook = await Logbook.findAll({
      where:{
        sertifikat_override_id:overrideId,
        logbook_id:logbookId
      }
    });
    response.setMessage("Detail Logbook Override");
    response.setData(logbook);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// update logbook
exports.updateLogbook = async (req,res)=>{
  const response = new Response();
  const {overrideId,logbookId} = req.params;
  try {
    const logbook = await Logbook.update(req.body,{
      where:{
        sertifikat_override_id:overrideId,
        logbook_id:logbookId
      }
    });
    response.setMessage("Update Logbook Success");
    response.setData(logbook);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// delete logbook
exports.deleteLogbook = async (req,res)=>{
  const response = new Response();
  const {overrideId,logbookId} = req.params;
  try {
    const logbookDelete = await Logbook.destroy({
      where:{
        sertifikat_override_id:overrideId,
        logbook_id:logbookId
      }
    });
    response.setMessage("Delete Logbook Override");
    response.setData(logbookDelete);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// create checklist pengaktifan / penonaktifan
exports.createActiveNon = async(req,res)=>{
  const response = new Response();
  const {overrideId} = req.params;
  const {jenis} = req.query
  try {
    let persyaratan = [];
    let status;
    req.body.jenis = jenis;
    if (jenis === "pengaktifan") {
      statusPengaktifan = true;
      status = "AKTIF";
    }else if(jenis === "penonaktifan"){
      statusPengaktifan = false;
      status = "NONAKTIF"
    }

    if (req.body.persyaratanTeknis) {
      await req.body.persyaratanTeknis.forEach(value => {
        persyaratan.push({
          status:value.status,
          keterangan:value.keterangan
        })
      });
      req.body.persyaratanTeknis = persyaratan;
    }
    req.body.sertifikat_override_id = overrideId;
    const activeOff = await ActiveOff.create(req.body);
    
    const overrideData = await findOneOverride(overrideId);
    await overrideData.update({
      statusPengaktifan:statusPengaktifan,
      status:status
    })
    let message;
    status === "AKTIF" ? message = `Override dengan Tag Number ${overrideData.tag}  telah diaktifkan. Silahkan cek detail dokumen pengaktifan Override di Dashboard anda` :
    message = `Override dengan Tag Number ${overrideData.tag},  telah dinonaktifkan. Silahkan cek detail dokumen penonaktifan Override di Dashboard anda`;

    let subject = `Checklist ${status}`;
    await broadcastMail(overrideData,subject,message);
    await broadcastWa(overrideData,message);


    response.setMessage(`Create ${jenis} Success`);
    response.setData(activeOff);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// update checklist pengaktifan / penonaktifan
exports.updateActive = async(req,res)=>{
  const response = new Response();
  const {overrideId,activeId} = req.params;
  const {jenis} = req.query
  try {
    let persyaratan = [];
    if (req.body.persyaratanTeknis) {
      await req.body.persyaratanTeknis.forEach(value => {
        persyaratan.push({
          status:value.status,
          keterangan:value.keterangan
        })
      });
    }
    req.body.persyaratanTeknis  = persyaratan;
    req.body.sertifikat_override_id = overrideId;
    req.body.jenis = jenis;
    const activeOff = await ActiveOff.update(req.body,{
        where:{
          active_id:activeId,
          jenis:jenis
        }
    });
    response.setMessage(`Update checklist ${jenis} Success`);
    response.setData(activeOff);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

//create moc
exports.createMoc = async (req,res) => {
  const response = new Response();
  const {overrideId} = req.params;
  try {
    let sumberJenis = [];
    let saatPersonil = [];
    let saatKerusakan = [];
    let pascaPersonil = [];
    let pascaKerusakan = [];
    let itemDiupdate = [];
    let keterpaduanMekanik = [];
    req.body.sertifikat_override_id = overrideId;
    await req.body.sumberJenisPerubahan.forEach(value => {
      sumberJenis.push({
        name:value.name,
        label:value.label,
        isChecked:value.isChecked,
      })
    });
    await req.body.saatPersonilCidera.forEach(value => {
      saatPersonil.push({
        name:value.name,
        label:value.label,
        value:value.value,
      })
    });
    await req.body.saatKerusakanAlat.forEach(value => {
      saatKerusakan.push({
        name:value.name,
        label:value.label,
        value:value.value,
      })
    });
    await req.body.pascaPersonilCidera.forEach(value => {
      pascaPersonil.push({
        name:value.name,
        label:value.label,
        value:value.value,
      })
    });
    await req.body.pascaKerusakanAlat.forEach(value => {
      pascaKerusakan.push({
        name:value.name,
        label:value.label,
        value:value.value,
      })
    });
    await req.body.itemDiupdate.forEach(value => {
      itemDiupdate.push({
        name:value.name,
        label:value.label,
        isChecked:value.isChecked,
      })
    });
    await req.body.keterpaduanMekanik.forEach(value => {
      keterpaduanMekanik.push({
        name:value.name,
        label:value.label,
        value:value.value,
      })
    });
    const overrideData = await findOneOverride(overrideId);
    const mocCreate = await moc.create({...req.body,
      sumberJenisPerubahan:sumberJenis,
      saatPersonilCidera:saatPersonil,
      saatKerusakanAlat:saatKerusakan,
      pascaPersonilCidera:pascaPersonil,
      pascaKerusakanAlat:pascaKerusakan,
      itemDiupdate:itemDiupdate,
      keterpaduanMekanik:keterpaduanMekanik
    });

    let message = `Override dengan Tag Number ${overrideData.tag}, telah diajukan Permohonan Perubahan . Silahkan cek detail dokumen penonaktifan Override di Dashboard anda`
    let subject = `Formulir Perubahan`;
    await broadcastMail(overrideData,subject,message);
    await broadcastWa(overrideData,message);
    
    response.setMessage("Create Moc Success");
    response.setData(mocCreate);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
// update moc
exports.updateMoc = async(req,res)=>{
  const response = new Response();
  const {overrideId,mocId} = req.params;
  try {
    let sumberJenis = [];
    let saatPersonil = [];
    let saatKerusakan = [];
    let pascaPersonil = [];
    let pascaKerusakan = [];
    let itemDiupdate = [];
    let keterpaduanMekanik = [];
    req.body.sertifikat_override_id = overrideId;
    if (req.body.sumberJenisPerubahan) {
      await req.body.sumberJenisPerubahan.forEach(value => {
        sumberJenis.push({
          name:value.name,
          label:value.label,
          isChecked:value.isChecked,
        })
      });
      req.body.sumberJenisPerubahan = sumberJenis;
    }
   
    if (req.body.saatPersonilCidera) {
      await req.body.saatPersonilCidera.forEach(value => {
        saatPersonil.push({
          name:value.name,
          label:value.label,
          value:value.value,
        })
      });
      req.body.saatPersonilCidera  = saatPersonil;
    }
   
    if (req.body.saatKerusakanAlat) {
      await req.body.saatKerusakanAlat.forEach(value => {
        saatKerusakan.push({
          name:value.name,
          label:value.label,
          value:value.value,
        })
      });
      req.body.saatKerusakanAlat = saatKerusakan
    }
   
    if (req.body.pascaPersonilCidera) {
      await req.body.pascaPersonilCidera.forEach(value => {
        pascaPersonil.push({
          name:value.name,
          label:value.label,
          value:value.value,
        })
      });
      req.body.pascaPersonilCidera = pascaPersonil
    }
   
    if (req.body.pascaKerusakanAlat) {
      await req.body.pascaKerusakanAlat.forEach(value => {
        pascaKerusakan.push({
          name:value.name,
          label:value.label,
          value:value.value,
        })
      });
      req.body.pascaKerusakanAlat = pascaKerusakan
    }
    
    if (req.body.itemDiupdate) {
      await req.body.itemDiupdate.forEach(value => {
        itemDiupdate.push({
          name:value.name,
          label:value.label,
          isChecked:value.isChecked,
        })
      });
      req.body.itemDiupdate = itemDiupdate
    }
   
    if (req.body.keterpaduanMekanik) {
      await req.body.keterpaduanMekanik.forEach(value => {
        keterpaduanMekanik.push({
          name:value.name,
          label:value.label,
          value:value.value,
        })
      });
      req.body.keterpaduanMekanik = keterpaduanMekanik;
    }
   
    const mocUpdate = await moc.update(req.body,{
      where:{
        moc_id:mocId,
        sertifikat_override_id:overrideId
      }
    })
    
    response.setMessage("Update Moc Success");
    response.setData(mocUpdate);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}

// detail moc
exports.detailMoc = async(req,res)=>{
  const response  = new Response();
  const {
    overrideId
  } = req.params;
  const result = await moc.findOne({
    where:{
      sertifikat_override_id:overrideId
    },
    include:[{
      model:Override,
      include:[
        {
        model:User,
        as:"pelaksana",
        attributes:{
          exclude:["password","createdAt","updatedAt"]
        }
        },
        {
          model:User,
          as:"pengusul",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          },
        },
        {
          model:User,
          as:"reviewer1",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          },
        },
        {
          model:User,
          as:"reviewer2",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          },
        },
        {
          model:User,
          as:"pemberi_izin",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          },
        },
        {
          model:User,
          as:"pengawas",
          attributes:{
            exclude:["password","createdAt","updatedAt"]
          },
        },
      ]
    }]
  });
  response.setMessage("Detail Moc");
  response.setData(result);
  return res.status(StatusCodes.OK).json(response);
}

// create cheklist moc
exports.createChecklistMoc = async (req,res) => {
  const response  = new Response();
  const {userId} = req.user;
  const {
    overrideId
  } = req.params;
  try {
  const userData = await findUserById(userId);
  const override = await Override.findOne({
    where:{
      override_id:overrideId
    }
  });
  const mocData = await moc.findOne({
    where:{
      sertifikat_override_id:overrideId
    }
  })
  let checklistMoc;
  if (req.body.checklist == true) {
    if(userId == override.reviewer1_id){
      checklistMoc = await mocData.update({
        status:"PENGUSULAN - APPROVED REVIEWER 1",
        checklistPengusulanReviewer1:req.body.checklist,
        tanggalPengusulanReviewer1:new Date()
      })
    }else if(userId == override.reviewer2_id){
      checklistMoc = await mocData.update({
        status:"PENGUSULAN - APPROVED REVIEWER 2",
        checklistPengusulanReviewer2:req.body.checklist,
        tanggalPengusulanReviewer2:new Date()
      })
    }else if(userId == override.pemberi_izin_id){
      checklistMoc = await mocData.update({
        status:"PENGUSULAN - APPROVED",
        checklistPengusulanPemberiIzin:req.body.checklist,
        tanggalPengusulanPemberiIzin:new Date()
      })
    }
  }else {
    checklistMoc = await mocData.update({
      status:`PENGUSULAN - REJECTED OLEH ${userData.nama}`,
      commentar:req.body.commentar
    });
  }
    response.setMessage("Create checklist moc success");
    response.setData(checklistMoc);
    return res.status(StatusCodes.OK).json(response);
  } catch (error) {
    response.setMessage(error.message);
    response.setStatus(false);
    return res.json(response);
  }
}
