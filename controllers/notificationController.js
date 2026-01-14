const Notification = require('../models/notificationModel');
const jwt = require('jsonwebtoken');

class NotificationController {
  
  // Get notifications for the logged-in user
  static async getNotifications(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const notifications = await Notification.getByReceiverId(userId);
      const unreadCount = await Notification.getUnreadCount(userId);

      res.status(200).json({
        message: 'Notifications retrieved',
        notifications,
        unreadCount
      });
    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({ message: 'Failed to retrieve notifications', error: error.message });
    }
  }

  // Mark a notification as read
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Access token required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const updated = await Notification.markAsRead(id, userId);

      res.status(200).json({
        message: 'Notification marked as read',
        notification: updated
      });
    } catch (error) {
      console.error('Mark read error:', error);
      res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
  }

  // Delete notification
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
         return res.status(401).json({ message: 'Access token required' });
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;
      
      await Notification.delete(id, userId);
      
      res.status(200).json({ message: 'Notification deleted' });
    } catch (error) {
       console.error('Delete notification error:', error);
       res.status(500).json({ message: 'Failed to delete notification', error: error.message });
    }
  }
}

module.exports = NotificationController;
