const router = require("express").Router();
const {
  auth
} = require('../middleware/verifytoken');
const {
  deleteOra
} = require('../controllers/overrid.controller');

router.delete('/:oraId', auth, deleteOra)

module.exports = router;