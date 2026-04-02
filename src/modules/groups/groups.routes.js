const express = require('express');
const { createGroup, getGroups, getGroup, updateGroup, deleteGroup } = require('./groups.controller');

const router = express.Router();

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Register a new community group
 *     tags: [Groups]
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 */
router.route('/')
  .post(createGroup)
  .get(getGroups);

/**
 * @swagger
 * /groups/{id}:
 *   get:
 *     summary: Get group details
 *     tags: [Groups]
 *   put:
 *     summary: Update group
 *     tags: [Groups]
 *   delete:
 *     summary: Delete group
 *     tags: [Groups]
 */
router.route('/:id')
  .get(getGroup)
  .put(updateGroup)
  .delete(deleteGroup);

module.exports = router;
