import { MailService } from '@sendgrid/mail';
import { Twilio } from 'twilio';
import { db } from '../db';
import { notifications, notificationTemplates, notificationSettings } from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface NotificationData {
  userId: string;
  type: 'email' | 'sms' | 'system';
  title: string;
  message: string;
  templateName?: string;
  variables?: Record<string, any>;
  recipientEmail?: string;
  recipientPhone?: string;
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface SMSOptions {
  to: string;
  body: string;
}

class NotificationService {
  private mailService: MailService | null = null;
  private twilioClient: Twilio | null = null;
  private fromEmail: string = 'noreply@algiacademy.com';
  private fromPhone: string = '';

  constructor() {
    this.initializeServices();
  }

  private initializeServices() {
    // Initialize SendGrid
    if (process.env.SENDGRID_API_KEY) {
      this.mailService = new MailService();
      this.mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }

    // Initialize Twilio
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      this.twilioClient = new Twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      this.fromPhone = process.env.TWILIO_PHONE_NUMBER || '';
    }
  }

  async sendNotification(data: NotificationData): Promise<boolean> {
    try {
      // Check user notification settings
      const userSettings = await this.getUserNotificationSettings(data.userId);
      
      if (!this.shouldSendNotification(data.type, userSettings)) {
        console.log(`Notification blocked by user settings: ${data.type} for user ${data.userId}`);
        return false;
      }

      // Process template if provided
      let processedMessage = data.message;
      let processedTitle = data.title;

      if (data.templateName) {
        const template = await this.getTemplate(data.templateName);
        if (template) {
          processedMessage = this.processTemplate(template.content, data.variables || {});
          if (template.subject && data.type === 'email') {
            processedTitle = this.processTemplate(template.subject, data.variables || {});
          }
        }
      }

      // Create notification record
      const notification = await db.insert(notifications).values({
        userId: data.userId,
        type: data.type,
        title: processedTitle,
        message: processedMessage,
        status: 'pending'
      }).returning();

      let success = false;

      // Send based on type
      switch (data.type) {
        case 'email':
          if (data.recipientEmail) {
            success = await this.sendEmail({
              to: data.recipientEmail,
              subject: processedTitle,
              html: processedMessage,
              text: processedMessage.replace(/<[^>]*>/g, '') // Strip HTML for text version
            });
          }
          break;

        case 'sms':
          if (data.recipientPhone) {
            success = await this.sendSMS({
              to: data.recipientPhone,
              body: processedMessage
            });
          }
          break;

        case 'system':
          // System notifications are just stored in DB
          success = true;
          break;
      }

      // Update notification status
      await db.update(notifications)
        .set({ 
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : null
        })
        .where(eq(notifications.id, notification[0].id));

      return success;
    } catch (error) {
      console.error('Notification send error:', error);
      return false;
    }
  }

  private async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.mailService) {
      console.error('SendGrid not configured');
      return false;
    }

    try {
      await this.mailService.send({
        to: options.to,
        from: this.fromEmail,
        subject: options.subject,
        text: options.text,
        html: options.html
      });
      return true;
    } catch (error) {
      console.error('Email send error:', error);
      return false;
    }
  }

  private async sendSMS(options: SMSOptions): Promise<boolean> {
    if (!this.twilioClient || !this.fromPhone) {
      console.error('Twilio not configured');
      return false;
    }

    try {
      await this.twilioClient.messages.create({
        body: options.body,
        from: this.fromPhone,
        to: options.to
      });
      return true;
    } catch (error) {
      console.error('SMS send error:', error);
      return false;
    }
  }

  private async getUserNotificationSettings(userId: string) {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, userId));
    
    return settings || {
      emailEnabled: true,
      smsEnabled: true,
      courseReminders: true,
      examNotifications: true,
      systemUpdates: true,
      marketingEmails: false
    };
  }

  private shouldSendNotification(type: string, settings: any): boolean {
    switch (type) {
      case 'email':
        return settings.emailEnabled;
      case 'sms':
        return settings.smsEnabled;
      case 'system':
        return settings.systemUpdates;
      default:
        return true;
    }
  }

  private async getTemplate(templateName: string) {
    const [template] = await db
      .select()
      .from(notificationTemplates)
      .where(and(
        eq(notificationTemplates.name, templateName),
        eq(notificationTemplates.isActive, true)
      ));
    
    return template;
  }

  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processed = processed.replace(regex, String(value));
    });
    
    return processed;
  }

  // Predefined notification methods
  async sendCourseEnrollmentNotification(userId: string, courseName: string, userEmail: string) {
    return this.sendNotification({
      userId,
      type: 'email',
      title: 'Kurs Kaydınız Tamamlandı',
      message: `${courseName} kursuna başarıyla kaydoldunuz. İyi öğrenmeler!`,
      templateName: 'course_enrollment',
      variables: { courseName, userName: 'Değerli Öğrenci' },
      recipientEmail: userEmail
    });
  }

  async sendExamReminderNotification(userId: string, examName: string, examDate: string, userPhone: string) {
    return this.sendNotification({
      userId,
      type: 'sms',
      title: 'Sınav Hatırlatması',
      message: `${examName} sınavınız ${examDate} tarihinde. Hazırlıklarınızı tamamlamayı unutmayın!`,
      recipientPhone: userPhone
    });
  }

  async sendSystemMaintenanceNotification(userId: string, userEmail: string) {
    return this.sendNotification({
      userId,
      type: 'email',
      title: 'Sistem Bakım Bildirimi',
      message: 'Sistemimiz bugün 02:00-04:00 saatleri arasında bakım nedeniyle erişilemeyecektir.',
      recipientEmail: userEmail
    });
  }
}

export const notificationService = new NotificationService();