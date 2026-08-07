import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${danger ? 'bg-error-light text-error dark:bg-error/15' : 'bg-warning-light text-warning dark:bg-warning/15'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">{title}</h3>
            <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">{message}</p>
          </div>
          <button onClick={onCancel} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary">{cancelLabel}</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger' : 'btn-primary'}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
