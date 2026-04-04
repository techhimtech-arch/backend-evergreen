const express = require('express');
const router = express.Router();
const { 
  getEvents, 
  createEvent, 
  getEventById, 
  updateEvent, 
  deleteEvent
} = require('./plantationEvents.controller');
const { authenticate } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: PlantationEvents
 *   description: Plantation Event Management API
 */

/**
 * @swagger
 * /api/v1/events:
 *   get:
 *     summary: Get all plantation events
 *     tags: [PlantationEvents]
 *     responses:
 *       200:
 *         description: A list of events.
 *   
 *   post:
 *     summary: Create a newly organized plantation event
 *     tags: [PlantationEvents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - eventDate
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               organizationId:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PLANNED, ONGOING, COMPLETED]
 *     responses:
 *       201:
 *         description: Event created successfully.
 *       400:
 *         description: Invalid input parameters.
 *       401:
 *         description: Unauthorized.
 */
router.route('/')
  .get(getEvents)
  .post(authenticate, createEvent);

/**
 * @swagger
 * /api/v1/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [PlantationEvents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Returned event data.
 *       404:
 *         description: Event not found.
 * 
 *   put:
 *     summary: Update an existing event
 *     tags: [PlantationEvents]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [PLANNED, ONGOING, COMPLETED]
 *     responses:
 *       200:
 *         description: Successfully updated event.
 *       400:
 *         description: Invalid parameters.
 *       404:
 *         description: Event not found.
 * 
 *   delete:
 *     summary: Delete a plantation event
 *     tags: [PlantationEvents]
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
 *         description: Successfully deleted event.
 *       404:
 *         description: Event not found.
 */
router.route('/:id')
  .get(getEventById)
  .put(authenticate, updateEvent)
  .delete(authenticate, deleteEvent);

module.exports = router;
