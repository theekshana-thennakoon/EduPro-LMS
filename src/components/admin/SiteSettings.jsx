import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, RefreshCw, Sliders, Shield, Globe, CreditCard, Database, Trash2, Loader2, Mail, Send, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { initializeStorage, storage, STORAGE_KEYS, clearAllDemoData } from '../../services/storageService';
import { ImageUpload } from '../common/ImageUpload';
import { emailService } from '../../services/emailService';
import { EmailPreviewModal } from '../common/EmailPreviewModal';

export const SiteSettings = () => {
  const { settings, refreshAll, showToast } = useLms();

  const [siteName, setSiteName] = useState('');
  const [instituteTitle, setInstituteTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [address, setAddress] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('Rs.');
  const [accentColor, setAccentColor] = useState('#6366f1');
  const [allowSelfRegistration, setAllowSelfRegistration] = useState(true);

  // Payment settings
  const [gatewayProvider, setGatewayProvider] = useState('Stripe Secure Pay');
  const [publishableKey, setPublishableKey] = useState('');
  const [bankInstructions, setBankInstructions] = useState('');

  // Email delivery settings
  const [emailProvider, setEmailProvider] = useState('web3forms');
  const [web3formsKey, setWeb3formsKey] = useState('9d782c6a-1917-4c4e-970c-aa473f2ee202');
  const [resendApiKey, setResendApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [emailjsServiceId, setEmailjsServiceId] = useState('');
  const [emailjsTemplateId, setEmailjsTemplateId] = useState('');
  const [emailjsPublicKey, setEmailjsPublicKey] = useState('');

  // Test email state
  const [testEmailTarget, setTestEmailTarget] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState(null);
  const [previewEmailData, setPreviewEmailData] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Import JSON string
  const [importJson, setImportJson] = useState('');

  // Loading states
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingContact, setSavingContact] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setInstituteTitle(settings.instituteTitle || '');
      setTagline(settings.tagline || '');
      setLogoUrl(settings.logoUrl || '');
      setSupportEmail(settings.supportEmail || '');
      setSupportPhone(settings.supportPhone || '');
      setAddress(settings.address || '');
      setCurrencySymbol(settings.currencySymbol || 'Rs.');
      setAccentColor(settings.accentColor || '#6366f1');
      setAllowSelfRegistration(settings.allowSelfRegistration !== false);

      if (settings.paymentGateway) {
        setGatewayProvider(settings.paymentGateway.provider || 'Stripe Secure Pay');
        setPublishableKey(settings.paymentGateway.publishableKey || '');
        setBankInstructions(settings.paymentGateway.bankTransferInstructions || '');
      }

      if (settings.emailConfig) {
        setEmailProvider(settings.emailConfig.provider || 'web3forms');
        setWeb3formsKey(settings.emailConfig.web3formsKey || '9d782c6a-1917-4c4e-970c-aa473f2ee202');
        setResendApiKey(settings.emailConfig.resendApiKey || '');
        setFromEmail(settings.emailConfig.fromEmail || '');
        setEmailjsServiceId(settings.emailConfig.emailjsServiceId || '');
        setEmailjsTemplateId(settings.emailConfig.emailjsTemplateId || '');
        setEmailjsPublicKey(settings.emailConfig.emailjsPublicKey || '');
      }
    }
  }, [settings]);

  const saveSettingsPayload = async (setter) => {
    setter(true);
    try {
      await lmsService.updateSettings({
        siteName,
        instituteTitle,
        tagline,
        logoUrl,
        supportEmail,
        supportPhone,
        address,
        currencySymbol,
        accentColor,
        allowSelfRegistration,
        paymentGateway: {
          provider: gatewayProvider,
          testMode: true,
          publishableKey,
          bankTransferInstructions: bankInstructions
        },
        emailConfig: {
          provider: emailProvider,
          web3formsKey,
          resendApiKey,
          fromEmail,
          emailjsServiceId,
          emailjsTemplateId,
          emailjsPublicKey
        }
      });
      showToast('System configuration & site settings updated!', 'success');
      await refreshAll();
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setter(false);
    }
  };

  const handleSaveBranding = (e) => {
    e.preventDefault();
    saveSettingsPayload(setSavingBranding);
  };

  const handleSaveContact = (e) => {
    e.preventDefault();
    saveSettingsPayload(setSavingContact);
  };

  const handleSavePayment = (e) => {
    e.preventDefault();
    saveSettingsPayload(setSavingPayment);
  };

  const handleSaveEmail = (e) => {
    e.preventDefault();
    saveSettingsPayload(setSavingEmail);
  };

  const handleSendTestEmail = async (e) => {
    e.preventDefault();
    if (!testEmailTarget || !testEmailTarget.includes('@')) {
      showToast('Please enter a valid recipient email address', 'error');
      return;
    }

    setSendingTestEmail(true);
    setTestEmailResult(null);

    try {
      const result = await emailService.sendTestEmail(
        testEmailTarget,
        instituteTitle || siteName || 'EduPro Learning Academy'
      );
      setTestEmailResult({
        success: true,
        message: `OTP test email sent to ${testEmailTarget}!`,
        otp: result.otp,
        deliveryMethod: result.deliveryInfo?.deliveryMethod,
        isRealDelivered: result.deliveryInfo?.delivered,
        emailRecord: result.emailRecord
      });
      setPreviewEmailData(result.emailRecord);
      showToast(`Test OTP email dispatched! (Code: ${result.otp})`, 'success');
    } catch (err) {
      setTestEmailResult({
        success: false,
        message: `Failed to send test email: ${err.message}`
      });
      showToast(`Email test failed: ${err.message}`, 'error');
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleExportData = () => {
    try {
      const dataStr = lmsService.exportDatabaseJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `lms_cloud_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('LMS Database JSON exported! Ready for online server deployment.', 'success');
    } catch (err) {
      showToast('Export failed: ' + err.message, 'error');
    }
  };

  const handleImportData = async () => {
    if (!importJson.trim()) {
      showToast('Please paste a valid JSON string into the box', 'error');
      return;
    }
    setImporting(true);
    try {
      lmsService.importDatabaseJSON(importJson);
      showToast('Database imported successfully!', 'success');
      setImportJson('');
      await refreshAll();
    } catch (err) {
      showToast('Import failed: ' + err.message, 'error');
    } finally {
      setImporting(false);
    }
  };

  const handleResetFactoryDefaults = () => {
    if (!window.confirm('Reset all LMS data back to initial seed defaults? All custom changes will be overwritten.')) {
      return;
    }
    localStorage.clear();
    initializeStorage();
    refreshAll();
    showToast('Reset to factory demo database', 'info');
  };

  const handleClearAllDemoData = () => {
    if (!window.confirm('Delete all demo classes, lessons, subjects, grades, and demo students? (Your Admin Teacher account will NOT be deleted)')) {
      return;
    }
    clearAllDemoData();
    refreshAll();
    showToast('All demo data removed! Clean academy slate ready.', 'success');
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Site Settings & Administration</h1>
        <p>Configure academy identity, contact channels, fee payment gateways, and cloud server data exports.</p>
      </div>

      <div className="split-layout-grid" style={{ marginBottom: '2rem' }}>
        {/* General & Branding */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Globe size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Academy Branding</h3>
          </div>

          <form onSubmit={handleSaveBranding}>
            <div className="form-group">
              <label className="form-label">Site / LMS Name</label>
              <input
                type="text"
                className="form-control"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Institute Title</label>
              <input
                type="text"
                className="form-control"
                value={instituteTitle}
                onChange={(e) => setInstituteTitle(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input
                type="text"
                className="form-control"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
              />
            </div>

            <div className="form-group">
              <ImageUpload
                value={logoUrl}
                onChange={setLogoUrl}
                label="Academy Brand Logo / Icon"
                aspectRatio="1/1"
                presets={[
                  'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80'
                ]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Theme Primary Accent Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem' }}>{accentColor}</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={savingBranding}>
              {savingBranding ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Branding...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> Save Branding
                </>
              )}
            </button>
          </form>
        </div>

        {/* Contact & Registration Policy */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <Sliders size={20} color="var(--accent)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Contact & Admissions</h3>
          </div>

          <form onSubmit={handleSaveContact}>
            <div className="form-group">
              <label className="form-label">Academic Support Email</label>
              <input
                type="email"
                className="form-control"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Support Phone</label>
              <input
                type="text"
                className="form-control"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Physical Address</label>
              <input
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={allowSelfRegistration}
                  onChange={(e) => setAllowSelfRegistration(e.target.checked)}
                />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Allow New Students to Self-Register</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={savingContact}>
              {savingContact ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Contact Info...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> Save Contact Info
                </>
              )}
            </button>
          </form>
        </div>

        {/* Payment Gateway Settings */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
            <CreditCard size={20} color="var(--success)" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Payment & Billing Settings</h3>
          </div>

          <form onSubmit={handleSavePayment}>
            <div className="form-group">
              <label className="form-label">Default Currency Symbol</label>
              <input
                type="text"
                className="form-control"
                value={currencySymbol}
                onChange={(e) => setCurrencySymbol(e.target.value)}
                placeholder="e.g. $, LKR, €, £"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Gateway Provider</label>
              <select
                className="form-control"
                value={gatewayProvider}
                onChange={(e) => setGatewayProvider(e.target.value)}
              >
                <option value="Stripe Secure Pay">Stripe Secure Pay (Demo/Live)</option>
                <option value="PayPal Express">PayPal Express</option>
                <option value="Direct Bank Wire">Direct Bank Wire / Manual</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">API Publishable Key (Demo or Live)</label>
              <input
                type="text"
                className="form-control"
                value={publishableKey}
                onChange={(e) => setPublishableKey(e.target.value)}
                placeholder="pk_test_..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Bank Transfer Instructions</label>
              <textarea
                className="form-control"
                value={bankInstructions}
                onChange={(e) => setBankInstructions(e.target.value)}
                placeholder="Account number, branch details, or payment instructions..."
                style={{ minHeight: '70px' }}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={savingPayment}>
              {savingPayment ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Payment Config...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> Save Payment Config
                </>
              )}
            </button>
          </form>
        </div>

        {/* Email & OTP Delivery Gateway Configuration */}
        <div className="glass-card" style={{ padding: '1.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mail size={20} color="var(--primary)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Email & OTP Delivery Service</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>Configure live email dispatch to real recipient inboxes</p>
              </div>
            </div>
            <span className="badge badge-primary" style={{ textTransform: 'uppercase', fontSize: '0.7rem' }}>
              {emailProvider}
            </span>
          </div>

          <form onSubmit={handleSaveEmail}>
            <div className="form-group">
              <label className="form-label">Email Gateway Provider</label>
              <select
                className="form-control"
                value={emailProvider}
                onChange={(e) => setEmailProvider(e.target.value)}
              >
                <option value="web3forms">Web3Forms Direct Gateway (Recommended / Instant / Free)</option>
                <option value="resend">Resend API (Production Custom Domain)</option>
                <option value="emailjs">EmailJS Client Gateway</option>
                <option value="supabase">Supabase Auth OTP Mailer</option>
              </select>
            </div>

            {emailProvider === 'web3forms' && (
              <div className="form-group">
                <label className="form-label">Web3Forms Access Key</label>
                <input
                  type="text"
                  className="form-control"
                  value={web3formsKey}
                  onChange={(e) => setWeb3formsKey(e.target.value)}
                  placeholder="e.g. 9d782c6a-1917-4c4e-970c-aa473f2ee202"
                />
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                  A default active key is provided. Or create a free dedicated access key instantly at <a href="https://web3forms.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>web3forms.com</a>.
                </div>
              </div>
            )}

            {emailProvider === 'resend' && (
              <>
                <div className="form-group">
                  <label className="form-label">Resend API Key</label>
                  <input
                    type="password"
                    className="form-control"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxx"
                  />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                    Get your API key at <a href="https://resend.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>resend.com</a>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">From / Sender Address</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="EduPro Academy <onboarding@yourdomain.com>"
                  />
                </div>
              </>
            )}

            {emailProvider === 'emailjs' && (
              <>
                <div className="form-group">
                  <label className="form-label">EmailJS Service ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emailjsServiceId}
                    onChange={(e) => setEmailjsServiceId(e.target.value)}
                    placeholder="service_xxxx"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EmailJS Template ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emailjsTemplateId}
                    onChange={(e) => setEmailjsTemplateId(e.target.value)}
                    placeholder="template_xxxx"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EmailJS Public Key</label>
                  <input
                    type="text"
                    className="form-control"
                    value={emailjsPublicKey}
                    onChange={(e) => setEmailjsPublicKey(e.target.value)}
                    placeholder="public_xxxx"
                  />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={savingEmail}>
              {savingEmail ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving Email Config...</span>
                </>
              ) : (
                <>
                  <Save size={16} /> Save Email Gateway Config
                </>
              )}
            </button>
          </form>

          {/* Interactive Test Email Tool */}
          <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send size={15} color="var(--primary)" /> Send Live Test OTP Email
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <input
                type="email"
                className="form-control"
                placeholder="Enter your personal email (e.g. gmail.com)..."
                value={testEmailTarget}
                onChange={(e) => setTestEmailTarget(e.target.value)}
                style={{ flex: 1, minWidth: '200px' }}
              />
              <button
                type="button"
                onClick={handleSendTestEmail}
                className="btn btn-primary btn-sm"
                disabled={sendingTestEmail}
                style={{ whiteSpace: 'nowrap' }}
              >
                {sendingTestEmail ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Test Email
                  </>
                )}
              </button>
            </div>

            {testEmailResult && (
              <div style={{
                marginTop: '0.85rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                background: testEmailResult.success ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${testEmailResult.success ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                fontSize: '0.8rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: testEmailResult.success ? 'var(--success)' : 'var(--danger)' }}>
                    {testEmailResult.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{testEmailResult.message}</span>
                  </div>
                  {testEmailResult.success && (
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(true)}
                      className="btn btn-secondary btn-sm"
                      style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                    >
                      <Eye size={12} /> Preview HTML Template
                    </button>
                  )}
                </div>
                {testEmailResult.success && (
                  <div style={{ marginTop: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    Gateway: <strong>{testEmailResult.deliveryMethod}</strong> | Test OTP: <code style={{ color: 'var(--primary)', fontWeight: 700 }}>{testEmailResult.otp}</code>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Supabase Cloud Database Integration Status */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Database size={22} color="var(--success)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Supabase Cloud Database Integration</h3>
              <p style={{ fontSize: '0.85rem' }}>
                PostgreSQL cloud database for real-time synchronization across all student & teacher devices.
              </p>
            </div>
          </div>

          <div>
            {import.meta.env.VITE_SUPABASE_URL && !import.meta.env.VITE_SUPABASE_URL.includes('your-project') ? (
              <span className="badge badge-success" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                🟢 Connected to Supabase Cloud
              </span>
            ) : (
              <span className="badge badge-outline" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                ⚡ Fast LocalStorage Mode (Ready to Link Cloud)
              </span>
            )}
          </div>
        </div>

        <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Quick Setup Instructions:
          </div>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: 'var(--text-secondary)' }}>
            <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>supabase.com</a></li>
            <li>In Supabase Dashboard &rarr; <strong>SQL Editor</strong> &rarr; Run the provided script from <code>supabase_schema.sql</code></li>
            <li>In your <code>.env</code> file (or Vercel Project Environment Variables), set:
              <div style={{ background: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontFamily: 'monospace', fontSize: '0.8rem', marginTop: '0.35rem' }}>
                VITE_SUPABASE_URL=https://your-project.supabase.co<br />
                VITE_SUPABASE_ANON_KEY=your-anon-public-key
              </div>
            </li>
          </ol>
        </div>
      </div>

      {/* Online Server & JSON Backup Section */}
      <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <Shield size={24} color="var(--primary)" />
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Complete JSON Database Backup & Migration</h3>
            <p style={{ fontSize: '0.85rem' }}>
              Export or import your entire LMS database (subjects, classes, lessons, quizzes, notes, students, invoices) as standardized JSON.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', margin: '1.5rem 0' }}>
          <button onClick={handleExportData} className="btn btn-primary">
            <Download size={16} /> Export Complete JSON Database
          </button>

          <button onClick={handleClearAllDemoData} className="btn btn-danger">
            <Trash2 size={16} /> Clear All Demo Data (Keep Admin Only)
          </button>

          <button onClick={handleResetFactoryDefaults} className="btn btn-secondary">
            <RefreshCw size={16} /> Reset to Demo Factory Defaults
          </button>
        </div>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <label className="form-label" style={{ marginBottom: '0.5rem', display: 'block' }}>
            Import / Restore JSON Database
          </label>
          <textarea
            className="form-control"
            rows={3}
            placeholder="Paste exported LMS JSON database here to restore..."
            value={importJson}
            onChange={(e) => setImportJson(e.target.value)}
            style={{ marginBottom: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}
          />
          <button onClick={handleImportData} className="btn btn-secondary btn-sm" disabled={importing}>
            {importing ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Importing & Synchronizing...</span>
              </>
            ) : (
              <>
                <Upload size={14} /> Import & Synchronize Database
              </>
            )}
          </button>
        </div>
      </div>

      {showPreviewModal && (
        <EmailPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          emailData={previewEmailData}
        />
      )}
    </div>
  );
};
