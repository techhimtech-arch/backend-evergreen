const express = require('express');
const organizationsController = require('./organizations.controller');
const { authenticate, authorizeRoles } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validation.middleware');
const { createValidation, updateValidation, idValidation } = require('./organizations.validation');
const { body } = require('express-validator');

const router = express.Router();

router.use(authenticate);

/**
 * @swagger
 * tags:
 *   name: Organizations
 *   description: Multi-tenant organization management APIs
 */

/**
 * @swagger
 * /organizations:
 *   get:
 *     summary: Get all organizations
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of organizations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Organization'
 *   post:
 *     summary: Create a new organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationInput'
 *     responses:
 *       201:
 *         description: Organization created successfully
 */

/**
 * @swagger
 * /organizations/{id}:
 *   get:
 *     summary: Get organization by ID
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization details
 *   put:
 *     summary: Update organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OrganizationInput'
 *     responses:
 *       200:
 *         description: Organization updated successfully
 *   delete:
 *     summary: Delete organization
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization deleted successfully
 */

/**
 * @swagger
 * /organizations/{id}/status:
 *   patch:
 *     summary: Toggle organization status
 *     tags: [Organizations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Organization ID
 *     responses:
 *       200:
 *         description: Organization status toggled successfully
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Organization:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "org_123"
 *         name:
 *           type: string
 *           example: "Green Earth Foundation"
 *         type:
 *           type: string
 *           enum: [NGO, SCHOOL, PANCHAYAT, COMPANY, OTHER]
 *           example: "NGO"
 *         address:
 *           type: string
 *           example: "123 Green Street, Village"
 *         contactPerson:
 *           type: string
 *           example: "John Doe"
 *         contactEmail:
 *           type: string
 *           format: email
 *           example: "john@greenearth.org"
 *         contactPhone:
 *           type: string
 *           example: "+91-9876543210"
 *         isActive:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     OrganizationInput:
 *       type: object
 *       required:
 *         - name
 *         - type
 *         - contactPerson
 *         - contactEmail
 *       properties:
 *         name:
 *           type: string
 *           example: "Green Earth Foundation"
 *         type:
 *           type: string
 *           enum: [NGO, SCHOOL, PANCHAYAT, COMPANY, OTHER]
 *           example: "NGO"
 *         address:
 *           type: string
 *           example: "123 Green Street, Village"
 *         contactPerson:
 *           type: string
 *           example: "John Doe"
 *         contactEmail:
 *           type: string
 *           format: email
 *           example: "john@greenearth.org"
 *         contactPhone:
 *           type: string
 *           example: "+91-9876543210"
 */

// List and Create
router.route('/')
  .get(authorizeRoles('SUPER_ADMIN'), organizationsController.getOrganizations)
  .post(authorizeRoles('SUPER_ADMIN'), createValidation, validate, organizationsController.createOrganization);

// View, Update, Toggle & Delete
router.route('/:id')
  .get(idValidation, validate, organizationsController.getOrganizationById)
  .put(authorizeRoles('SUPER_ADMIN'), updateValidation, validate, organizationsController.updateOrganization)
  .delete(authorizeRoles('SUPER_ADMIN'), idValidation, validate, organizationsController.deleteOrganization);

router.patch('/:id/status',
  authorizeRoles('SUPER_ADMIN'),
  idValidation,
  validate,
  organizationsController.toggleStatus
);

module.exports = router;
