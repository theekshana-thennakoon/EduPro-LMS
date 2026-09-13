// ============================================================
// Email Service with Real Delivery & Modern HTML OTP Template
// Supports Web3Forms, EmailJS, Resend, Supabase Auth & Local Store
// ============================================================

import { storage, STORAGE_KEYS } from './storageService';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const OTP_STORAGE_KEY = 'edupro_pending_otps';
const EMAIL_LOG_KEY = 'edupro_sent_emails';

/**
 * Generate a modern, attractive, and responsive HTML email template for OTP verification
 */
export const generateOtpEmailHtml = ({
  name = 'Scholar',
  email = '',
  otp = '123456',
  instituteName = 'EduPro Learning Academy',
  siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://edupro.academy',
  supportEmail = 'support@edupro.org',
  expiresInMinutes = 10
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Verification Code - ${instituteName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body {
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #1e293b;
    }
    table {
      border-collapse: collapse;
    }
    .email-container {
      max-width: 600px;
      margin: 32px auto;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 12px 36px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.03);
      border: 1px solid #e2e8f0;
    }
    .header-banner {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%);
      padding: 44px 32px 36px;
      text-align: center;
      position: relative;
    }
    .brand-logo-circle {
      display: inline-block;
      width: 58px;
      height: 58px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.35);
      line-height: 58px;
      text-align: center;
      margin-bottom: 14px;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }
    .brand-title {
      color: #ffffff;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin: 0 0 6px 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .brand-subtitle {
      color: rgba(255, 255, 255, 0.9);
      font-size: 13px;
      font-weight: 500;
      margin: 0;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .body-content {
      padding: 40px 36px 32px;
      text-align: left;
    }
    .welcome-badge {
      display: inline-block;
      background: #e0e7ff;
      color: #4338ca;
      font-size: 12px;
      font-weight: 700;
      padding: 5px 14px;
      border-radius: 30px;
      margin-bottom: 18px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .main-heading {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 14px;
      line-height: 1.3;
    }
    .lead-text {
      font-size: 15px;
      line-height: 1.6;
      color: #475569;
      margin: 0 0 28px;
    }
    .otp-card-wrapper {
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      border: 2px dashed #cbd5e1;
      border-radius: 16px;
      padding: 26px 20px;
      text-align: center;
      margin: 28px 0;
      position: relative;
    }
    .otp-label {
      font-size: 12px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }
    .otp-digits {
      font-family: 'Courier New', Courier, monospace, sans-serif;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 12px;
      color: #4f46e5;
      text-shadow: 0 2px 10px rgba(79, 70, 229, 0.2);
      margin: 0 0 12px;
      padding-left: 12px;
    }
    .otp-expiry {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #fef3c7;
      color: #92400e;
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid #fde68a;
    }
    .security-notice-box {
      background: #f0fdf4;
      border-left: 4px solid #10b981;
      padding: 14px 18px;
      border-radius: 0 10px 10px 0;
      margin: 24px 0;
    }
    .security-notice-text {
      font-size: 13px;
      color: #166534;
      line-height: 1.5;
      margin: 0;
    }
    .info-steps {
      margin: 24px 0 0;
      padding: 0;
      list-style: none;
    }
    .info-step-item {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 13.5px;
      color: #64748b;
      line-height: 1.5;
    }
    .step-number {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: #e0e7ff;
      color: #4f46e5;
      border-radius: 50%;
      text-align: center;
      line-height: 20px;
      font-size: 11px;
      font-weight: 800;
      margin-right: 10px;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .divider {
      height: 1px;
      background: #e2e8f0;
      margin: 32px 0 24px;
    }
    .footer {
      padding: 0 36px 36px;
      text-align: center;
      color: #94a3b8;
      font-size: 12px;
      line-height: 1.6;
    }
    .footer-links a {
      color: #6366f1;
      text-decoration: none;
      font-weight: 600;
      margin: 0 8px;
    }
    .footer-links a:hover {
      text-decoration: underline;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        margin: 12px auto;
        border-radius: 12px;
      }
      .header-banner {
        padding: 32px 20px 24px;
      }
      .body-content {
        padding: 28px 20px 20px;
      }
      .otp-digits {
        font-size: 30px;
        letter-spacing: 8px;
        padding-left: 8px;
      }
      .footer {
        padding: 0 20px 28px;
      }
    }
  </style>
</head>
<body>
  <div style="padding: 20px 10px;">
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
      <tr>
        <td align="center">
          <div class="email-container">
            <!-- Header Banner -->
            <div class="header-banner">
              <div class="brand-logo-circle">
                <span style="font-size: 28px; display: block; line-height: 58px;">🎓</span>
              </div>
              <h1 class="brand-title">${instituteName}</h1>
              <p class="brand-subtitle">Student Portal Verification</p>
            </div>

            <!-- Email Body Content -->
            <div class="body-content">
              <div class="welcome-badge">
                ✨ Account Verification
              </div>

              <h2 class="main-heading">Confirm your registration</h2>
              
              <p class="lead-text">
                Hello <strong>${name}</strong>,<br>
                Thank you for enrolling with <strong>${instituteName}</strong>. To complete your registration and activate your interactive student classroom, please verify your email address using the One-Time Password (OTP) below:
              </p>

              <!-- Highlighted OTP Display Card -->
              <div class="otp-card-wrapper">
                <div class="otp-label">Your 6-Digit Verification Code</div>
                <div class="otp-digits">${otp}</div>
                <div class="otp-expiry">
                  ⏱ Valid for ${expiresInMinutes} minutes
                </div>
              </div>

              <!-- Security Information -->
              <div class="security-notice-box">
                <p class="security-notice-text">
                  <strong>Security Note:</strong> Never share this OTP with anyone. Our instructors and staff will never ask for your verification code or account password.
                </p>
              </div>

              <!-- Next Steps List -->
              <ul class="info-steps">
                <li class="info-step-item">
                  <span class="step-number">1</span>
                  <span>Return to the open registration window in your browser.</span>
                </li>
                <li class="info-step-item">
                  <span class="step-number">2</span>
                  <span>Enter the 6-digit code shown above to finalize verification.</span>
                </li>
                <li class="info-step-item">
                  <span class="step-number">3</span>
                  <span>Your classroom lectures, quizzes, and resources will unlock instantly.</span>
                </li>
              </ul>

              <div class="divider"></div>

              <p style="font-size: 12.5px; color: #94a3b8; margin: 0; line-height: 1.5;">
                If you did not initiate this registration request on ${instituteName}, you can safely disregard this email. No account will be created without this verification code.
              </p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <div class="footer-links" style="margin-bottom: 12px;">
                <a href="${siteUrl}">Student Portal</a> &bull;
                <a href="mailto:${supportEmail}">Support & Helpdesk</a> &bull;
                <a href="${siteUrl}">Terms of Service</a>
              </div>
              <div>
                &copy; ${new Date().getFullYear()} ${instituteName}. All rights reserved.
              </div>
              <div style="font-size: 11px; margin-top: 6px; color: #cbd5e1;">
                Secured by 256-Bit SSL Academic Encryption
              </div>
            </div>
          </div>
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`;
};

/**
 * Dispatch real email through available email gateways
 */
const dispatchRealEmail = async ({ to, name, subject, otp, htmlContent, settings }) => {
  const emailConfig = settings?.emailConfig || {};
  let delivered = false;
  let deliveryMethod = 'Web3Forms Direct SMTP';
  let deliveryError = null;

  // 1. If EmailJS credentials are provided
  if (emailConfig.provider === 'emailjs' && emailConfig.emailjsServiceId && emailConfig.emailjsPublicKey) {
    try {
      deliveryMethod = 'EmailJS';
      const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: emailConfig.emailjsServiceId,
          template_id: emailConfig.emailjsTemplateId || 'template_default',
          user_id: emailConfig.emailjsPublicKey,
          template_params: {
            to_email: to,
            to_name: name,
            otp_code: otp,
            subject: subject,
            message: `Your verification code is: ${otp}`,
            html_content: htmlContent
          }
        })
      });
      if (res.ok) {
        delivered = true;
      } else {
        const errText = await res.text();
        console.warn('EmailJS delivery response:', errText);
      }
    } catch (err) {
      deliveryError = err.message;
      console.warn('EmailJS attempt failed:', err);
    }
  }

  // 2. If Resend API Key is provided
  if (!delivered && emailConfig.provider === 'resend' && emailConfig.resendApiKey) {
    try {
      deliveryMethod = 'Resend';
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${emailConfig.resendApiKey}`
        },
        body: JSON.stringify({
          from: emailConfig.fromEmail || 'EduPro Academy <onboarding@resend.dev>',
          to: [to],
          subject: subject,
          html: htmlContent
        })
      });
      if (res.ok) {
        delivered = true;
      }
    } catch (err) {
      deliveryError = err.message;
      console.warn('Resend attempt failed:', err);
    }
  }

  // 3. Web3Forms Public Direct Email Gateway
  if (!delivered) {
    try {
      deliveryMethod = 'Web3Forms Gateway';
      const apiKey = emailConfig.web3formsKey || '9d782c6a-1917-4c4e-970c-aa473f2ee202'; // Default active mail key
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          access_key: apiKey,
          subject: subject,
          from_name: settings?.siteName || 'EduPro Learning Academy',
          to_email: to,
          recipient: to,
          name: name,
          email: to,
          message: `Your One-Time Password (OTP) verification code is: ${otp}\n\nEnter this code on the registration page to activate your account. Valid for 10 minutes.`,
          html: htmlContent
        })
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          delivered = true;
        }
      }
    } catch (err) {
      deliveryError = err.message;
      console.warn('Web3Forms email delivery attempt:', err);
    }
  }

  // 4. Supabase Auth Email OTP attempt (if Supabase is configured)
  if (isSupabaseConfigured() && supabase) {
    try {
      await supabase.auth.signInWithOtp({
        email: to,
        options: {
          data: { name, otp_code: otp }
        }
      });
    } catch (sbErr) {
      console.warn('Supabase Auth OTP attempt notice:', sbErr);
    }
  }

  return {
    delivered,
    deliveryMethod,
    deliveryError
  };
};

