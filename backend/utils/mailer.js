const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  family: 4,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  await transporter.sendMail({
    from: `"EditHire" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your EditHire account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; background: #0F0F1A; color: #F1F0FF; padding: 32px; border-radius: 16px;">
        <h1 style="color: #7C3AED;">Edit<span style="color: #06B6D4">Hire</span></h1>
        <h2>Hi ${name}! 👋</h2>
        <p style="color: #9B9AB8;">Please verify your email to activate your account.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background: #7C3AED; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
            Verify Email →
          </a>
        </div>
        <p style="color: #5C5B7A; font-size: 13px;">Link expires in 24 hours.</p>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail };