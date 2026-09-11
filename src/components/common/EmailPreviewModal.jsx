import React, { useState } from 'react';
import { Mail, X, Check, Copy, ExternalLink, Code, Eye, ShieldCheck, Sparkles } from 'lucide-react';
import { Modal } from './Modal';

export const EmailPreviewModal = ({ isOpen, onClose, emailRecord }) => {
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [viewMode, setViewMode] = useState('rendered'); // 'rendered' or 'html'

  if (!emailRecord) return null;

  const handleCopyOtp = () => {
    if (emailRecord?.otp) {
      navigator.clipboard.writeText(emailRecord.otp);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📧 Inbox Notification • Verification Email"
      size="lg"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Email Header Bar */}
        <div
          style={{
            background: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1.15rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}
        >
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Mail size={16} color="var(--primary)" /> {emailRecord.subject}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
              To: <strong>{emailRecord.to}</strong> &bull; Sent: {new Date(emailRecord.sentAt).toLocaleTimeString()}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {emailRecord.otp && (
              <button
                type="button"
                onClick={handleCopyOtp}
                className="btn btn-primary btn-sm"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
              >
                {copiedOtp ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedOtp ? 'OTP Copied!' : `Copy OTP: ${emailRecord.otp}`}</span>
              </button>
            )}

            <div style={{ display: 'inline-flex', background: 'var(--bg-secondary)', padding: '0.2rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setViewMode('rendered')}
                className={`btn btn-sm ${viewMode === 'rendered' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                <Eye size={12} /> Rendered
              </button>
              <button
                type="button"
                onClick={() => setViewMode('html')}
                className={`btn btn-sm ${viewMode === 'html' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              >
                <Code size={12} /> HTML
              </button>
            </div>
          </div>
        </div>

        {/* Email Preview Frame */}
        {viewMode === 'rendered' ? (
          <div
            style={{
              width: '100%',
              height: '520px',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
              background: '#f1f5f9'
            }}
          >
            <iframe
              srcDoc={emailRecord.html}
              title="Email Preview"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                background: '#f1f5f9',
                display: 'block'
              }}
              sandbox="allow-same-origin allow-scripts"
            />
          </div>
        ) : (
          <div style={{ position: 'relative' }}>
            <textarea
              readOnly
              value={emailRecord.html}
              style={{
                width: '100%',
                height: '520px',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                padding: '1rem',
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                resize: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ShieldCheck size={14} color="var(--success)" /> Email template built with responsive cross-client HTML compatibility
          </span>
          <button type="button" onClick={onClose} className="btn btn-secondary btn-sm">
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  );
};
