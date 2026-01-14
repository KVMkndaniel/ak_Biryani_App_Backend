const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notificationController');

// Get all notifications for the current user
router.get('/', NotificationController.getNotifications);

// Mark as read
router.put('/:id/read', NotificationController.markAsRead);

// Delete notification
router.delete('/:id', NotificationController.deleteNotification);

module.exports = router;
