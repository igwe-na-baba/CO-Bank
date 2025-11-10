import { CustomerGroup, Transaction } from '../types';

// ===================================================================================
// EMAIL TEMPLATE HELPERS
// ===================================================================================

const generateEmailHeader = (subject: string): string => `
  <div style="padding: 20px 0; border-bottom: 1px solid #e5e7eb; text-align: center; background-color: #f8f9fa;">
    <h1 style="color: rgb(var(--color-primary-600)); font-size: 24px; margin: 0; font-weight: 700;">iCredit Union®</h1>
    <p style="font-size: 14px; color: #4b5563; margin-top: 5px;">${subject}</p>
  </div>
`;

const generateEmailFooter = (): string => `
  <div style="font-size: 12px; color: #6b7280; margin-top: 20px; padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; background-color: #f8f9fa;">
    <p>This is an automated transactional message. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} iCredit Union®, N.A. Member FDIC.</p>
    <p>123 Finance Street, New York, NY 10001</p>
    <p>
        <a href="#" style="color: rgb(var(--color-primary-500)); text-decoration: none;">Unsubscribe</a> | 
        <a href="#" style="color: rgb(var(--color-primary-500)); text-decoration: none;">Privacy Policy</a> | 
        <a href="#" style="color: rgb(var(--color-primary-500)); text-decoration: none;">Contact Support</a>
    </p>
  </div>
`;

const generateEmailWrapper = (subject: string, content: string): string => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; background-color: #f3f4f6; padding: 20px; color: #1f2937;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      ${generateEmailHeader(subject)}
      <div style="padding: 30px; line-height: 1.6;">
        ${content}
      </div>
      ${generateEmailFooter()}
    </div>
  </div>
`;

// ===================================================================================
// NOTIFICATION SENDING SIMULATIONS
// ===================================================================================

interface NotificationResult {
    success: boolean;
    error?: string;
}

/**
 * Simulates sending a push notification to a group of customers via a service like FCM.
 * @param customerGroup - The group of customers to target.
 * @param title - The title of the push notification.
 * @param body - The body content of the push notification.
 */
export const sendPushNotification = async (customerGroup: CustomerGroup, title: string, body: string): Promise<NotificationResult> => {
  // Simulate FCM API call
  const messageId = `projects/icu-prod/messages/${Date.now()}-${Math.random().toString(36).substring(2)}`;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));

  console.log(`
================================================================
🚀 ADVANCED PUSH NOTIFICATION SIMULATION (FCM) 🚀
----------------------------------------------------------------
STATUS:       SUCCESS
TIMESTAMP:    ${new Date().toISOString()}
TARGET:       topic/${customerGroup}
MESSAGE_ID:   ${messageId}

--- PAYLOAD ---
{
  "notification": {
    "title": "${title}",
    "body": "${body}"
  },
  "data": { "click_action": "FLUTTER_NOTIFICATION_CLICK" }
}
----------------------------------------------------------------
(This is a simulated Push Notification.)
================================================================
  `);
  return { success: true };
};

/**
 * Simulates sending a transactional email via a professional service like Nodemailer with SendGrid.
 * @param recipientEmail - The customer's email address.
 * @param subject - The subject line of the email.
 * @param body - The HTML body of the email.
 */
export const sendTransactionalEmail = async (recipientEmail: string, subject: string, body: string): Promise<NotificationResult> => {
  const mailOptions = {
    from: '"iCredit Union®" <noreply@icreditunion.com>',
    to: recipientEmail,
    subject: subject,
    html: body,
    headers: {
      'X-Priority': '1 (Highest)',
      'X-MSMail-Priority': 'High',
      'Importance': 'High'
    }
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 250));

  const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2)}@icreditunion.com>`;

  console.log(`
================================================================================
📧 ADVANCED EMAIL SIMULATION (Nodemailer via SendGrid) 📧
--------------------------------------------------------------------------------
STATUS:       SENT
TIMESTAMP:    ${new Date().toISOString()}
FROM:         ${mailOptions.from}
TO:           ${mailOptions.to}
SUBJECT:      ${mailOptions.subject}
MESSAGE-ID:   ${messageId}
SMTP RESPONSE: 250 OK: queued as ${Math.random().toString(36).substring(2).toUpperCase()}
--------------------------------------------------------------------------------
(This is a simulated email.)
================================================================================
  `);
  return { success: true };
};


