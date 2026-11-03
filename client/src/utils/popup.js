// Gestore centralizzato per popup di notifica (auto-chiudenti se senza errori) e conferme

const listeners = new Set();

export function subscribePopup(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(payload) {
  listeners.forEach((fn) => fn(payload));
}

/**
 * Mostra un popup elegante.
 * Se non ci sono errori (type === 'success'), si chiude automaticamente da solo.
 * Se è un errore o avviso, resta aperto finché l'utente non lo chiude.
 */
export function showPopup(message, type = 'auto', title = '') {
  const msgStr = String(message || '');
  let resolvedType = type;

  if (resolvedType === 'auto') {
    const lower = msgStr.toLowerCase();
    if (
      lower.includes('errore') ||
      lower.includes('error') ||
      lower.includes('fallit') ||
      lower.includes('impossibile')
    ) {
      resolvedType = 'error';
    } else if (
      lower.includes('obbligatori') ||
      lower.includes('attenzione') ||
      lower.includes('registra prima')
    ) {
      resolvedType = 'warning';
    } else {
      resolvedType = 'success';
    }
  }

  const defaultTitles = {
    success: 'Operazione Completata',
    error: 'Si è verificato un errore',
    warning: 'Attenzione'
  };

  emit({
    mode: 'alert',
    id: Date.now() + Math.random(),
    type: resolvedType,
    title: title || defaultTitles[resolvedType] || 'Notifica',
    message: msgStr,
    autoClose: resolvedType === 'success',
    duration: 2200
  });
}

/**
 * Mostra un popup di conferma elegante al posto di window.confirm().
 * Restituisce una Promise<boolean>.
 */
export function showConfirm(message, { title = 'Conferma Operazione', confirmText = 'Conferma', cancelText = 'Annulla', danger = true } = {}) {
  return new Promise((resolve) => {
    emit({
      mode: 'confirm',
      id: Date.now() + Math.random(),
      title,
      message: String(message || ''),
      confirmText,
      cancelText,
      danger,
      onResolve: resolve
    });
  });
}

