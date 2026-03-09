const express = require('express');
const {
  createClass,
  getClasses,
  updateClass,
  deleteClass,
} = require('../controllers/classController');
const authMiddleware = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/roleAuthorization');
const { validateCreateClass, validateUpdateClass } = require('../validators/classValidator');

/**
 * @swagger
 * tags:
 *   name: Classes
 *   description: API endpoints for managing classes
 */

const router = express.Router();

// Create a new class
router.post(
  '/',
  authMiddleware,
  authorizeRoles('school_admin'),
  validateCreateClass,
  createClass
);

/**
 * @swagger
 * /classes:
 *   post:
 *     summary: Create a new class
 *     tags: [Classes]
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
 *                 description: Name of the class
 *                 example: Class 10
 *     responses:
 *       201:
 *         description: Class created successfully
 *       500:
 *         description: Server error
 */

// Get all classes for the logged-in user's school
router.get(
  '/',
  authMiddleware,
  authorizeRoles('school_admin'),
  getClasses
);

/**
 * @swagger
 * /classes:
 *   get:
 *     summary: Get all classes for the logged-in user's school
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of classes
 *       500:
 *         description: Server error
 */

// Update class name
router.patch(
  '/:id',
  authMiddleware,
  authorizeRoles('school_admin'),
  validateUpdateClass,
  updateClass
);

/**
 * @swagger
 * /classes/{id}:
 *   patch:
 *     summary: Update class name
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the class
 *                 example: Class 12
 *     responses:
 *       200:
 *         description: Class updated successfully
 *       500:
 *         description: Server error
 */

// Soft delete a class
router.delete(
  '/:id',
  authMiddleware,
  authorizeRoles('school_admin'),
  deleteClass
);

/**
 * @swagger
 * /classes/{id}:
 *   delete:
 *     summary: Soft delete a class
 *     tags: [Classes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class deleted successfully
 *       500:
 *         description: Server error
 */

module.exports = router;