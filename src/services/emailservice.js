// src/services/emailservice.js
import emailjs from '@emailjs/browser';

// ✅ CORRECTED: EmailJS Configuration
const EMAILJS_SERVICE_ID = 'service_acxve0w';
const EMAILJS_PUBLIC_KEY = 'gpVE8rDD5mghTjSDF'; // ⚠️ REPLACE with your REAL public key from EmailJS Account page

// Email Templates
const TEMPLATES = {
  GENERAL: 'template_cgmxcj5',
  GOOGLE_MEET: 'template_k6a7u9d'
};

// Initialize EmailJS with PUBLIC KEY
emailjs.init(EMAILJS_PUBLIC_KEY);

// Admin email
const ADMIN_EMAIL = 'mydummy.0018@gmail.com';

/**
 * Main email sender
 */
const sendEmail = async ({ to_email, to_name, subject, message, reply_to = 'noreply@swapnova.com' }) => {
  try {
    const templateParams = {
      to_email,
      to_name,
      subject,
      message,
      reply_to,
      from_name: 'SwapNova Team'
    };

    console.log('📧 Sending email to:', to_email);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.GENERAL,
      templateParams
    );

    console.log('✅ Email sent successfully');
    return { success: true, response };
  } catch (error) {
    console.error('❌ Email error:', error);
    return { success: false, error: error.text || error.message };
  }
};

/**
 * 1. WELCOME EMAIL - After profile creation
 */
export const sendWelcomeEmail = async (user) => {
  return sendEmail({
    to_email: user.email,
    to_name: user.fullName,
    subject: 'Welcome to SwapNova! ',
    message: `Welcome to SwapNova! Your profile has been successfully created.
You can now exchange skills , learn new things and connect with others.

Ready to start your skill exchange journey? Log in and explore!`
  });
};

/**
 * 2. CONNECTION EMAIL - When Person A clicks Connect
 * Person B receives this email
 */
export const sendConnectionEmail = async (fromUser, toUser) => {
  return sendEmail({
    to_email: toUser.email,
    to_name: toUser.fullName,
    reply_to: fromUser.email || 'noreply@swapnova.com',
    subject: `New Skill Exchange Request`,
    message: `${fromUser.fullName} found your profile on SwapNova and wants to connect with you.

Their Skills: ${fromUser.skillsOffered?.slice(0, 3).join(', ') || 'Not specified'}
Looking to Learn: ${fromUser.skillsNeeded?.slice(0, 3).join(', ') || 'Not specified'}
Location: ${fromUser.location?.city || 'Not specified'}
Exchange Mode: ${fromUser.exchangeMode || 'Not specified'}

This looks like a great match! 
Log in to respond and start chatting.`
  });
};

/**
 * 3. GOOGLE MEET EMAIL - When Person A starts Google Meet
 * Person B receives this email with meeting link
 */
export const sendGoogleMeetEmail = async (fromUser, toUser, meetUrl) => {
  try {
    const templateParams = {
      to_email: toUser.email,
      to_name: toUser.fullName,
      from_name: fromUser.fullName,
      meet_url: meetUrl,
      reply_to: fromUser.email || 'noreply@swapnova.com'
    };

    console.log('📧 Sending Google Meet email to:', toUser.email);
    console.log('📹 Meet URL:', meetUrl);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      TEMPLATES.GOOGLE_MEET,
      templateParams
    );

    console.log('✅ Google Meet email sent');
    return { success: true, response };
  } catch (error) {
    console.error('❌ Google Meet email failed:', error);
    return { success: false, error: error.text || error.message };
  }
};


/**
 * 4. MARK COMPLETE EMAIL - When one user marks exchange complete
 * Other user receives this to also mark complete
 */
