const router = require("express").Router();
const {
  auth
} = require('../middleware/verifytoken');
const {
 create,update,detail,createOra,updateOra,detailOraOverride,createActiveNon,detailActiveNon,updateActiveNon
 ,logbookOverride,detailLogbook,createLogbook,deleteLogbook,listOverrideReviewer
 ,list,overrideWaitingPermission,createChecklistOverride,overridePengawas,approvedOverride,
 createMoc,updateMoc,detailMoc,updateLogbook,overridePelaksana,deleteOverride,
 detailOra,updateActive,createChecklistPenutupanOverride,createChecklistMoc
} = require('../controllers/overrid.controller');

router.post('/', auth, create)

router.get('/', auth, list)

router.get('/reviewer', auth, listOverrideReviewer)

router.get('/pemberi_izin', auth, overrideWaitingPermission)

router.get('/pengawas', auth, overridePengawas)

router.get('/pelaksana', auth, overridePelaksana)

router.put('/:overrideId/cheklist_override', auth, createChecklistOverride);

router.put('/:overrideId/cheklist_penutupan_override', auth, createChecklistPenutupanOverride);

router.get('/:overrideId', auth, detail);

router.delete('/:overrideId', auth, deleteOverride);

router.put('/:overrideId', auth, update)

router.post('/:overrideId/ora', auth, createOra)

router.get('/:overrideId/ora', auth, detailOraOverride)

router.get('/:overrideId/cheklist', auth, detailActiveNon)

router.get('/:overrideId/ora/:oraId', auth, detailOra)

router.put('/:overrideId/ora/:oraId', auth, updateOra)

router.post('/:overrideId/cheklist', auth, createActiveNon)

router.put('/:overrideId/cheklist/:activeId', auth, updateActiveNon)

router.put('/:overrideId/cheklist_update/:activeId', auth, updateActive)

router.post('/:overrideId/logbook', auth, createLogbook)

router.post('/:overrideId/moc', auth, createMoc)

router.put('/:overrideId/checklist_moc', auth, createChecklistMoc)

router.get('/:overrideId/moc', auth, detailMoc)

router.put('/:overrideId/moc/:mocId', auth, updateMoc)

router.get('/:overrideId/logbook', auth, logbookOverride)

router.get('/:overrideId/logbook/:logbookId', auth, detailLogbook)

router.put('/:overrideId/logbook/:logbookId', auth, updateLogbook)

router.delete('/:overrideId/logbook/:logbookId', auth, deleteLogbook)

module.exports = router;