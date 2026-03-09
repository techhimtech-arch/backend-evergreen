const express = require('express');
const { createUser, getUsers, toggleUserStatus } = require('../controllers/userController');
const authorizeRoles = require('../middlewares/roleAuthorization');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management for school admins
 */

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user (teacher or accountant)
 *     tags: [Users]
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
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [teacher, accountant]
 *     responses:
 *       201:
 *         description: User created successfully
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users of the same school
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   role:
 *                     type: string
 *                   isActive:
 *                     type: boolean
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /users/{id}/status:
 *   patch:
 *     summary: Toggle user status (activate/deactivate)
 *     tags: [Users]
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
 *         description: User status updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

// Create a new user (teacher or accountant)
router.post('/', authMiddleware, authorizeRoles('school_admin'), createUser);

// Get all users of the same school
router.get('/', authMiddleware, authorizeRoles('school_admin'), getUsers);

// Toggle user status (activate/deactivate)
router.patch('/:id/status', authMiddleware, authorizeRoles('school_admin'), toggleUserStatus);

module.exports = router;