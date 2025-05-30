const NotificationService = require('../services/notificationService');

const NotificationController = {
  // Tạo thông báo
  async createNotification(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { noti_entity_ID, noti_entity_type, content, UserID } = req.body;

      if (UserID !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only create notifications for yourself' });
      }

      const result = await NotificationService.createNotification({
        noti_entity_ID,
        noti_entity_type,
        content,
        UserID,
      });

      res.status(201).json(result);
    } catch (error) {
      const status = error.message.includes('not found') || error.message.includes('Invalid') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Tạo thông báo cho admin khi có bài đăng chờ duyệt
  async createPendingArticleNotification(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin role required' });
      }

      const { articleId } = req.body;

      const result = await NotificationService.createPendingArticleNotification(articleId);

      res.status(201).json(result);
    } catch (error) {
      const status = error.message.includes('not found') || error.message.includes('Invalid') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy danh sách thông báo theo UserID
  async getNotifications(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { receiver_id } = req.params;

      if (receiver_id !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only view your own notifications' });
      }

      const result = await NotificationService.getNotificationsByReceiver(receiver_id);
      res.status(200).json(result);
    } catch (error) {
      const status = error.message.includes('Invalid') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Đánh dấu một thông báo là đã đọc
  async markNotificationAsRead(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { notification_id } = req.params;
      const userId = req.user._id;

      const result = await NotificationService.markNotificationAsRead(notification_id, userId);
      res.status(200).json(result);
    } catch (error) {
      const status = error.message.includes('Invalid') || error.message.includes('not found') || error.message.includes('your own') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Đánh dấu tất cả thông báo là đã đọc
  async markAllNotificationsAsRead(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { receiver_id } = req.params;

      if (receiver_id !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only mark your own notifications as read' });
      }

      const result = await NotificationService.markAllNotificationsAsRead(receiver_id);
      res.status(200).json(result);
    } catch (error) {
      const status = error.message.includes('Invalid') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Lấy số lượng thông báo chưa đọc
  async getUnreadNotificationsCount(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { receiver_id } = req.params;

      if (receiver_id !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'You can only view your own unread notifications count' });
      }

      const result = await NotificationService.getUnreadNotificationsCount(receiver_id);
      res.status(200).json(result);
    } catch (error) {
      const status = error.message.includes('Invalid') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },

  // Xóa thông báo
  async deleteNotification(req, res) {
    try {
      if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }

      const { notification_id } = req.params;
      const userId = req.user._id;

      const result = await NotificationService.deleteNotification(notification_id, userId);
      res.status(200).json(result);
    } catch (error) {
      const status = error.message.includes('Invalid') || error.message.includes('not found') || error.message.includes('your own') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message,
      });
    }
  },
};

module.exports = NotificationController;
