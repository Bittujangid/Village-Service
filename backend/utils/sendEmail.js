const nodemailer = require('nodemailer');

/**
 * Strip HTML tags and decode basic HTML entities to create a clean plain-text fallback.
 *
 * @param {string} htmlStr - HTML string to convert
 * @returns {string} Clean plain text
 */
const stripHtml = (htmlStr) => {
  if (!htmlStr) return '';
  return htmlStr
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|tr|h[1-6]|li)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&mdash;/gi, '—')
    .replace(/&ndash;/gi, '–')
    .replace(/&bull;/gi, '•')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
};

/**
 * Send an email via Brevo HTTP API (preferred) or Nodemailer SMTP (fallback).
 *
 * Priority:
 *   1. BREVO_API_KEY present  → Brevo transactional API (no SMTP port needed)
 *   2. EMAIL_USER + EMAIL_PASS present → Nodemailer SMTP
 *   3. Neither               → dev-mode console simulation
 *
 * @param {object} options
 * @param {string} options.to      - Recipient email address
 * @param {string} options.subject - Subject line
 * @param {string} options.html    - HTML body
 * @param {string} [options.text]  - Plain-text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const brevoKey = process.env.BREVO_API_KEY;
  const user     = process.env.EMAIL_USER;
  const pass     = process.env.EMAIL_PASS;

  // ── 1. Brevo HTTP API (works on Render free tier) ───────────────────────────
  if (brevoKey) {
    const senderName   = process.env.EMAIL_SENDER_NAME || 'Citizen Portal';
    const senderEmail  = user || 'no-reply@gramseva.in';
    const replyToEmail = process.env.EMAIL_USER || senderEmail;
    const textContent  = (text && text.trim()) ? text.trim() : stripHtml(html);

    const payload = {
      sender:      { name: senderName, email: senderEmail },
      replyTo:     { email: replyToEmail, name: senderName },
      to:          [{ email: to }],
      subject,
      htmlContent: html,
      textContent,
    };

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key':      brevoKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`[sendEmail] Brevo API error ${response.status}: ${errBody}`);
    }

    const data = await response.json();
    console.log(`[sendEmail] Brevo: message sent to ${to} — messageId: ${data.messageId}`);
    return { messageId: data.messageId, provider: 'brevo' };
  }

  // ── 2. Nodemailer SMTP fallback ──────────────────────────────────────────────
  if (user && pass) {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
    const from = process.env.EMAIL_FROM || '"ग्राम पंचायत सहरी पोर्टल" <no-reply@gramseva.in>';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({ from, to, subject, text: text || '', html });
    console.log(`[sendEmail] SMTP: message sent to ${to} — messageId: ${info.messageId}`);
    return info;
  }

  // ── 3. Dev simulation (no credentials configured) ───────────────────────────
  console.log('\n======================================================');
  console.log('📧 [sendEmail SIMULATION] No BREVO_API_KEY or EMAIL_USER/PASS set in .env');
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log('Body:');
  console.log(text || html);
  console.log('======================================================\n');
  return { messageId: `simulated-${Date.now()}`, simulated: true };
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

/**
 * Generate responsive HTML template for Complaint Resolution Email (Bilingual)
 *
 * @param {object} data
 * @param {string} data.citizenName - Citizen's full name
 * @param {string} data.trackingId  - Complaint tracking ID
 * @param {string} data.category    - Complaint category
 * @param {number} data.wardNumber  - Ward number
 * @param {string} [data.adminRemarks] - Admin remarks / resolution note
 * @param {Date|string} [data.resolvedAt] - Resolution timestamp
 */
