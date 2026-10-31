const nodemailer = require('nodemailer');

/**
 * Send an email using Nodemailer transporter
 *
 * @param {object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Subject line
 * @param {string} options.html - HTML body
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || '"ग्राम पंचायत सहरी पोर्टल" <no-reply@gramseva.in>';

  // If email credentials are not set in .env, simulate email dispatch in dev mode
  if (!user || !pass) {
    console.log('\n======================================================');
    console.log('📧 [sendEmail SIMULATION] EMAIL_USER / EMAIL_PASS not set in .env');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log('Body:');
    console.log(text || html);
    console.log('======================================================\n');
    return {
      messageId: `simulated-${Date.now()}`,
      simulated: true,
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const mailOptions = {
    from,
    to,
    subject,
    text: text || '',
    html,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`[sendEmail] Message sent successfully to ${to}: ${info.messageId}`);
  return info;
};

/**
 * Generate responsive HTML template for Admin Password Reset Email
 *
 * @param {object} data
 * @param {string} data.resetUrl - Full URL to frontend reset password page
 * @param {string} data.username - Admin username
 * @param {number} [data.expireMinutes=15] - Expiration window in minutes
 */
const generateResetPasswordEmailHtml = ({ resetUrl, username, expireMinutes = 15 }) => {
  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>पासवर्ड रीसेट अनुरोध | GramSeva</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #a7f3d0; }
    .content { padding: 32px 28px; }
    .salutation { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
    .message { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .btn-wrapper { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background: #047857; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 15px; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.3); }
    .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin: 24px 0; }
    .warning-title { font-weight: 700; color: #92400e; font-size: 13px; margin: 0 0 4px 0; }
    .warning-text { font-size: 12px; color: #b45309; margin: 0; }
    .link-fallback { font-size: 12px; color: #64748b; word-break: break-all; margin-top: 24px; }
    .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ग्राम पंचायत सहरी</h1>
      <p>GramSeva Administrative Control Portal</p>
    </div>
    <div class="content">
      <div class="salutation">नमस्ते, ${username || 'प्रशासक'}</div>
      <p class="message">
        आपके ग्राम पंचायत सहरी प्रशासन पोर्टल खाते के लिए पासवर्ड रीसेट करने का अनुरोध प्राप्त हुआ है।
        <br><br>
        नया पासवर्ड सेट करने के लिए नीचे दिए गए बटन पर क्लिक करें:
      </p>

      <div class="btn-wrapper">
        <a href="${resetUrl}" target="_blank" class="btn">
          🔐 पासवर्ड रीसेट करें (Reset Password)
        </a>
      </div>

      <div class="warning-box">
        <p class="warning-title">⚠️ महत्वपूर्ण सुरक्षा सूचना (Security Notice):</p>
        <p class="warning-text">
          • यह लिंक अगले <strong>${expireMinutes} मिनट</strong> तक ही मान्य है।<br>
          • यदि आपने यह अनुरोध नहीं किया था, तो कृपया इस ईमेल को तुरंत अनदेखा करें। आपका पुराना पासवर्ड पूरी तरह सुरक्षित है।
        </p>
      </div>

      <div class="link-fallback">
        यदि बटन काम नहीं कर रहा है, तो इस लिंक को अपने ब्राउज़र में कॉपी करके खोलें:<br>
        <a href="${resetUrl}" style="color: #047857;">${resetUrl}</a>
      </div>
    </div>
    <div class="footer">
      ग्राम पंचायत सहरी, राजस्थान • डिजिटल इंडिया मिशन द्वारा समर्थित<br>
      यह एक स्वचालित ईमेल है, कृपया इसका उत्तर न दें।
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = {
  sendEmail,
  generateResetPasswordEmailHtml,
};
