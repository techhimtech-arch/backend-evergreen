const express = require('express');
const router = express.Router();
const {
  uploadTreePhoto,
  getTreePhotos,
  getTreePhoto,
  updateTreePhoto,
  verifyTreePhoto,
  deleteTreePhoto,
  getPhotosByType,
  getUnverifiedPhotos,
  getTreePhotoTimeline
} = require('./treePhotos.controller');
const { authenticate } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Tree Photos
 *   description: Tree photo management - upload and retrieve tree photos
 */

// --- Routes under /trees/:treeId (nested) ---
// These are mounted from trees.routes.js for /trees/:treeId/photos

// GET all photos for a tree
router.get('/trees/:treeId/photos', authenticate, getTreePhotos);

// POST upload a photo for a tree (URL-based, no file upload)
router.post('/trees/:treeId/photos', authenticate, uploadTreePhoto);

// GET photo timeline for a tree
router.get('/trees/:treeId/photo-timeline', authenticate, getTreePhotoTimeline);

// --- Standalone tree-photos routes ---

// GET unverified photos (admin)
router.get('/unverified', authenticate, getUnverifiedPhotos);

// GET photos by type
router.get('/type/:type', authenticate, getPhotosByType);

// GET single photo
router.get('/:id', authenticate, getTreePhoto);

// PATCH update photo details
router.patch('/:id', authenticate, updateTreePhoto);

// PATCH verify a photo (admin)
router.patch('/:id/verify', authenticate, verifyTreePhoto);

// DELETE a photo (soft delete)
router.delete('/:id', authenticate, deleteTreePhoto);

module.exports = router;