const generateResolutionEmailHtml = ({ citizenName, trackingId, category, wardNumber, adminRemarks, resolvedAt }) => {
  const dateStr = resolvedAt
    ? new Date(resolvedAt).toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  return `
<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>शिकायत निस्तारण सूचना | ग्राम पंचायत सहरी</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #1e293b; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); padding: 32px 24px; text-align: center; color: #fff; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
    .header p { margin: 6px 0 0 0; font-size: 13px; color: #bfdbfe; }
    .content { padding: 28px; }
    .badge { display: inline-block; background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; border-radius: 20px; padding: 6px 16px; font-weight: 700; font-size: 14px; margin-bottom: 20px; }
    .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .details-table td { padding: 10px 12px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .details-table td:first-child { font-weight: 600; color: #64748b; width: 40%; }
    .tracking-id { font-size: 22px; font-weight: 900; color: #1d4ed8; letter-spacing: 2px; font-family: monospace; }
    .remarks-box { background: #f8fafc; border-left: 4px solid #22c55e; border-radius: 8px; padding: 14px 16px; margin: 20px 0; font-size: 13px; color: #374151; }
    .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>&#x0917;&#x094d;&#x0930;&#x093e;&#x092e; &#x092a;&#x0902;&#x091a;&#x093e;&#x092f;&#x0924; &#x0938;&#x0939;&#x0930;&#x0940;</h1>
      <p>Citizen Portal &mdash; Grievance Status Update</p>
    </div>
    <div class="content">
      <p style="font-size:15px;font-weight:600;">&#x0928;&#x092e;&#x0938;&#x094d;&#x0924;&#x0947;, ${citizenName || 'नागरिक'},</p>
      <p style="font-size:14px;color:#475569;line-height:1.6;">&#x0906;&#x092a;&#x0915;&#x0940; &#x0936;&#x093f;&#x0915;&#x093e;&#x092f;&#x0924; &#x0915;&#x093e; &#x0938;&#x092b;&#x0932;&#x0924;&#x093e;&#x092a;&#x0942;&#x0930;&#x094d;&#x0935;&#x0915; &#x0928;&#x093f;&#x0938;&#x094d;&#x0924;&#x093e;&#x0930;&#x0923; &#x0915;&#x0930; &#x0926;&#x093f;&#x092f;&#x093e; &#x0917;&#x092f;&#x093e; &#x0939;&#x0948;&#x0964; (Your complaint has been successfully resolved.)</p>
      <div style="text-align:center;margin:16px 0;">
        <span class="badge">&#x2705; &#x0928;&#x093f;&#x0938;&#x094d;&#x0924;&#x093e;&#x0930;&#x093f;&#x0924; (Resolved)</span>
      </div>
      <table class="details-table">
        <tr><td>&#x091f;&#x094d;&#x0930;&#x0948;&#x0915;&#x093f;&#x0902;&#x0917; &#x0906;&#x0908;&#x0921;&#x0940;</td><td><span class="tracking-id">#${trackingId}</span></td></tr>
        <tr><td>&#x0936;&#x094d;&#x0930;&#x0947;&#x0923;&#x0940; (Category)</td><td>${category || '&mdash;'}</td></tr>
        <tr><td>&#x0935;&#x093e;&#x0930;&#x094d;&#x0921; &#x0928;&#x0902;&#x092c;&#x0930; (Ward)</td><td>&#x0935;&#x093e;&#x0930;&#x094d;&#x0921; ${wardNumber}</td></tr>
        <tr><td>&#x0928;&#x093f;&#x0938;&#x094d;&#x0924;&#x093e;&#x0930;&#x0923; &#x0926;&#x093f;&#x0928;&#x093e;&#x0902;&#x0915;</td><td>${dateStr}</td></tr>
      </table>
      ${adminRemarks ? `<div class="remarks-box"><strong>&#x092a;&#x094d;&#x0930;&#x0936;&#x093e;&#x0938;&#x0928;&#x093f;&#x0915; &#x091f;&#x093f;&#x092a;&#x094d;&#x092a;&#x0923;&#x0940; (Admin Remarks):</strong><br>${adminRemarks}</div>` : ''}
      <p style="font-size:13px;color:#64748b;">&#x092f;&#x0926;&#x093f; &#x0906;&#x092a;&#x0915;&#x094b; &#x0915;&#x094b;&#x0908; &#x0905;&#x0928;&#x094d;&#x092f; &#x0938;&#x092e;&#x0938;&#x094d;&#x092f;&#x093e; &#x0939;&#x094b;, &#x0924;&#x094b; &#x0917;&#x094d;&#x0930;&#x093e;&#x092e; &#x092a;&#x0902;&#x091a;&#x093e;&#x092f;&#x0924; &#x092a;&#x094b;&#x0930;&#x094d;&#x091f;&#x0932; &#x092a;&#x0930; &#x0928;&#x0908; &#x0936;&#x093f;&#x0915;&#x093e;&#x092f;&#x0924; &#x0926;&#x0930;&#x094d;&#x091c; &#x0915;&#x0930;&#x0947;&#x0902;&#x0964;</p>
    </div>
    <div class="footer">
      &#x0917;&#x094d;&#x0930;&#x093e;&#x092e; &#x092a;&#x0902;&#x091a;&#x093e;&#x092f;&#x0924; &#x0938;&#x0939;&#x0930;&#x0940;, &#x0930;&#x093e;&#x091c;&#x0938;&#x094d;&#x0925;&#x093e;&#x0928; &bull; &#x0921;&#x093f;&#x091c;&#x093f;&#x091f;&#x0932; &#x0907;&#x0902;&#x0921;&#x093f;&#x092f;&#x093e; &#x092e;&#x093f;&#x0936;&#x0928;<br>
      &#x092f;&#x0939; &#x090f;&#x0915; &#x0938;&#x094d;&#x0935;&#x091a;&#x093e;&#x0932;&#x093f;&#x0924; &#x0908;&#x092e;&#x0947;&#x0932; &#x0939;&#x0948;, &#x0915;&#x0943;&#x092a;&#x092f;&#x093e; &#x0907;&#x0938;&#x0915;&#x093e; &#x0909;&#x0924;&#x094d;&#x0924;&#x0930; &#x0928; &#x0926;&#x0947;&#x0902;&#x0964;
    </div>
  </div>
</body>
</html>
  `;
};


module.exports = {
  sendEmail,
  generateResetPasswordEmailHtml,
  generateResolutionEmailHtml,
};