/**
 * Simulates sending an SMS notification via a service like Twilio.
 * @param phoneNumber - The customer's phone number.
 * @param message - The text message content.
 */
export const sendSmsNotification = async (phoneNumber: string, message: string): Promise<NotificationResult> => {
  const accountSid = 'AC_SIMULATED_ACCOUNT_SID';
  const messageSid = `SM${[...Array(32)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 150));

  console.log(`
================================================================
📱 ADVANCED SMS SIMULATION (Twilio) 📱
----------------------------------------------------------------
STATUS:       queued
TIMESTAMP:    ${new Date().toISOString()}
SID:          ${messageSid}
ACCOUNT_SID:  ${accountSid}
DIRECTION:    outbound-api
FROM:         +15005550006 (Simulated)
TO:           ${phoneNumber}

--- MESSAGE BODY ---
${message}
----------------------------------------------------------------
(This is a simulated SMS.)
================================================================
  `);
  return { success: true };
};


// ===================================================================================
// EMAIL & SMS TEMPLATE GENERATORS
// ===================================================================================

export const generateTransactionReceiptEmail = (transaction: Transaction, cardholderName: string): { subject: string, body: string } => {
    const subject = `Your iCredit Union® Transaction Receipt`;
    const content = `
      <h2 style="color: #1f2937; font-size: 20px;">Transaction Submitted</h2>
      <p style="font-size: 16px; color: #4b5563;">Dear ${cardholderName || 'Customer'},</p>
      <p style="font-size: 16px; color: #4b5563;">This email confirms that your transaction has been successfully submitted.</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; margin: 20px 0;">
          <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Transaction Details:</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <tr><td style="padding: 8px 0; color: #6b7280;">ID:</td><td style="padding: 8px 0; text-align: right; font-family: monospace;">${transaction.id}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Amount Sent:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Recipient:</td><td style="padding: 8px 0; text-align: right;">${transaction.recipient.fullName}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Recipient Gets:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.recipient.country.currency })}</td></tr>
              <tr><td style="padding: 8px 0; color: #6b7280;">Estimated Arrival:</td><td style="padding: 8px 0; text-align: right;">${transaction.estimatedArrival.toLocaleDateString()}</td></tr>
          </table>
      </div>
      <p style="font-size: 16px; color: #4b5563;">You can view the full details by logging into your iCredit Union® account.</p>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateTransactionReceiptSms = (transaction: Transaction): string => {
  const amount = transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  return `iCredit Union®: Your transfer of ${amount} to ${transaction.recipient.fullName} has been submitted. Txn ID: ${transaction.id.slice(-8)}`;
};

