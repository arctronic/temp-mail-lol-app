import {Platform, PermissionsAndroid} from 'react-native';
import PushNotification, {Importance} from 'react-native-push-notification';
import {Email} from '../types';

class NotificationService {
  private isInitialized = false;
  private channelId = 'temp-mail-channel';

  async initialize() {
    if (this.isInitialized) return;

    // Request permissions
    await this.requestPermissions();

    // Configure push notifications
    PushNotification.configure({
      onRegister: (token) => {
        console.log('Push notification token:', token);
      },
      onNotification: (notification) => {
        console.log('Notification received:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          // Navigate to inbox or specific email
          this.handleNotificationTap(notification);
        }
      },
      onAction: (notification) => {
        console.log('Notification action:', notification);
      },
      onRegistrationError: (err) => {
        console.error('Push notification registration error:', err);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channel for Android
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: this.channelId,
          channelName: 'Temp Mail Notifications',
          channelDescription: 'Notifications for new temporary emails',
          playSound: true,
          soundName: 'default',
          importance: Importance.HIGH,
          vibrate: true,
        },
        (created) => {
          console.log('Notification channel created:', created);
        }
      );
    }

    this.isInitialized = true;
  }

  private async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app needs access to show notifications for new emails.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
        }
      } catch (err) {
        console.error('Permission request error:', err);
      }
    }
  }

  // Show notification for new email
  showNewEmailNotification(email: Email, emailAddress: string) {
    if (!this.isInitialized) {
      console.warn('NotificationService not initialized');
      return;
    }

    const title = 'New Email Received';
    const message = `From: ${email.from}\nSubject: ${email.subject || 'No Subject'}`;

    PushNotification.localNotification({
      channelId: this.channelId,
      title,
      message,
      bigText: message,
      subText: emailAddress,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      color: '#26A69A',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      autoCancel: true,
      invokeApp: true,
      userInfo: {
        emailId: email.id,
        emailAddress,
        action: 'new_email',
      },
      actions: ['View', 'Dismiss'],
    });
  }

  // Show notification for multiple new emails
  showMultipleEmailsNotification(count: number, emailAddress: string) {
    if (!this.isInitialized) {
      console.warn('NotificationService not initialized');
      return;
    }

    const title = `${count} New Emails`;
    const message = `You have ${count} new emails in ${emailAddress}`;

    PushNotification.localNotification({
      channelId: this.channelId,
      title,
      message,
      bigText: message,
      subText: emailAddress,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      color: '#26A69A',
      vibrate: true,
      vibration: 300,
      priority: 'high',
      importance: 'high',
      autoCancel: true,
      invokeApp: true,
      userInfo: {
        emailAddress,
        count,
        action: 'multiple_emails',
      },
      actions: ['View Inbox', 'Dismiss'],
    });
  }

  // Show notification for email expiry warning
  showExpiryWarningNotification(emailAddress: string, minutesLeft: number) {
    if (!this.isInitialized) {
      console.warn('NotificationService not initialized');
      return;
    }

    const title = 'Email Expiring Soon';
    const message = `${emailAddress} will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`;

    PushNotification.localNotification({
      channelId: this.channelId,
      title,
      message,
      bigText: message,
      subText: 'Temporary Email',
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
      color: '#FF9800',
      vibrate: true,
      vibration: 300,
      priority: 'default',
      importance: 'default',
      autoCancel: true,
      invokeApp: false,
      userInfo: {
        emailAddress,
        minutesLeft,
        action: 'expiry_warning',
      },
    });
  }

  // Handle notification tap
  private handleNotificationTap(notification: any) {
    const {userInfo} = notification;
    
    if (!userInfo) return;

    switch (userInfo.action) {
      case 'new_email':
        // Navigate to email detail
        console.log('Navigate to email:', userInfo.emailId);
        break;
      case 'multiple_emails':
        // Navigate to inbox
        console.log('Navigate to inbox:', userInfo.emailAddress);
        break;
      case 'expiry_warning':
        // Navigate to home to generate new email
        console.log('Navigate to home for new email');
        break;
      default:
        console.log('Unknown notification action:', userInfo.action);
    }
  }

  // Schedule expiry warning notification
  scheduleExpiryWarning(emailAddress: string, expiryTime: string) {
    if (!this.isInitialized) {
      console.warn('NotificationService not initialized');
      return;
    }

    const expiryDate = new Date(expiryTime);
    const warningTime = new Date(expiryDate.getTime() - 2 * 60 * 1000); // 2 minutes before expiry
    const now = new Date();

    if (warningTime <= now) {
      // Already past warning time
      return;
    }

    const minutesLeft = Math.ceil((expiryDate.getTime() - warningTime.getTime()) / (1000 * 60));

    PushNotification.localNotificationSchedule({
      channelId: this.channelId,
      title: 'Email Expiring Soon',
      message: `${emailAddress} will expire in ${minutesLeft} minute${minutesLeft > 1 ? 's' : ''}`,
      date: warningTime,
      userInfo: {
        emailAddress,
        minutesLeft,
        action: 'expiry_warning',
      },
    });
  }

  // Cancel all notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Cancel notifications for specific email
  cancelNotificationsForEmail(emailAddress: string) {
    // Note: react-native-push-notification doesn't support selective cancellation
    // This would require a more sophisticated notification management system
    console.log('Cancel notifications for:', emailAddress);
  }

  // Get notification settings
  checkPermissions(): Promise<any> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions(resolve);
    });
  }

  // Request permissions again
  async requestPermissionsAgain() {
    if (Platform.OS === 'ios') {
      PushNotification.requestPermissions();
    } else {
      await this.requestPermissions();
    }
  }
}

export default new NotificationService();

