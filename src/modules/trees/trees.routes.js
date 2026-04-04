const express = require('express');
const router = express.Router();
const {
  getTrees,
  registerTree,
  getTree,
  updateTree,
  deleteTree,
  addTreePhoto,
  updateTreeHealth,
  getTreesByHealthStatus,
  getTreesNeedingInspection
} = require('./trees.controller');
const { authenticate } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Tree Registration
 *   description: Tree plantation tracking, geo-tagging, and health monitoring
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
 *               eventId:
 *                 type: string
 *               location:
 *                 type: string
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *               status:
 *                 type: string
 *                 enum: [PLANTED, GROWING, HEALTHY, WEAK, DEAD]
 *               growthStage:
 *                 type: string
 *                 enum: [SEEDLING, SAPLING, YOUNG, MATURE, FLOWERING, FRUITING]
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
 *     summary: Update tree details (health, location, etc.)
 *     tags: [Tree Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PLANTED, GROWING, HEALTHY, WEAK, DEAD]
 *               growthStage:
 *                 type: string
 *                 enum: [SEEDLING, SAPLING, YOUNG, MATURE, FLOWERING, FRUITING]
 *               healthRemarks:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tree details updated
 *   delete:
 *     summary: Delete a registered tree
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
 *
 * /trees/{id}/photos:
 *   post:
 *     summary: Add photo to tree
 *     tags: [Tree Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tree ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: Photo URL
 *               caption:
 *                 type: string
 *                 description: Photo caption
 *     responses:
 *       200:
 *         description: Photo added successfully
 *
 * /trees/{id}/health:
 *   patch:
 *     summary: Update tree health status
 *     tags: [Tree Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tree ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PLANTED, GROWING, HEALTHY, WEAK, DEAD]
 *               growthStage:
 *                 type: string
 *                 enum: [SEEDLING, SAPLING, YOUNG, MATURE, FLOWERING, FRUITING]
 *               healthRemarks:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tree health updated successfully
 *
 * /trees/health/{status}:
 *   get:
 *     summary: Get trees by health status
 *     tags: [Tree Registration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [PLANTED, GROWING, HEALTHY, WEAK, DEAD]
 *         description: Health status to filter by
 *     responses:
 *       200:
 *         description: Trees with specified health status
 *
 * /trees/needing-inspection:
 *   get:
 *     summary: Get trees that need inspection (not inspected in last 30 days)
 *     tags: [Tree Registration]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trees needing inspection
 */

router.get('/', getTrees);
router.get('/:id', getTree);

router.post('/', authenticate, registerTree);
router.put('/:id', authenticate, updateTree);
router.delete('/:id', authenticate, deleteTree); // Add RBAC later

// Phase 2: Enhanced monitoring routes
router.post('/:id/photos', authenticate, addTreePhoto);
router.patch('/:id/health', authenticate, updateTreeHealth);
router.get('/health/:status', authenticate, getTreesByHealthStatus);
router.get('/needing-inspection', authenticate, getTreesNeedingInspection);

module.exports = router;
