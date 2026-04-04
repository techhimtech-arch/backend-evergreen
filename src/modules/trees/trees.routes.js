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

/**
 * @swagger
 * tags:
 *   name: Tree Registration
 *   description: Tree plantation tracking and geo-tagging
 * 
 * /trees:
 *   get:
 *     summary: Get all planted trees
 *     tags: [Tree Registration]
 *     responses:
 *       200:
 *         description: List of all planted trees
 *   post:
 *     summary: Register a new planted tree
 *     tags: [Tree Registration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               plantTypeId:
 *                 type: string
 *               location:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               photo:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PLANTED, GROWING, DEAD]
 *     responses:
 *       201:
 *         description: Tree registered successfully
 * 
 * /trees/{id}:
 *   get:
 *     summary: Get a single tree's details
 *     tags: [Tree Registration]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tree details
 *   put:
 *     summary: Update tree details (e.g., health status)
 *     tags: [Tree Registration]
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
 *         description: Tree details updated
 *   delete:
 *     summary: Delete a registered tree request
 *     tags: [Tree Registration]
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
 *         description: Tree successfully deleted from database
 */

router.get('/', getTrees);
router.get('/:id', getTree);

router.post('/', protect, registerTree);
router.put('/:id', protect, updateTree);
router.delete('/:id', protect, deleteTree); // Add RBAC later

module.exports = router;
