const {
  Override
} = require("../models");

exports.findOneOverride = async (overrideId) => {
 return await Override.findOne({
  where: {
    override_id:overrideId
  }
  })
}