import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, X } from 'lucide-react';
import { subscribePopup, showPopup } from '../utils/popup';

export default function PopupOverlay() {
  const [popup, setPopup] = useState(null);

  useEffect(() => {
    // Intercetta eventuali chiamate residue a window.alert
    const originalAlert = window.alert;
    window.alert = (msg) => showPopup(msg);

    const unsubscribe = subscribePopup((newPopup) => {
      setPopup(newPopup);
    });

    return () => {
      window.alert = originalAlert;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!popup) return;
    if (popup.mode === 'alert' && popup.autoClose) {
      const timer = setTimeout(() => {
        setPopup(null);
      }, popup.duration || 22000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  if (!popup) return null;

  const handleCloseAlert = () => {
    setPopup(null);
  };

  const handleConfirmChoice = (choice) => {
    const resolver = popup.onResolve;
    setPopup(null);
    if (resolver) resolver(choice);
  };

  const getTheme = () => {
    if (popup.mode === 'confirm') {
      return {
        accent: popup.danger ? '#ef4444' : '#1e3a5f',
        bgIcon: popup.danger ? '#fef2f2' : '#f0f4fa',
        borderIcon: popup.danger ? '#fecaca' : '#cbd5e1',
        icon: <HelpCircle size={28} color={popup.danger ? '#ef4444' : '#1e3a5f'} />
      };
    }
    if (popup.type === 'error') {
      return {
        accent: '#ef4444',
        bgIcon: '#fef2f2',
        borderIcon: '#fecaca',
        icon: <XCircle size={28} color="#ef4444" />
      };
    }
    if (popup.type === 'warning') {
      return {
        accent: '#f59e0b',
        bgIcon: '#fffbeb',
        borderIcon: '#fde68a',
        icon: <AlertTriangle size={28} color="#d97706" />
      };
    }
    return {
      accent: '#10b981',
      bgIcon: '#ecfdf5',
      borderIcon: '#a7f3d0',
      icon: <CheckCircle2 size={28} color="#10b981" />
    };
  };

  const theme = getTheme();

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (popup.mode === 'alert') handleCloseAlert();
        if (popup.mode === 'confirm') handleConfirmChoice(false);
      }}
      style={{
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          borderRadius: '18px',
          width: '100%',
          maxWidth: '410px',
          padding: '26px 24px 22px',
          boxShadow: '0 22px 45px -10px rgba(15, 23, 42, 0.25)',
          border: '1px solid var(--border-light)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center',
          animation: 'modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Pulsante X in alto a destra */}
        <button
          type="button"
          onClick={() => {
            if (popup.mode === 'alert') handleCloseAlert();
            if (popup.mode === 'confirm') handleConfirmChoice(false);
          }}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Icona circolare centrale */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: theme.bgIcon,
            border: `1px solid ${theme.borderIcon}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 14px'
          }}
        >
          {theme.icon}
        </div>

        {/* Titolo */}
        <h3 style={{ fontSize: '1.12rem', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
          {popup.title}
        </h3>

        {/* Messaggio */}
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 18px' }}>
          {popup.message}
        </p>

        {/* Azioni */}
        {popup.mode === 'confirm' ? (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '6px' }}>
            <button
              type="button"
              onClick={() => handleConfirmChoice(false)}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              {popup.cancelText || 'Annulla'}
            </button>
            <button
              type="button"
              onClick={() => handleConfirmChoice(true)}
              className={`btn ${popup.danger ? 'btn-danger' : 'btn-primary'}`}
              style={{
                flex: 1,
                backgroundColor: popup.danger ? '#ef4444' : 'var(--primary)',
                color: '#ffffff',
                borderColor: popup.danger ? '#ef4444' : 'var(--primary)'
              }}
            >
              {popup.confirmText || 'Conferma'}
            </button>
          </div>
        ) : !popup.autoClose ? (
          <button
            type="button"
            onClick={handleCloseAlert}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Chiudi
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Chiusura automatica...
          </div>
        )}

        {/* Barra di avanzamento per la chiusura automatica */}
        {popup.mode === 'alert' && popup.autoClose && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '4px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)'
            }}
          >
            <div
              key={popup.id}
              style={{
                height: '100%',
                backgroundColor: theme.accent,
                animation: `popupProgress ${popup.duration || 2200}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

