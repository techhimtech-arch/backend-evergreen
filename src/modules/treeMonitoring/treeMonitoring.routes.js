const express = require('express');
const router = express.Router();
const {
  createTreeMonitoring,
  getTreeMonitoringByTreeId,
  getTreeMonitoring,
  updateTreeMonitoring,
  deleteTreeMonitoring,
  getMonitoringByStatus,
  getMonitoringByGrowthStage,
  getMonitoringNeedingAttention
} = require('./treeMonitoring.controller');
const { authenticate } = require('../../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Tree Monitoring
 *   description: Track tree health updates and monitoring records over time
 */

// Static routes before parameterized ones
router.get('/needing-attention', authenticate, getMonitoringNeedingAttention);
router.get('/status/:status', authenticate, getMonitoringByStatus);
router.get('/growth-stage/:stage', authenticate, getMonitoringByGrowthStage);
router.get('/tree/:treeId', authenticate, getTreeMonitoringByTreeId);

// CRUD
router.post('/', authenticate, createTreeMonitoring);
router.get('/:id', authenticate, getTreeMonitoring);
router.patch('/:id', authenticate, updateTreeMonitoring);
router.delete('/:id', authenticate, deleteTreeMonitoring);

module.exports = router;
