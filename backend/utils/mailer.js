const https = require('https');

const sendEmail = (email, subject, html) => {
  const data = JSON.stringify({
    personalizations: [{
      to: [{ email }],
      subject
    }],
    from: { email: 'vermaprakhar44@gmail.com', name: 'EditHire' },
    content: [{ type: 'text/html', value: html }]
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.sendgrid.com',
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        resolve({ success: true });
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => reject(new Error(`SendGrid error: ${res.statusCode} - ${body}`)));
      }
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('SendGrid request timeout'));
    });

    req.write(data);
    req.end();
  });
};

// ── OTP email for signup verification ──
const sendOTPEmail = async (email, name, otp) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0F0F1A; color: #F1F0FF; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7C3AED; font-size: 28px;">Edit<span style="color: #06B6D4">Hire</span></h1>
      </div>
      <h2 style="font-size: 22px; margin-bottom: 8px;">Hi ${name}!</h2>
      <p style="color: #9B9AB8; line-height: 1.6;">Use the code below to verify your email and activate your EditHire account.</p>
      <div style="text-align: center; margin: 32px 0;">
        <div style="display: inline-block; background: rgba(124,58,237,0.15); border: 1px solid #7C3AED; border-radius: 12px; padding: 18px 36px;">
          <span style="font-size: 36px; font-weight: 700; letter-spacing: 10px; color: #F1F0FF;">${otp}</span>
        </div>
      </div>
      <p style="color: #5C5B7A; font-size: 13px; text-align: center;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
  `;
  return sendEmail(email, `${otp} is your EditHire verification code`, html);
};

const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0F0F1A; color: #F1F0FF; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #7C3AED; font-size: 28px;">Edit<span style="color: #06B6D4">Hire</span></h1>
      </div>
      <h2 style="font-size: 22px; margin-bottom: 8px;">Hi ${name},</h2>
      <p style="color: #9B9AB8; line-height: 1.6;">We received a request to reset your EditHire password. Click the button below to choose a new one.</p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background: #7C3AED; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
          Reset Password →
        </a>
      </div>
      <p style="color: #5C5B7A; font-size: 13px;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email — your password will stay the same.</p>
    </div>
  `;

  return sendEmail(email, 'Reset your EditHire password', html);
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };