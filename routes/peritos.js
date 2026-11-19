const express = require('express');
const ctrl = require('../controllers/peritosController');

const router = express.Router();

router.post('/', ctrl.create);
router.get('/', ctrl.list);
router.get('/:id', ctrl.getById);
router.delete('/:id', ctrl.remove);

module.exports = router;
