import { AlertTriangle, X } from 'lucide-react';

interface ModalConfirmacionProps {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
  textoCancelar?: string;
  peligroso?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ModalConfirmacion({ titulo, mensaje, textoConfirmar = 'Confirmar', textoCancelar = 'Cancelar', peligroso = false, onConfirmar, onCancelar }: ModalConfirmacionProps) {
  return (
    <div className="modal-overlay" onClick={onCancelar}>
      <div className="modal-box max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${peligroso ? 'bg-error-light text-error dark:bg-error/15' : 'bg-warning-light text-warning dark:bg-warning/15'}`}>
            <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary dark:text-white mb-1">{titulo}</h3>
            <p className="text-sm text-text-secondary dark:text-gray-300 leading-relaxed">{mensaje}</p>
          </div>
          <button onClick={onCancelar} className="text-text-muted hover:text-text-primary dark:text-gray-400 dark:hover:text-white transition-colors"><X size={20} /></button>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancelar} className="btn-secondary">{textoCancelar}</button>
          <button onClick={onConfirmar} className={peligroso ? 'btn-danger' : 'btn-primary'}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
