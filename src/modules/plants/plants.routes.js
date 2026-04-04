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

/**
 * @swagger
 * tags:
 *   name: Plant Catalog
 *   description: Master data for tree and plant species
 * 
 * /plants:
 *   get:
 *     summary: Get all plant species
 *     tags: [Plant Catalog]
 *     responses:
 *       200:
 *         description: List of all plants
 *   post:
 *     summary: Create a new plant species
 *     tags: [Plant Catalog]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               scientificName:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [FOREST, FRUIT, MEDICINAL, ORNAMENTAL]
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plant created successfully
 * 
 * /plants/{id}:
 *   get:
 *     summary: Get a single plant by ID
 *     tags: [Plant Catalog]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant data
 *   put:
 *     summary: Update plant details
 *     tags: [Plant Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant updated
 *   delete:
 *     summary: Delete a plant
 *     tags: [Plant Catalog]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Plant deleted
 */

// Public/Protected read access
router.get('/', getPlants);
router.get('/:id', getPlant);

// Protected write access (can add roles later like admin only)
router.post('/', protect, createPlant);
router.put('/:id', protect, updatePlant);
router.delete('/:id', protect, deletePlant);

module.exports = router;
