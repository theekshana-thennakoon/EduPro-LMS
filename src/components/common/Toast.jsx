import React from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useLms } from '../../context/LmsContext';

export const Toast = () => {
  const { toast } = useLms();
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={20} />,
    error: <AlertCircle size={20} />,
    info: <Info size={20} />
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type || 'success'}`}>
        {icons[toast.type] || icons.success}
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
