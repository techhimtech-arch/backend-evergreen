const Announcement = require('../models/Announcement');
const User = require('../models/User');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Student = require('../models/Student');
const emailService = require('./emailService');
const logger = require('../utils/logger');

class AnnouncementService {
  constructor() {
    this.emailTemplates = {
      general: {
        subject: 'School Announcement',
        template: this.getGeneralEmailTemplate()
      },
      academic: {
        subject: 'Academic Announcement',
        template: this.getAcademicEmailTemplate()
      },
      emergency: {
        subject: 'URGENT: School Emergency Announcement',
        template: this.getEmergencyEmailTemplate()
      },
      examination: {
        subject: 'Examination Announcement',
        template: this.getExaminationEmailTemplate()
      },
      holiday: {
        subject: 'Holiday Announcement',
        template: this.getHolidayEmailTemplate()
      },
      sports: {
        subject: 'Sports Announcement',
        template: this.getSportsEmailTemplate()
      },
      events: {
        subject: 'School Event Announcement',
        template: this.getEventEmailTemplate()
      }
    };
  }

  /**
   * Send announcement to target audience
   */
  async sendAnnouncement(announcementId) {
    try {
      const announcement = await Announcement.findById(announcementId)
        .populate('author', 'name email');

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      if (announcement.status !== 'published') {
        throw new Error('Announcement must be published before sending');
      }

      // Get target users
      const targetUsers = await this.getTargetUsers(announcement);
      
      const results = {
        email: { sent: 0, failed: 0 },
        sms: { sent: 0, failed: 0 },
        push: { sent: 0, failed: 0 },
        totalUsers: targetUsers.length
      };

      // Send via email
      if (announcement.deliveryMethods.email) {
        const emailResults = await this.sendEmailNotifications(announcement, targetUsers);
        results.email = emailResults;
      }

      // Send via SMS (if SMS service is available)
      if (announcement.deliveryMethods.sms) {
        const smsResults = await this.sendSMSNotifications(announcement, targetUsers);
        results.sms = smsResults;
      }

      // Send push notifications (if push service is available)
      if (announcement.deliveryMethods.push) {
        const pushResults = await this.sendPushNotifications(announcement, targetUsers);
        results.push = pushResults;
      }

      // Update announcement with delivery status
      await Announcement.findByIdAndUpdate(announcementId, {
        emailSent: results.email.sent > 0,
        smsSent: results.sms.sent > 0,
        pushSent: results.push.sent > 0
      });

      logger.info('Announcement sent successfully', {
        announcementId,
        results,
        totalUsers: targetUsers.length
      });

      return results;

    } catch (error) {
      logger.error('Failed to send announcement', {
        announcementId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Get target users for announcement
   */
  async getTargetUsers(announcement) {
    const targetUsers = [];

    // Target all users
    if (announcement.targetAudience.includes('all')) {
      const allUsers = await User.find({ isActive: true });
      targetUsers.push(...allUsers.map(user => ({
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      })));
    }

    // Target by role
    const roleTargets = announcement.targetAudience.filter(audience => 
      ['students', 'teachers', 'parents', 'admin'].includes(audience)
    );

    if (roleTargets.length > 0) {
      const roleUsers = await User.find({ 
        role: { $in: roleTargets },
        isActive: true 
      });
      targetUsers.push(...roleUsers.map(user => ({
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      })));
    }

    // Target specific classes
    if (announcement.targetAudience.includes('specific_classes')) {
      for (const targetClass of announcement.targetClasses) {
        const classStudents = await Student.find({ 
          classId: targetClass.classId,
          isActive: true 
        }).populate('userId');

        targetUsers.push(...classStudents.map(student => ({
          userId: student.userId._id,
          email: student.userId.email,
          name: student.userId.name,
          role: 'student',
          phone: student.userId.phone
        })));
      }
    }

    // Target specific sections
    if (announcement.targetAudience.includes('specific_sections')) {
      for (const targetSection of announcement.targetSections) {
        const sectionStudents = await Student.find({ 
          sectionId: targetSection.sectionId,
          isActive: true 
        }).populate('userId');

        targetUsers.push(...sectionStudents.map(student => ({
          userId: student.userId._id,
          email: student.userId.email,
          name: student.userId.name,
          role: 'student',
          phone: student.userId.phone
        })));
      }
    }

    // Target specific users
    if (announcement.targetUsers.length > 0) {
      const specificUsers = await User.find({
        _id: { $in: announcement.targetUsers.map(u => u.userId) },
        isActive: true
      });

      targetUsers.push(...specificUsers.map(user => ({
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone
      })));
    }

    // Remove duplicates
    const uniqueUsers = targetUsers.filter((user, index, self) =>
      index === self.findIndex((u) => u.userId.toString() === user.userId.toString())
    );

    return uniqueUsers;
  }

  /**
   * Send email notifications
   */
  async sendEmailNotifications(announcement, targetUsers) {
    const results = { sent: 0, failed: 0 };
    const template = this.emailTemplates[announcement.type] || this.emailTemplates.general;

    for (const user of targetUsers) {
      try {
        const html = template.template
          .replace('{{title}}', announcement.title)
          .replace('{{content}}', announcement.content)
          .replace('{{authorName}}', announcement.authorName)
          .replace('{{priority}}', announcement.priority.toUpperCase())
          .replace('{{publishDate}}', new Date(announcement.publishDate).toLocaleDateString());

        await emailService.sendEmail(
          user.email,
          template.subject,
          html
        );

        results.sent++;
      } catch (error) {
        logger.error('Failed to send email to user', {
          userId: user.userId,
          email: user.email,
          error: error.message
        });
        results.failed++;
      }
    }

    return results;
  }

  /**
   * Send SMS notifications (placeholder - would integrate with SMS service)
   */
  async sendSMSNotifications(announcement, targetUsers) {
    const results = { sent: 0, failed: 0 };

    // This would integrate with an SMS service like Twilio, etc.
    // For now, we'll just log it
    logger.info('SMS notifications would be sent', {
      announcementId: announcement._id,
      title: announcement.title,
      userCount: targetUsers.length
    });

    // Placeholder implementation
    results.sent = targetUsers.length;

    return results;
  }

  /**
   * Send push notifications (placeholder - would integrate with push service)
   */
  async sendPushNotifications(announcement, targetUsers) {
    const results = { sent: 0, failed: 0 };

    // This would integrate with a push notification service like Firebase, etc.
    // For now, we'll just log it
    logger.info('Push notifications would be sent', {
      announcementId: announcement._id,
      title: announcement.title,
      userCount: targetUsers.length
    });

    // Placeholder implementation
    results.sent = targetUsers.length;

    return results;
  }

  /**
   * Schedule announcement publishing
   */
  async scheduleAnnouncement(announcementId, scheduledDate) {
    try {
      const announcement = await Announcement.findById(announcementId);

      if (!announcement) {
        throw new Error('Announcement not found');
      }

      if (announcement.status !== 'draft') {
        throw new Error('Only draft announcements can be scheduled');
      }

      const scheduleTime = new Date(scheduledDate);
      if (scheduleTime <= new Date()) {
        throw new Error('Scheduled date must be in the future');
      }

      announcement.status = 'scheduled';
      announcement.scheduledDate = scheduleTime;
      await announcement.save();

      // In a real implementation, you would use a job scheduler like Bull, Agenda, etc.
      // For now, we'll just log it
      logger.info('Announcement scheduled', {
        announcementId,
        scheduledDate: scheduleTime
      });

      return announcement;

    } catch (error) {
      logger.error('Failed to schedule announcement', {
        announcementId,
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Process scheduled announcements (would be called by a cron job)
   */
  async processScheduledAnnouncements() {
    try {
      const scheduledAnnouncements = await Announcement.find({
        status: 'scheduled',
        scheduledDate: { $lte: new Date() }
      });

      for (const announcement of scheduledAnnouncements) {
        announcement.status = 'published';
        announcement.publishDate = new Date();
        await announcement.save();

        // Auto-send if delivery methods are configured
        if (announcement.deliveryMethods.email || 
            announcement.deliveryMethods.sms || 
            announcement.deliveryMethods.push) {
          await this.sendAnnouncement(announcement._id);
        }

        logger.info('Scheduled announcement published', {
          announcementId: announcement._id,
          title: announcement.title
        });
      }

      return scheduledAnnouncements.length;

    } catch (error) {
      logger.error('Failed to process scheduled announcements', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Expire old announcements
   */
  async expireOldAnnouncements() {
    try {
      const expiredAnnouncements = await Announcement.find({
        status: 'published',
        expiryDate: { $lte: new Date() }
      });

      for (const announcement of expiredAnnouncements) {
        announcement.status = 'expired';
        await announcement.save();

        logger.info('Announcement expired', {
          announcementId: announcement._id,
          title: announcement.title
        });
      }

      return expiredAnnouncements.length;

    } catch (error) {
      logger.error('Failed to expire announcements', {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Email templates
   */
  getGeneralEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .priority-high { border-left: 4px solid #DC2626; }
          .priority-urgent { border-left: 4px solid #991B1B; }
          .priority-medium { border-left: 4px solid #F59E0B; }
          .priority-low { border-left: 4px solid #10B981; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📢 School Announcement</h1>
          </div>
          <div class="content priority-{{priority}}">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
            <p><strong>Priority:</strong> {{priority}}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getAcademicEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Academic Announcement</h1>
          </div>
          <div class="content">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEmergencyEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; border: 2px solid #DC2626; }
          .urgent-notice { background: #FEE2E2; border: 1px solid #DC2626; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 URGENT ANNOUNCEMENT</h1>
          </div>
          <div class="content">
            <div class="urgent-notice">
              <h2>{{title}}</h2>
              <p>{{content}}</p>
            </div>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
            <p><strong>Please take immediate action as required.</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getExaminationEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #7C3AED; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📝 Examination Announcement</h1>
          </div>
          <div class="content">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getHolidayEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10B981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Holiday Announcement</h1>
          </div>
          <div class="content">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getSportsEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #F59E0B; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚽ Sports Announcement</h1>
          </div>
          <div class="content">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getEventEmailTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #EC4899; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎊 School Event Announcement</h1>
          </div>
          <div class="content">
            <h2>{{title}}</h2>
            <p>{{content}}</p>
            <hr>
            <p><strong>From:</strong> {{authorName}}</p>
            <p><strong>Date:</strong> {{publishDate}}</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} School Management System</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

module.exports = new AnnouncementService();
