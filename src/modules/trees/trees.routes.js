const express = require('express');
const router = express.Router();
const {
  getTrees,
  registerTree,
  getTree,
  updateTree,
  deleteTree
} = require('./trees.controller');
const { protect } = require('../../middleware/auth.middleware');

router.get('/', getTrees);
router.get('/:id', getTree);

router.post('/', protect, registerTree);
router.put('/:id', protect, updateTree);
router.delete('/:id', protect, deleteTree); // Add RBAC later

module.exports = router;