/**
 * In-Memory & Storage OTP Store and Dispatcher
 */
export const emailService = {
  /**
   * Generate a random 6-digit numeric OTP code
   */
  generateOtpCode: () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Send an OTP verification email to the user
   */
  sendRegistrationOtp: async ({
    name,
    email,
    instituteName = 'EduPro Learning Academy'
  }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const code = emailService.generateOtpCode();
    const expiresInMinutes = 10;
    const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;

    // Save pending OTP record
    const pendingOtps = storage.get(OTP_STORAGE_KEY, {});
    pendingOtps[normalizedEmail] = {
      code,
      name,
      email: normalizedEmail,
      expiresAt,
      attempts: 0,
      createdAt: Date.now()
    };
    storage.set(OTP_STORAGE_KEY, pendingOtps);

    // Retrieve settings
    const settings = storage.get(STORAGE_KEYS.SETTINGS, {});

    // Generate HTML Email
    const htmlEmail = generateOtpEmailHtml({
      name,
      email: normalizedEmail,
      otp: code,
      instituteName,
      supportEmail: settings?.supportEmail || 'support@edupro.org',
      expiresInMinutes
    });

    const subject = `${code} is your ${instituteName} registration verification code`;

    // Attempt real email dispatch in background
    let deliveryInfo = { delivered: false, deliveryMethod: 'Local / Inbox Simulation' };
    try {
      deliveryInfo = await dispatchRealEmail({
        to: normalizedEmail,
        name,
        subject,
        otp: code,
        htmlContent: htmlEmail,
        settings
      });
    } catch (err) {
      console.warn('Real email dispatch exception:', err);
    }

    // Log sent email record for in-app inbox preview
    const sentEmails = storage.get(EMAIL_LOG_KEY, []);
    const emailRecord = {
      id: `email-${Date.now()}`,
      to: normalizedEmail,
      recipientName: name,
      subject: subject,
      otp: code,
      html: htmlEmail,
      deliveryMethod: deliveryInfo.deliveryMethod,
      isRealDelivered: deliveryInfo.delivered,
      sentAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString()
    };
    sentEmails.unshift(emailRecord);
    storage.set(EMAIL_LOG_KEY, sentEmails.slice(0, 25));

    // Dispatch a custom browser event so any active Email Preview Modal updates instantly
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('edupro:email_sent', {
          detail: emailRecord
        })
      );
    }

    console.info(`[EduPro Email Service] OTP ${code} sent to ${normalizedEmail} (Method: ${deliveryInfo.deliveryMethod})`);

    return {
      success: true,
      otp: code, // For demo/sandbox convenience
      expiresAt,
      deliveryInfo,
      emailRecord
    };
  },

  /**
   * Verify an entered OTP code
   */
  verifyOtp: (email, enteredCode) => {
    const normalizedEmail = email.trim().toLowerCase();
    const pendingOtps = storage.get(OTP_STORAGE_KEY, {});
    const record = pendingOtps[normalizedEmail];

    if (!record) {
      return {
        valid: false,
        error: 'No pending verification found for this email. Please request a new OTP.'
      };
    }

    if (Date.now() > record.expiresAt) {
      delete pendingOtps[normalizedEmail];
      storage.set(OTP_STORAGE_KEY, pendingOtps);
      return {
        valid: false,
        error: 'Verification code has expired. Please request a new code.'
      };
    }

    if (record.attempts >= 5) {
      delete pendingOtps[normalizedEmail];
      storage.set(OTP_STORAGE_KEY, pendingOtps);
      return {
        valid: false,
        error: 'Too many incorrect attempts. Please request a fresh code.'
      };
    }

    if (record.code.trim() !== enteredCode.trim()) {
      record.attempts = (record.attempts || 0) + 1;
      pendingOtps[normalizedEmail] = record;
      storage.set(OTP_STORAGE_KEY, pendingOtps);
      const remaining = 5 - record.attempts;
      return {
        valid: false,
        error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`
      };
    }

    // Success - consume and remove OTP
    delete pendingOtps[normalizedEmail];
    storage.set(OTP_STORAGE_KEY, pendingOtps);

    return {
      valid: true
    };
  },

  /**
   * Send a test email from Admin Site Settings
   */
  sendTestEmail: async (targetEmail, instituteName = 'EduPro Learning Academy') => {
    return await emailService.sendRegistrationOtp({
      name: 'Test Administrator',
      email: targetEmail,
      instituteName
    });
  },

  /**
   * Get the most recently dispatched email
   */
  getLatestSentEmail: (email = null) => {
    const sentEmails = storage.get(EMAIL_LOG_KEY, []);
    if (!email) return sentEmails[0] || null;
    return sentEmails.find((e) => e.to.toLowerCase() === email.toLowerCase()) || null;
  },

  /**
   * Get all sent emails log
   */
  getSentEmails: () => {
    return storage.get(EMAIL_LOG_KEY, []);
  }
};
