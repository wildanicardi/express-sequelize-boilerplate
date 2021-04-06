const router = require("express").Router();
const {
  auth
} = require('../middleware/verifytoken');
const {
  listRole
} = require('../controllers/usercontroller');

router.get('/', auth, listRole);
module.exports = router;