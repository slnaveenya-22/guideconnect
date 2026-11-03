const nodemailer = require('nodemailer');

// Setup Nodemailer transporter
// NOTE: If you don't have a real email set up in .env, it will just log to console.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

async function sendOtpEmail(to, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@guideconnect.com',
    to,
    subject: 'GuideConnect - Password Reset OTP',
    text: `Your password reset OTP is: ${otp}. It expires in 10 minutes.`,
  };

  try {
    if (process.env.EMAIL_USER) {
      await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
    } else {
      // Fallback for local dev without email setup
      console.log(`\n=========================================`);
      console.log(`📧 MOCK EMAIL TO: ${to}`);
      console.log(`🔑 OTP CODE: ${otp}`);
      console.log(`=========================================\n`);
    }
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send OTP email');
  }
}

module.exports = { sendOtpEmail };