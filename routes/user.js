const router = require("express").Router();
const {
  auth
} = require('../middleware/verifytoken');
const {
  userIndex,
  userMe,
  createUser,
  updateUser,
  deleteUser,
  userRole,
  userDetail,
  listOverridePengusul,
  updatePassword
} = require('../controllers/usercontroller');

router.get('/', auth, userIndex);
router.post('/me', auth, userMe)
router.post('/', auth, createUser)
router.get('/role/:roleId', auth, userRole)
router.get('/override_pengusul', auth, listOverridePengusul)
router.put('/password', auth, updatePassword)
router.get('/:userId', auth, userDetail)
router.put('/:userId', auth, updateUser)
router.delete('/:userId', auth, deleteUser);

module.exports = router;