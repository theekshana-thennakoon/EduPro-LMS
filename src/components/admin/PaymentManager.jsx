import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  Filter,
  Download,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit,
  FileText,
  Printer,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  User,
  BookOpen
} from 'lucide-react';
import { useLms } from '../../context/LmsContext';
import { lmsService } from '../../services/lmsService';
import { Modal } from '../common/Modal';

export const PaymentManager = () => {
  const { payments, classes, refreshAll, showToast, settings } = useLms();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [classFilter, setClassFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState(false);

  const [activePayment, setActivePayment] = useState(null);

  // Manual payment form state
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualStudentEmail, setManualStudentEmail] = useState('');
  const [manualClassId, setManualClassId] = useState(classes[0]?.id || '');
  const [manualAmount, setManualAmount] = useState(classes[0]?.fee || 0);
  const [manualMethod, setManualMethod] = useState('Direct Bank Transfer');
  const [manualStatus, setManualStatus] = useState('Completed');
  const [manualNotes, setManualNotes] = useState('');
  const [manualTxnId, setManualTxnId] = useState('');

  // Status edit state
  const [editStatus, setEditStatus] = useState('Completed');
  const [editNotes, setEditNotes] = useState('');

  // When class selection changes in manual modal, auto-fill fee
  const handleClassChange = (cId) => {
    setManualClassId(cId);
    const cls = classes.find((c) => c.id === cId);
    if (cls) {
      setManualAmount(cls.fee || 0);
    }
  };

  // Filtered & Sorted Payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Status filter
        if (statusFilter !== 'All' && p.status !== statusFilter) return false;
        // Class filter
        if (classFilter !== 'All' && p.classId !== classFilter) return false;
        // Method filter
        if (methodFilter !== 'All' && !p.method?.toLowerCase().includes(methodFilter.toLowerCase())) return false;
        // Search query
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchStudent = p.studentName?.toLowerCase().includes(q);
          const matchEmail = p.studentEmail?.toLowerCase().includes(q);
          const matchInvoice = p.invoiceNumber?.toLowerCase().includes(q);
          const matchTxn = p.transactionId?.toLowerCase().includes(q);
          const matchClass = p.className?.toLowerCase().includes(q);
          return matchStudent || matchEmail || matchInvoice || matchTxn || matchClass;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.date || 0) - new Date(a.date || 0);
        if (sortBy === 'oldest') return new Date(a.date || 0) - new Date(b.date || 0);
        if (sortBy === 'amount-desc') return (b.amount || 0) - (a.amount || 0);
        if (sortBy === 'amount-asc') return (a.amount || 0) - (b.amount || 0);
        return 0;
      });
  }, [payments, statusFilter, classFilter, methodFilter, searchTerm, sortBy]);

  // Financial Stats
  const stats = useMemo(() => {
    const totalRev = payments
      .filter((p) => p.status === 'Completed')
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingAmount = payments
      .filter((p) => p.status === 'Pending')
      .reduce((acc, p) => acc + (p.amount || 0), 0);
    const completedCount = payments.filter((p) => p.status === 'Completed').length;
    const pendingCount = payments.filter((p) => p.status === 'Pending').length;
    const refundedCount = payments.filter((p) => p.status === 'Refunded').length;

    return {
      totalRevenue: totalRev,
      pendingAmount,
      completedCount,
      pendingCount,
      refundedCount,
      totalCount: payments.length
    };
  }, [payments]);

  // Handle Manual Payment Submit
  const handleRecordManualPayment = async (e) => {
    e.preventDefault();
    if (!manualStudentName.trim() || !manualStudentEmail.trim()) {
      showToast('Student name and email are required', 'error');
      return;
    }
    const selectedClass = classes.find((c) => c.id === manualClassId);

    try {
      await lmsService.recordManualPayment({
        studentId: `student-${Date.now()}`,
        studentName: manualStudentName.trim(),
        studentEmail: manualStudentEmail.trim(),
        classId: manualClassId,
        className: selectedClass ? selectedClass.title : 'General Academic Course',
        amount: Number(manualAmount) || 0,
        currencySymbol: settings?.currencySymbol || '$',
        method: manualMethod,
        status: manualStatus,
        adminNotes: manualNotes.trim(),
        transactionId: manualTxnId.trim() || undefined
      });

      showToast('Offline payment transaction recorded successfully!', 'success');
      setCreateModalOpen(false);
      setManualStudentName('');
      setManualStudentEmail('');
      setManualNotes('');
      setManualTxnId('');
      await refreshAll();
    } catch (err) {
      showToast('Failed to record payment: ' + err.message, 'error');
    }
  };

  // Handle Status Update
  const handleUpdateStatusSubmit = async (e) => {
    e.preventDefault();
    if (!activePayment) return;

    try {
      await lmsService.updatePaymentStatus(activePayment.id, editStatus, editNotes);
      showToast(`Payment status updated to ${editStatus}!`, 'success');
      setStatusModalOpen(false);
      setActivePayment(null);
      await refreshAll();
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  // Handle Delete Payment
  const handleDeletePayment = async (paymentId, invoiceNo) => {
    if (!window.confirm(`Are you sure you want to delete payment record ${invoiceNo || paymentId}?`)) {
      return;
    }
    try {
      await lmsService.deletePayment(paymentId);
      showToast('Payment record deleted', 'info');
      await refreshAll();
    } catch (err) {
      showToast('Failed to delete payment: ' + err.message, 'error');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (payments.length === 0) {
      showToast('No payment records to export', 'info');
      return;
    }

    const headers = ['Invoice #', 'Transaction ID', 'Student Name', 'Student Email', 'Class / Subject', 'Amount ($)', 'Method', 'Status', 'Date', 'Notes'];
    const rows = filteredPayments.map((p) => [
      `"${p.invoiceNumber || p.id}"`,
      `"${p.transactionId || ''}"`,
      `"${p.studentName || ''}"`,
      `"${p.studentEmail || ''}"`,
      `"${p.className || ''}"`,
      p.amount || 0,
      `"${p.method || ''}"`,
      `"${p.status || ''}"`,
      `"${p.date || ''}"`,
      `"${p.adminNotes || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LMS_Payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Payment records exported to CSV!', 'success');
  };

  return (
    <div>
      {/* Header & Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Financial & Payment Management</h1>
          <p>Review student course fees, approve bank transfers, manage invoices, and track revenue.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={handleExportCSV} className="btn btn-secondary">
            <Download size={16} /> Export CSV
          </button>
          <button
            onClick={() => {
              if (classes.length > 0) {
                setManualClassId(classes[0].id);
                setManualAmount(classes[0].fee || 0);
              }
              setCreateModalOpen(true);
            }}
            className="btn btn-primary"
          >
            <Plus size={16} /> Record Offline Payment
          </button>
        </div>
      </div>

      {/* Financial Stat KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-label">Total Gross Revenue</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--primary)', marginTop: '0.5rem' }}>
            {settings?.currencySymbol || '$'}{stats.totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <TrendingUp size={14} /> From {stats.completedCount} successful payments
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-label">Pending Verifications</span>
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '0.5rem', borderRadius: '8px' }}>
              <Clock size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)', marginTop: '0.5rem' }}>
            {stats.pendingCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {settings?.currencySymbol || '$'}{stats.pendingAmount.toLocaleString()} awaiting approval
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-label">Total Transactions</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', padding: '0.5rem', borderRadius: '8px' }}>
              <CreditCard size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ marginTop: '0.5rem' }}>
            {stats.totalCount}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {stats.refundedCount} refunded records
          </div>
        </div>

        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span className="stat-label">Active Courses</span>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent)', padding: '0.5rem', borderRadius: '8px' }}>
              <BookOpen size={20} />
            </div>
          </div>
          <div className="stat-value" style={{ marginTop: '0.5rem' }}>
            {classes.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Fee collection active
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ position: 'relative', gridColumn: 'span 2' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by student name, email, invoice #, transaction ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select className="form-control" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All Statuses</option>
              <option value="Completed">Completed / Paid</option>
              <option value="Pending">Pending Verification</option>
              <option value="Refunded">Refunded</option>
              <option value="Failed">Failed / Cancelled</option>
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <select className="form-control" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="All">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Method Filter */}
          <div>
            <select className="form-control" value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
              <option value="All">All Methods</option>
              <option value="Card">Cards (Stripe)</option>
              <option value="Google">Google Pay</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Manual">Manual / Cash</option>
              <option value="Scholarship">Scholarship / Free</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select className="form-control" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="amount-desc">Sort: Highest Amount</option>
              <option value="amount-asc">Sort: Lowest Amount</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Transaction Ledger ({filteredPayments.length})
          </h3>
          {(statusFilter !== 'All' || classFilter !== 'All' || methodFilter !== 'All' || searchTerm) && (
            <button
              onClick={() => {
                setStatusFilter('All');
                setClassFilter('All');
                setMethodFilter('All');
                setSearchTerm('');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem' }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center' }}>
            <CreditCard size={48} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Transactions Found</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              No payments match the current search filters or criteria.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Invoice # / Date</th>
                  <th>Student Customer</th>
                  <th>Course / Class</th>
                  <th>Amount</th>
                  <th>Payment Method</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const isCompleted = p.status === 'Completed';
                  const isPending = p.status === 'Pending';
                  const isRefunded = p.status === 'Refunded';

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.invoiceNumber || p.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                          {p.date}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 600 }}>{p.studentName || 'Guest / Student'}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {p.studentEmail || 'No email'}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 500, maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.className}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          ID: {p.classId}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: isCompleted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                          {p.currencySymbol || '$'}{Number(p.amount).toFixed(2)}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <div style={{ fontSize: '0.85rem' }}>{p.method || 'Online Card'}</div>
                        {p.transactionId && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {p.transactionId}
                          </div>
                        )}
                      </td>

                      <td style={{ padding: '1rem 1.25rem' }}>
                        <span
                          className={`badge ${
                            isCompleted
                              ? 'badge-success'
                              : isPending
                              ? 'badge-warning'
                              : isRefunded
                              ? 'badge-outline'
                              : 'badge-danger'
                          }`}
                          style={{ fontSize: '0.75rem' }}
                        >
                          {isCompleted ? '✓ Paid' : isPending ? '⏳ Pending' : p.status}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          {/* View Invoice */}
                          <button
                            onClick={() => {
                              setActivePayment(p);
                              setInvoiceModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="View / Print Receipt"
                          >
                            <FileText size={13} />
                          </button>

                          {/* Edit / Change Status */}
                          <button
                            onClick={() => {
                              setActivePayment(p);
                              setEditStatus(p.status || 'Completed');
                              setEditNotes(p.adminNotes || '');
                              setStatusModalOpen(true);
                            }}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="Update Payment Status"
                          >
                            <Edit size={13} />
                          </button>

                          {/* Delete Payment */}
                          <button
                            onClick={() => handleDeletePayment(p.id, p.invoiceNumber)}
                            className="btn btn-danger btn-sm"
                            style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                            title="Delete Payment Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= MODAL: RECORD OFFLINE PAYMENT ================= */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Record Offline / Manual Payment"
      >
        <form onSubmit={handleRecordManualPayment}>
          <div className="form-group">
            <label className="form-label">Student Full Name *</label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Alex Morgan"
              value={manualStudentName}
              onChange={(e) => setManualStudentName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Student Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="e.g. alex@example.com"
              value={manualStudentEmail}
              onChange={(e) => setManualStudentEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Enrolled Class / Course *</label>
            <select
              className="form-control"
              value={manualClassId}
              onChange={(e) => handleClassChange(e.target.value)}
              required
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({settings?.currencySymbol || '$'}{c.fee})
                </option>
              ))}
            </select>
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Amount Paid ({settings?.currencySymbol || '$'}) *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="form-control"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-control"
                value={manualMethod}
                onChange={(e) => setManualMethod(e.target.value)}
              >
                <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                <option value="Cash at Academy Desk">Cash at Academy Desk</option>
                <option value="POS / Cheque">POS / Cheque</option>
                <option value="Scholarship / 100% Waiver">Scholarship / Free</option>
                <option value="Custom Stripe Invoice">Custom Stripe Invoice</option>
              </select>
            </div>
          </div>

          <div className="grid-2-col">
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-control"
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value)}
              >
                <option value="Completed">Completed (Auto-Enrolls Student)</option>
                <option value="Pending">Pending (Awaiting Verification)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Bank Reference / Txn ID</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. SLIP-89240"
                value={manualTxnId}
                onChange={(e) => setManualTxnId(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Notes</label>
            <textarea
              className="form-control"
              placeholder="e.g. Paid in cash at reception by guardian..."
              value={manualNotes}
              onChange={(e) => setManualNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
            <button type="button" onClick={() => setCreateModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save & Record Transaction
            </button>
          </div>
        </form>
      </Modal>

      {/* ================= MODAL: UPDATE PAYMENT STATUS ================= */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => {
          setStatusModalOpen(false);
          setActivePayment(null);
        }}
        title="Update Payment Status & Verification"
      >
        {activePayment && (
          <form onSubmit={handleUpdateStatusSubmit}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
              <div><strong>Invoice:</strong> {activePayment.invoiceNumber || activePayment.id}</div>
              <div><strong>Student:</strong> {activePayment.studentName} ({activePayment.studentEmail})</div>
              <div><strong>Class:</strong> {activePayment.className}</div>
              <div><strong>Amount:</strong> {activePayment.currencySymbol || '$'}{activePayment.amount}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Change Status To *</label>
              <select
                className="form-control"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
              >
                <option value="Completed">Completed / Paid (Approves student admission)</option>
                <option value="Pending">Pending Verification</option>
                <option value="Refunded">Refunded / Returned</option>
                <option value="Failed">Failed / Declined</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Admin Notes / Reason</label>
              <textarea
                className="form-control"
                placeholder="e.g. Bank slip confirmed with finance team on Sept 11..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="modal-footer" style={{ padding: '1rem 0 0', borderTop: 'none' }}>
              <button
                type="button"
                onClick={() => {
                  setStatusModalOpen(false);
                  setActivePayment(null);
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Status
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ================= MODAL: VIEW INVOICE RECEIPT ================= */}
      <Modal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setActivePayment(null);
        }}
        title="Official Payment Receipt & Invoice"
      >
        {activePayment && (
          <div>
            <div
              id="printable-receipt"
              style={{
                background: 'var(--bg-primary)',
                padding: '1.75rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '1.5rem'
              }}
            >
              {/* Receipt Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {settings?.siteName || 'Online Academy LMS'}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {settings?.instituteTitle || 'Global Learning Portal'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>RECEIPT / INVOICE</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {activePayment.invoiceNumber || activePayment.id}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {activePayment.date}
                  </div>
                </div>
              </div>

              {/* Student & Payment Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Billed To:</div>
                  <div style={{ fontWeight: 700 }}>{activePayment.studentName}</div>
                  <div>{activePayment.studentEmail}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Payment Details:</div>
                  <div>Method: <strong>{activePayment.method}</strong></div>
                  <div style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    TXN: {activePayment.transactionId || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Line Items Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>Item Description</th>
                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem 0.6rem' }}>
                      <strong>{activePayment.className}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Class ID: {activePayment.classId}</div>
                    </td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>
                      {activePayment.currencySymbol || '$'}{Number(activePayment.amount).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', fontWeight: 700 }}>Total Paid:</td>
                    <td style={{ padding: '0.75rem 0.6rem', textAlign: 'right', fontWeight: 800, fontSize: '1.1rem', color: 'var(--success)' }}>
                      {activePayment.currencySymbol || '$'}{Number(activePayment.amount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Status Watermark / Note */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontSize: '0.8rem' }}>Status: <strong>{activePayment.status}</strong></span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Verified Transaction</span>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: '0.5rem 0 0', borderTop: 'none', display: 'flex', justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn btn-secondary"
              >
                <Printer size={16} /> Print Receipt
              </button>
              <button
                type="button"
                onClick={() => {
                  setInvoiceModalOpen(false);
                  setActivePayment(null);
                }}
                className="btn btn-primary"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
