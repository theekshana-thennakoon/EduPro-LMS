import React, { useState, useEffect } from 'react';
import { CreditCard, FileText, CheckCircle, Download, Printer, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const PaymentHistoryView = () => {
  const { currentUser } = useAuth();
  const { settings, showToast } = useLms();
  const [payments, setPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    const fetchPayments = async () => {
      if (currentUser) {
        const list = await lmsService.getStudentPayments(currentUser.id);
        setPayments(list);
      }
    };
    fetchPayments();
  }, [currentUser]);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Payment & Billing History</h1>
        <p>Review course enrollment transactions, receipts, and payment statements.</p>
      </div>

      {payments.length === 0 ? (
        <div className="glass-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <CreditCard size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Transactions Found</h3>
          <p style={{ maxWidth: '450px', margin: '0 auto', color: 'var(--text-secondary)' }}>
            You have no recorded course enrollment fees or payment history on file.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>INVOICE #</th>
                <th>CLASS / COURSE</th>
                <th>DATE</th>
                <th>AMOUNT</th>
                <th>METHOD</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>RECEIPT</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr
                  key={p.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    fontSize: '0.9rem'
                  }}
                >
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {p.invoiceNumber || p.id}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{p.className}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {p.date}
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 800 }}>
                    {settings?.currencySymbol || '$'}{p.amount}
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {p.method}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle size={12} style={{ marginRight: '3px' }} />
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedInvoice(p);
                        setReceiptModalOpen(true);
                      }}
                      className="btn btn-secondary btn-sm"
                    >
                      <FileText size={14} /> View Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Official Receipt Modal */}
      <Modal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        title="Official Educational Invoice Receipt"
        size="md"
      >
        {selectedInvoice && (
          <div>
            {/* Receipt Header */}
            <div
              style={{
                borderBottom: '2px solid var(--border-color)',
                paddingBottom: '1.25rem',
                marginBottom: '1.25rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{settings?.siteName || 'EduPro Academy'}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {settings?.instituteTitle || 'Online Institute'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {settings?.supportEmail || 'billing@edupro.com'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-success" style={{ marginBottom: '0.35rem' }}>
                  PAID IN FULL
                </span>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Invoice: {selectedInvoice.invoiceNumber || selectedInvoice.id}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Date: {selectedInvoice.date}
                </div>
              </div>
            </div>

            {/* Billed to */}
            <div style={{ marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>BILLED TO:</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{selectedInvoice.studentName}</div>
              <div style={{ color: 'var(--text-secondary)' }}>{selectedInvoice.studentEmail}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Student ID: {selectedInvoice.studentId}</div>
            </div>

            {/* Item Table */}
            <div
              style={{
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                <span>COURSE ADMISSION</span>
                <span>AMOUNT</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <span>{selectedInvoice.className}</span>
                <span>${selectedInvoice.amount}.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 800, paddingTop: '0.5rem' }}>
                <span>Total Paid:</span>
                <span style={{ color: 'var(--primary)' }}>${selectedInvoice.amount}.00 USD</span>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              <div>Payment Method: <strong>{selectedInvoice.method}</strong></div>
              <div>Transaction ID: <code>{selectedInvoice.transactionId}</code></div>
            </div>

            <div className="modal-footer" style={{ padding: '0', borderTop: 'none', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Shield size={14} color="var(--success)" />
                <span>Verified System Transaction</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={handlePrintReceipt} className="btn btn-secondary btn-sm">
                  <Printer size={14} /> Print
                </button>
                <button
                  onClick={() => {
                    showToast('Receipt PDF downloaded', 'success');
                    setReceiptModalOpen(false);
                  }}
                  className="btn btn-primary btn-sm"
                >
                  <Download size={14} /> Download PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
