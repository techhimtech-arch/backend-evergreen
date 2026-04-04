const express = require('express');
const router = express.Router();
const {
  getPlants,
  getPlant,
  createPlant,
  updatePlant,
  deletePlant
} = require('./plants.controller');
const { protect } = require('../../middleware/auth.middleware');

// Public/Protected read access
router.get('/', getPlants);
router.get('/:id', getPlant);

// Protected write access (can add roles later like admin only)
router.post('/', protect, createPlant);
router.put('/:id', protect, updatePlant);
router.delete('/:id', protect, deletePlant);

module.exports = router;
