const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
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
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #7C3AED; font-size: 28px;">Edit<span style="color: #06B6D4">Hire</span></h1>
        </div>
        <h2 style="font-size: 22px; margin-bottom: 8px;">Hi ${name}! 👋</h2>
        <p style="color: #9B9AB8; line-height: 1.6;">Thanks for signing up! Please verify your email address to activate your account.</p>
        <div style="text-align: center; margin: 32px 0;">
          <a href="${verifyUrl}" style="background: #7C3AED; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Verify Email →
          </a>
        </div>
        <p style="color: #5C5B7A; font-size: 13px;">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>
    `
  });
};

module.exports = { sendVerificationEmail };
