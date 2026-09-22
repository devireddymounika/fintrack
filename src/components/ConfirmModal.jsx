import { AlertTriangle, X } from 'lucide-react';

function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Confirm',
  danger = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container confirm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="confirm-title-row">
            <div className={`confirm-icon-wrapper ${danger ? 'danger' : 'info'}`}>
              <AlertTriangle size={20} />
            </div>
            <h3>{title}</h3>
          </div>
          <button className="icon-btn-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-message">{message}</p>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