export const sendMarkCompleteEmail = async (fromUser, toUser) => {
  return sendEmail({
    to_email: toUser.email,
    to_name: toUser.fullName,
    reply_to: fromUser.email || 'noreply@swapnova.com',
    subject: `Confirm Skill Exchange`,
    message: `${fromUser.fullName} has marked skill exchange as complete!

To finalize the exchange and unlock your credits:
1. Log in to SwapNova
2. Go to Messages
3. Click "Mark Complete" button
4. Leave your feedback

⚠️ Important: Both users must mark as complete to earn credits.`
  });
};

/**
 * 5. EXCHANGE COMPLETED EMAIL - When BOTH users mark complete
 * Both users receive this email
 */
export const sendExchangeCompletedEmail = async (user, otherUserName) => {
  return sendEmail({
    to_email: user.email,
    to_name: user.fullName,
    subject: ' Exchange Completed Successfully!',
    message: `Congratulations! Your skill exchange with ${otherUserName} has been completed! 

✅ Credits have been added to your wallet
⭐ Don't forget to leave feedback for ${otherUserName}

Thanks for being part of SwapNova community.`
  });
};

/**
 * 6. FEEDBACK THANK YOU - After user submits feedback
 * User receives this email
 */
export const sendFeedbackThankYouEmail = async (user, otherUserName) => {
  return sendEmail({
    to_email: user.email,
    to_name: user.fullName,
    subject: 'Thanks for Your Feedback!',
    message: `Thank you for sharing your feedback about ${otherUserName}!
Your feedback helps us improve SwapNova for everyone.`
  });
};

/**
 * 7. FEEDBACK TO ADMIN - Copy of feedback sent to admin
 */
export const sendFeedbackToAdmin = async (user, otherUserName, feedbackData) => {
  return sendEmail({
    to_email: ADMIN_EMAIL,
    to_name: 'Admin',
    reply_to: user.email || 'noreply@swapnova.com',
    subject: `New Feedback received!`,
    message: `
From: ${user.fullName} (${user.email})
About: ${otherUserName}
Rating: ${feedbackData.rating || 'N/A'}/5
Comment: ${feedbackData.feedback || 'No comment'}
Date: ${new Date().toLocaleString()}`
  });
};

/**
 * 8. REPORT TO ADMIN - When user reports an issue
 */
export const sendReportToAdmin = async (user, reportedUser, reportData) => {
  return sendEmail({
    to_email: ADMIN_EMAIL,
    to_name: 'Admin',
    reply_to: user.email || 'noreply@swapnova.com',
    subject: `URGENT: New report received!`,
    message: `
 Reporter: ${user.fullName} (${user.email})
 Reported User: ${reportedUser?.fullName || 'Unknown'} (${reportedUser?.email || 'N/A'})
 Reason: ${reportData.reason || 'Not specified'}
Description: ${reportData.description || 'No description'}
Date: ${new Date().toLocaleString()}

⚠️ Action Required: Review and take action.`
  });
};

/**
 * 9. REPORT ACKNOWLEDGMENT - Sent to user who reported
 */
export const sendReportAcknowledgmentEmail = async (user, reportReason) => {
  return sendEmail({
    to_email: user.email,
    to_name: user.fullName,
    subject: 'Report Received',
    message: `
We've received your report and will investigate.

📋 Reason: ${reportReason || 'User Report'}
⏳ Status: Under Review
📅 Submitted: ${new Date().toLocaleDateString()}

We'll take action within 24-48 hours.

Thank you for keeping SwapNova safe!`
  });
};

/**
 * 10. REPORT RESOLVED EMAIL - Sent when admin marks report as resolved
 */
export const sendReportResolvedEmail = async (reporterEmail, reporterName, reportReason) => {
  return sendEmail({
    to_email: reporterEmail,
    to_name: reporterName,
    subject: 'Report Has Been Resolved',
    message: `Thank you for your report regarding "${reportReason}".

Our team has reviewed the issue and taken appropriate action. The matter has been resolved.
We appreciate your help in keeping SwapNova safe and positive.

If you have any concerns, please don't hesitate to contact us.`

  });
};