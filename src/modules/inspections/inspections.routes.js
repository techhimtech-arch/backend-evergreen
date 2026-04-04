const express = require('express');
const router = express.Router();
const {
  getInspections,
  getInspection,
  createInspection,
  updateInspection,
  completeInspection,
  deleteInspection,
  getInspectionsByTree,
  getMyPendingInspections
} = require('./inspections.controller');
const { authenticate } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const {
  createInspectionValidation,
  updateInspectionValidation,
  completeInspectionValidation,
  getInspectionsValidation,
  idValidation,
  treeIdValidation
} = require('./inspections.validation');

/**
 * @swagger
 * tags:
 *   name: Inspections
 *   description: Tree inspection and monitoring APIs
 */

/**
 * @swagger
 * /inspections:
 *   get:
 *     summary: Get all inspections with optional filters
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, MISSED]
 *       - in: query
 *         name: inspectorId
 *         schema:
 *           type: string
 *       - in: query
 *         name: treeId
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     responses:
 *       200:
 *         description: List of inspections
 *   post:
 *     summary: Create a new inspection
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspectionInput'
 *     responses:
 *       201:
 *         description: Inspection created successfully
 */

/**
 * @swagger
 * /inspections/{id}:
 *   get:
 *     summary: Get inspection by ID
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inspection ID
 *     responses:
 *       200:
 *         description: Inspection details
 *   put:
 *     summary: Update inspection
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inspection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspectionUpdate'
 *     responses:
 *       200:
 *         description: Inspection updated successfully
 *   delete:
 *     summary: Delete inspection
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inspection ID
 *     responses:
 *       200:
 *         description: Inspection deleted successfully
 */

/**
 * @swagger
 * /inspections/{id}/complete:
 *   patch:
 *     summary: Complete inspection with findings
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Inspection ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InspectionCompletion'
 *     responses:
 *       200:
 *         description: Inspection completed successfully
 */

/**
 * @swagger
 * /inspections/tree/{treeId}:
 *   get:
 *     summary: Get all inspections for a specific tree
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: treeId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tree ID
 *     responses:
 *       200:
 *         description: Tree inspections retrieved
 */

/**
 * @swagger
 * /inspections/my-pending:
 *   get:
 *     summary: Get pending inspections assigned to current user
 *     tags: [Inspections]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pending inspections for current user
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Inspection:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "insp_123"
 *         treeId:
 *           type: string
 *           example: "tree_456"
 *         inspectorId:
 *           type: string
 *           example: "user_789"
 *         assignedBy:
 *           type: string
 *           example: "user_101"
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         completedDate:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, MISSED]
 *           example: "PENDING"
 *         treeStatus:
 *           type: string
 *           enum: [HEALTHY, WEAK, DEAD, NEEDS_ATTENTION]
 *         growthStage:
 *           type: string
 *           enum: [SEEDLING, SAPLING, YOUNG, MATURE, FLOWERING, FRUITING]
 *         healthScore:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *         remarks:
 *           type: string
 *         photos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *               caption:
 *                 type: string
 *         recommendedActions:
 *           type: array
 *           items:
 *             type: string
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *           example: "MEDIUM"
 *     InspectionInput:
 *       type: object
 *       required:
 *         - treeId
 *         - inspectorId
 *         - scheduledDate
 *       properties:
 *         treeId:
 *           type: string
 *           example: "tree_456"
 *         inspectorId:
 *           type: string
 *           example: "user_789"
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:00:00Z"
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *           example: "MEDIUM"
 *     InspectionUpdate:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [PENDING, IN_PROGRESS, COMPLETED, MISSED]
 *         scheduledDate:
 *           type: string
 *           format: date-time
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *     InspectionCompletion:
 *       type: object
 *       required:
 *         - treeStatus
 *       properties:
 *         treeStatus:
 *           type: string
 *           enum: [HEALTHY, WEAK, DEAD, NEEDS_ATTENTION]
 *           example: "HEALTHY"
 *         growthStage:
 *           type: string
 *           enum: [SEEDLING, SAPLING, YOUNG, MATURE, FLOWERING, FRUITING]
 *           example: "SAPLING"
 *         healthScore:
 *           type: number
 *           minimum: 1
 *           maximum: 10
 *           example: 8
 *         remarks:
 *           type: string
 *           example: "Tree is growing well, minor pest activity observed"
 *         photos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 example: "https://example.com/photo.jpg"
 *               caption:
 *                 type: string
 *                 example: "Current tree condition"
 *         recommendedActions:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Apply organic pesticide", "Water twice weekly"]
 */

// Apply authentication to all routes
router.use(authenticate);

// Main inspection routes
router.route('/')
  .get(getInspectionsValidation, validate, getInspections)
  .post(createInspectionValidation, validate, createInspection);

router.route('/:id')
  .get(idValidation, validate, getInspection)
  .put(updateInspectionValidation, validate, updateInspection)
  .delete(idValidation, validate, deleteInspection);

// Complete inspection
router.patch('/:id/complete',
  completeInspectionValidation,
  validate,
  completeInspection
);

// Tree-specific routes
router.get('/tree/:treeId',
  treeIdValidation,
  validate,
  getInspectionsByTree
);

// User-specific routes
router.get('/my-pending', getMyPendingInspections);

module.exports = router;