export const generateCardStatusEmail = (cardholderName: string, isFrozen: boolean, lastFour: string): { subject: string; body: string } => {
  const status = isFrozen ? 'Frozen' : 'Unfrozen';
  const subject = `Security Alert: Your Card has been ${status}`;
  const content = `
    <h2 style="color: #d97706; font-size: 20px;">Security Alert</h2>
    <p style="font-size: 16px; color: #4b5563;">Dear ${cardholderName},</p>
    <p style="font-size: 16px; color: #4b5563;">This is a confirmation that your iCredit Union® card (ending in <strong>${lastFour}</strong>) has been <strong>${status}</strong>.</p>
    <ul style="font-size: 16px; color: #4b5563; padding-left: 20px;">
      <li>If you initiated this action, no further steps are needed.</li>
      <li>If you did NOT authorize this change, please contact our support team immediately.</li>
    </ul>
    <p style="font-size: 16px; color: #4b5563;">Sincerely,<br/>The iCredit Union® Security Team</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateNewRecipientEmail = (cardholderName: string, recipientName: string): { subject: string; body: string } => {
  const subject = `Security Alert: New Recipient Added`;
  const content = `
    <h2 style="color: #d97706; font-size: 20px;">Security Alert</h2>
    <p style="font-size: 16px; color: #4b5563;">Dear ${cardholderName},</p>
    <p style="font-size: 16px; color: #4b5563;">A new recipient, "<strong>${recipientName}</strong>", has been added to your iCredit Union® account.</p>
    <ul style="font-size: 16px; color: #4b5563; padding-left: 20px;">
        <li>If you added this recipient, you can disregard this message.</li>
        <li>If you do NOT recognize this activity, please log in to your account immediately to review your recipients and contact our support team.</li>
    </ul>
    <p style="font-size: 16px; color: #4b5563;">Sincerely,<br/>The iCredit Union® Security Team</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateNewRecipientSms = (recipientName: string): string => {
  return `iCredit Union®: A new recipient, "${recipientName}", has been added. If this was not you, contact us immediately.`;
};

export const generateFundsArrivedEmail = (transaction: Transaction, cardholderName: string): { subject: string, body: string } => {
    const subject = `Your Transfer Has Arrived`;
    const content = `
      <h2 style="color: #16a34a; font-size: 20px;">Transfer Completed!</h2>
      <p style="font-size: 16px; color: #4b5563;">Dear ${cardholderName},</p>
      <p style="font-size: 16px; color: #4b5563;">Great news! Your transfer to <strong>${transaction.recipient.fullName}</strong> has arrived.</p>
      <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; padding: 20px; margin: 20px 0;">
        <h3 style="color: #1f2937; margin-top: 0; font-size: 16px;">Transaction Summary:</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Amount Sent:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${transaction.sendAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Recipient Received:</td><td style="padding: 8px 0; text-align: right; font-weight: bold;">${transaction.receiveAmount.toLocaleString('en-US', { style: 'currency', currency: transaction.recipient.country.currency })}</td></tr>
        </table>
      </div>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateLoginAlertEmail = (userName: string): { subject: string, body: string } => {
  const subject = `Security Alert: New Sign-in`;
  const content = `
    <h2 style="color: #d97706; font-size: 20px;">Security Alert</h2>
    <p style="font-size: 16px; color: #4b5563;">Dear ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">We detected a new sign-in to your iCredit Union® account. If this was you, you can safely ignore this email.</p>
    <p style="font-size: 16px; color: #4b5563;">If you do not recognize this activity, please change your password and contact our support team immediately.</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateLoginAlertSms = (): string => {
  return `iCredit Union® Security Alert: A new sign-in to your account was detected. If this was not you, please contact support immediately.`;
};

export const generateOtpSms = (): string => {
  return `Your iCredit Union® verification code is 123456. Do not share this code.`;
};

export const generateOtpEmail = (userName: string): { subject: string, body: string } => {
    const subject = `Your Verification Code`;
    const content = `
      <h2 style="color: #1f2937; font-size: 20px;">Confirm Your Action</h2>
      <p style="font-size: 16px; color: #4b5563;">Dear ${userName},</p>
      <p style="font-size: 16px; color: #4b5563;">Please use the following verification code to complete your action:</p>
      <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 0.5em; margin: 20px 0; background-color: #f3f4f6; padding: 15px; border-radius: 4px;">123456</p>
      <p style="font-size: 14px; color: #6b7280;">This code will expire in 10 minutes. If you did not request this, please contact support immediately.</p>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateNewAccountOtpEmail = (userName: string): { subject: string, body: string } => {
    const subject = `Verify Your New Account`;
    const content = `
      <h2 style="color: #1f2937; font-size: 20px;">Welcome! Please Verify Your Account</h2>
      <p style="font-size: 16px; color: #4b5563;">Dear ${userName},</p>
      <p style="font-size: 16px; color: #4b5563;">Thank you for creating an account. Please use the following one-time code to complete your registration:</p>
      <p style="font-size: 32px; font-weight: bold; text-align: center; letter-spacing: 0.5em; margin: 20px 0; background-color: #f3f4f6; padding: 15px; border-radius: 4px;">123456</p>
    `;
    return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateNewAccountOtpSms = (): string => {
  return `Your iCredit Union® account verification code is 123456. Welcome aboard!`;
};

export const generateFullWelcomeEmail = (userName: string, accounts: { type: string, number: string }[]): { subject: string, body: string } => {
  const subject = `Welcome to iCredit Union®, ${userName}!`;
  const accountList = accounts.map(acc => `<tr><td style="padding: 8px; border-bottom: 1px solid #e5e7eb;"><strong>${acc.type}</strong></td><td style="padding: 8px; border-bottom: 1px solid #e5e7eb; font-family: monospace;">${acc.number}</td></tr>`).join('');
  const content = `
    <h2 style="color: #1f2937; font-size: 20px;">Welcome to the Future of Banking!</h2>
    <p style="font-size: 16px; color: #4b5563;">Hi ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">Your iCredit Union® account has been successfully created. Your new accounts are being provisioned and will be ready for use shortly.</p>
    <p style="font-size: 16px; color: #4b5563;">For your records, your new account numbers are:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px;">${accountList}</table>
    <p style="font-size: 16px; color: #4b5563;">We will notify you again as soon as your accounts are active.</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateFullWelcomeSms = (userName: string): string => {
  return `Welcome to iCredit Union®, ${userName}! Your new accounts are being provisioned. We'll notify you via the app once they are active.`;
};


export const generateWelcomeEmail = (userName: string): { subject: string, body: string } => {
  const subject = `Welcome to iCredit Union®!`;
  const content = `
    <h2 style="color: #1f2937; font-size: 20px;">Welcome to the Future of Banking!</h2>
    <p style="font-size: 16px; color: #4b5563;">Hi ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">Your iCredit Union® account is active. You can now send money internationally, track transfers in real-time, and manage your finances with our powerful, secure tools.</p>
    <p style="text-align: center; margin: 30px 0;">
      <a href="#" style="background-color: rgb(var(--color-primary-500)); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Go to Dashboard</a>
    </p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateWelcomeSms = (userName: string): string => {
  return `Welcome to iCredit Union®, ${userName}! Your account is now active. Log in to start sending money globally.`;
};

export const generateDepositConfirmationEmail = (userName: string, amount: number, cardLastFour: string): { subject: string, body: string } => {
  const subject = `Deposit Confirmation`;
  const content = `
    <h2 style="color: #16a34a; font-size: 20px;">Funds Added Successfully!</h2>
    <p style="font-size: 16px; color: #4b5563;">Hi ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">This email confirms that <strong>${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</strong> has been successfully deposited into your account from your card ending in <strong>${cardLastFour}</strong>.</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateDepositConfirmationSms = (amount: number, cardLastFour: string): string => {
  return `iCredit Union®: A deposit of ${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} from card **** ${cardLastFour} was successful.`;
};

export const generateTaskReminderEmail = (userName: string, taskText: string, dueDate: Date): { subject: string, body: string } => {
  const subject = `Task Reminder`;
  const content = `
    <h2 style="color: #1f2937; font-size: 20px;">Task Due Today!</h2>
    <p style="font-size: 16px; color: #4b5563;">Hi ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">This is a friendly reminder that the following task is due today, ${dueDate.toLocaleDateString()}:</p>
    <p style="font-weight: bold; font-size: 1.1em; background-color: #f3f4f6; padding: 15px; border-radius: 4px;">"${taskText}"</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateTaskReminderSms = (taskText: string): string => {
  return `iCredit Union® Reminder: Your task "${taskText}" is due today.`;
};

export const generatePasswordResetEmail = (userName: string, recipientEmail: string): { subject: string, body: string } => {
  const subject = `Password Reset Request`;
  const content = `
    <h2 style="color: #1f2937; font-size: 20px;">Password Reset Request</h2>
    <p style="font-size: 16px; color: #4b5563;">Dear ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">We received a request to reset the password for your iCredit Union® account. To reset your password, please click the link below. This link is valid for 30 minutes.</p>
    <p style="text-align: center; margin: 30px 0;">
        <a href="#" style="background-color: rgb(var(--color-primary-500)); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Your Password</a>
    </p>
    <p style="font-size: 16px; color: #4b5563;">If you did not request a password reset, please disregard this email and contact our support team immediately.</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generatePasswordResetSms = (): string => {
  return `iCredit Union® Security Alert: A password reset was requested for your account. If this was not you, please contact support immediately.`;
};

export const generateSupportTicketConfirmationEmail = (userName: string, ticketId: string, topic: string): { subject: string, body: string } => {
  const subject = `Support Ticket #${ticketId} Received`;
  const content = `
    <h2 style="color: #1f2937; font-size: 20px;">We've Received Your Request</h2>
    <p style="font-size: 16px; color: #4b5563;">Dear ${userName},</p>
    <p style="font-size: 16px; color: #4b5563;">Thank you for contacting support. We have received your inquiry regarding "<strong>${topic}</strong>" and a ticket has been created.</p>
    <p style="font-size: 16px; color: #4b5563;">Your Ticket ID is: <strong style="font-family: monospace; background-color: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${ticketId}</strong></p>
    <p style="font-size: 16px; color: #4b5563;">Our team will review your request and get back to you within 24 business hours.</p>
  `;
  return { subject, body: generateEmailWrapper(subject, content) };
};

export const generateSupportTicketConfirmationSms = (ticketId: string): string => {
  return `iCredit Union® Support: Your ticket #${ticketId} has been received. Our team will contact you shortly.`;
};