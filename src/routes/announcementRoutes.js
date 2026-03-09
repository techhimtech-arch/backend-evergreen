const express = require('express');
const router = express.Router();
const {
  createAnnouncement,
  getAnnouncements,
  getMyAnnouncements,
  getAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  markAsRead,
  addComment,
  getAnnouncementStats
} = require('../controllers/announcementController');
const protect = require('../middlewares/authMiddleware');
const { validateAnnouncement } = require('../middlewares/validationMiddleware');

// Apply auth middleware to all routes
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Announcement:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - targetAudience
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the announcement
 *         title:
 *           type: string
 *           description: The title of the announcement
 *           maxLength: 200
 *         content:
 *           type: string
 *           description: The content/body of the announcement
 *           maxLength: 5000
 *         type:
 *           type: string
 *           enum: [general, academic, sports, events, emergency, examination, holiday]
 *           default: general
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           default: medium
 *         status:
 *           type: string
 *           enum: [draft, published, scheduled, expired]
 *           default: draft
 *         targetAudience:
 *           type: array
 *           items:
 *             type: string
 *             enum: [all, students, teachers, parents, admin, specific_classes, specific_sections]
 *         targetClasses:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               classId:
 *                 type: string
 *               className:
 *                 type: string
 *         targetSections:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               sectionId:
 *                 type: string
 *               sectionName:
 *                 type: string
 *         targetUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [student, teacher, parent, admin]
 *         author:
 *           type: string
 *           description: ID of the user who created the announcement
 *         authorName:
 *           type: string
 *           description: Name of the user who created the announcement
 *         publishDate:
 *           type: string
 *           format: date
 *         expiryDate:
 *           type: string
 *           format: date
 *         scheduledDate:
 *           type: string
 *           format: date
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *         deliveryMethods:
 *           type: object
 *           properties:
 *             email:
 *               type: boolean
 *               default: false
 *             sms:
 *               type: boolean
 *               default: false
 *             push:
 *               type: boolean
 *               default: true
 *             dashboard:
 *               type: boolean
 *               default: true
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *         isPinned:
 *           type: boolean
 *           default: false
 *         allowComments:
 *           type: boolean
 *           default: false
 *         comments:
 *           type: array
 *           items:
 *             type: object
 *         viewCount:
 *           type: number
 *           default: 0
 *         readBy:
 *           type: array
 *           items:
 *             type: object
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/v1/announcements:
 *   post:
 *     summary: Create a new announcement
 *     tags: [Announcements]
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
 *               - content
 *               - targetAudience
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *                 maxLength: 5000
 *               type:
 *                 type: string
 *                 enum: [general, academic, sports, events, emergency, examination, holiday]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *               targetClasses:
 *                 type: array
 *                 items:
 *                   type: object
 *               targetSections:
 *                 type: array
 *                 items:
 *                   type: object
 *               targetUsers:
 *                 type: array
 *                 items:
 *                   type: object
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               scheduledDate:
 *                 type: string
 *                 format: date
 *               deliveryMethods:
 *                 type: object
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               allowComments:
 *                 type: boolean
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Announcement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', validateAnnouncement, createAnnouncement);

/**
 * @swagger
 * /api/v1/announcements:
 *   get:
 *     summary: Get all announcements with filtering and pagination
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, scheduled, expired]
 *         description: Filter by status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [general, academic, sports, events, emergency, examination, holiday]
 *         description: Filter by type
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *       - in: query
 *         name: targetAudience
 *         schema:
 *           type: string
 *         description: Filter by target audience
 *       - in: query
 *         name: author
 *         schema:
 *           type: string
 *         description: Filter by author ID
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title, content, and tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: publishDate
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: List of announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *       401:
 *         description: Unauthorized
 */
router.get('/', getAnnouncements);

/**
 * @swagger
 * /api/v1/announcements/my:
 *   get:
 *     summary: Get announcements for the current user
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Get only unread announcements
 *     responses:
 *       200:
 *         description: User's announcements
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', getMyAnnouncements);

/**
 * @swagger
 * /api/v1/announcements/stats:
 *   get:
 *     summary: Get announcement statistics (Admin only)
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date
 *     responses:
 *       200:
 *         description: Announcement statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     published:
 *                       type: integer
 *                     draft:
 *                       type: integer
 *                     scheduled:
 *                       type: integer
 *                     expired:
 *                       type: integer
 *                     byType:
 *                       type: array
 *                     byPriority:
 *                       type: array
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.get('/stats', getAnnouncementStats);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   get:
 *     summary: Get a single announcement by ID
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Announcement'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Announcement not found
 */
router.get('/:id', getAnnouncement);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   put:
 *     summary: Update an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *               priority:
 *                 type: string
 *               status:
 *                 type: string
 *               targetAudience:
 *                 type: array
 *               expiryDate:
 *                 type: string
 *               deliveryMethods:
 *                 type: object
 *               tags:
 *                 type: array
 *               allowComments:
 *                 type: boolean
 *               isPinned:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Announcement updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this announcement
 *       404:
 *         description: Announcement not found
 */
router.put('/:id', updateAnnouncement);

/**
 * @swagger
 * /api/v1/announcements/{id}:
 *   delete:
 *     summary: Delete an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this announcement
 *       404:
 *         description: Announcement not found
 */
router.delete('/:id', deleteAnnouncement);

/**
 * @swagger
 * /api/v1/announcements/{id}/read:
 *   post:
 *     summary: Mark announcement as read
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     responses:
 *       200:
 *         description: Announcement marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Announcement not found
 */
router.post('/:id/read', markAsRead);

/**
 * @swagger
 * /api/v1/announcements/{id}/comments:
 *   post:
 *     summary: Add a comment to an announcement
 *     tags: [Announcements]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Announcement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Comment added successfully
 *       400:
 *         description: Bad request or comments not allowed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Announcement not found
 */
router.post('/:id/comments', addComment);

module.exports = router;
