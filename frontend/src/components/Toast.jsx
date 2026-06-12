import { useState, useCallback, createContext, useContext } from 'react';
import { IconCheck, IconClose, IconInfo } from './Icons';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const ToastIcon = ({ type }) => {
    switch (type) {
      case 'success': return <IconCheck size={16} />;
      case 'error':   return <IconClose size={16} />;
      default:        return <IconInfo size={16} />;
    }
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.type}`}>
            <span className="toast-icon"><ToastIcon type={t.type} /></span>
            <span className="toast-message">{t.message}</span>
            <button className="toast-dismiss" onClick={() => removeToast(t.id)} aria-label="Dismiss">
              <IconClose size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
