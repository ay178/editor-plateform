const https = require('https');

const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const data = JSON.stringify({
    personalizations: [{
      to: [{ email }],
      subject: 'Verify your EditHire account'
    }],
    from: { email: 'vermaprakhar44@gmail.com', name: 'EditHire' },
    content: [{
      type: 'text/html',
      value: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 32px; background: #0F0F1A; color: #F1F0FF; border-radius: 16px;">
          <h1 style="color: #7C3AED;">Edit<span style="color: #06B6D4">Hire</span></h1>
          <h2>Hi ${name}! 👋</h2>
          <p style="color: #9B9AB8; line-height: 1.6;">Thanks for signing up! Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verifyUrl}" style="background: #7C3AED; color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Verify Email →
            </a>
          </div>
          <p style="color: #5C5B7A; font-size: 13px;">This link expires in 24 hours.</p>
        </div>
      `
    }]
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

module.exports = { sendVerificationEmail };