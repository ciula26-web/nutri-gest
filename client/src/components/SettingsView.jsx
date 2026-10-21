import React, { useState, useEffect } from 'react';
import {
  Settings,
  HardDrive,
  Download,
  RotateCcw,
  Check,
  ShieldCheck,
  Building,
  Save,
  Info
} from 'lucide-react';
import { api } from '../api';

export default function SettingsView({ settings, onSettingsUpdated, onReloadData }) {
  const [formData, setFormData] = useState({
    nutritionist_name: '',
    title: '',
    studio_name: '',
    address: '',
    phone: '',
    email: '',
    vat_piva: '',
    orders_code: '',
    disclaimer_notes: ''
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        nutritionist_name: settings.nutritionist_name || '',
        title: settings.title || '',
        studio_name: settings.studio_name || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        vat_piva: settings.vat_piva || '',
        orders_code: settings.orders_code || '',
        disclaimer_notes: settings.disclaimer_notes || ''
      });
    }
  }, [settings]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const updated = await api.updateSettings(formData);
      onSettingsUpdated(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Errore nel salvataggio: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDemo = async () => {
    if (confirm('Vuoi ripristinare i dati dimostrativi? Tutti i dati correnti verranno sovrascritti con i profili demo.')) {
      try {
        await api.resetDemoData();
        alert('Dati dimostrativi ripristinati con successo!');
        if (onReloadData) onReloadData();
      } catch (e) {
        alert('Errore ripristino demo: ' + e.message);
      }
    }
  };

  return (
    <div className="settings-view" style={{ maxWidth: '980px', margin: '0 auto' }}>
      
      {/* Box Privacy & Sicurezza Locale */}
      <div style={{
        backgroundColor: 'var(--primary-light)',
        border: '1px solid var(--primary-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 22px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <ShieldCheck size={24} />
        </div>
        <div>
          <strong style={{ fontSize: '1rem', color: '#0f766e', display: 'block' }}>
            Privacy Massima & Archiviazione Locale (GDPR Medical Compliant)
          </strong>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Tutti i dati anagrafici, cartelle cliniche, pesate, BIA e diete dei pazienti risiedono esclusivamente
            nel file SQLite locale sul tuo computer. Nessun dato sensibile viene inviato a server cloud terzi.
          </p>
        </div>
      </div>

      {/* Form Dati Studio e Intestazione Ricette/Diete */}
      <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h3 className="card-title">
            <Building size={18} style={{ color: 'var(--primary)' }} />
            Dati del Professionista & Intestazione Studio
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Questi dati appariranno nell'intestazione e nel timbro delle diete stampate in PDF
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nome e Cognome Professionista *</label>
            <input
              type="text"
              required
              name="nutritionist_name"
              value={formData.nutritionist_name}
              onChange={handleChange}
              placeholder="es. Dott.ssa Laura Gentile"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Titolo Professionale *</label>
            <input
              type="text"
              required
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="es. Biologa Nutrizionista - Spec. in Scienze dell'Alimentazione"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nome dello Studio</label>
            <input
              type="text"
              name="studio_name"
              value={formData.studio_name}
              onChange={handleChange}
              placeholder="es. NutriDesk Studio Nutrizionale"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Iscrizione Ordine Professionale</label>
            <input
              type="text"
              name="orders_code"
              value={formData.orders_code}
              onChange={handleChange}
              placeholder="es. Iscrizione ONB n. AA_012345"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Indirizzo Studio</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="es. Via Garibaldi 42, 20121 Milano"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Partita IVA / Codice Fiscale</label>
            <input
              type="text"
              name="vat_piva"
              value={formData.vat_piva}
              onChange={handleChange}
              placeholder="es. P.IVA 09876543210"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Telefono di Contatto Studio</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="es. +39 02 87654321"
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Professionale</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="es. info@studionutrizione.it"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Disclaimer & Note a piè di pagina (sui PDF)</label>
          <textarea
            rows={2}
            name="disclaimer_notes"
            value={formData.disclaimer_notes}
            onChange={handleChange}
            placeholder="es. Il presente piano nutrizionale è strettamente personalizzato..."
            className="form-control"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
          {savedSuccess && (
            <span style={{ color: 'var(--success)', fontSize: '0.88rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Check size={16} /> Modifiche salvate!
            </span>
          )}
          <button type="submit" disabled={saving} className="btn btn-primary">
            <Save size={16} />
            <span>{saving ? 'Salvataggio...' : 'Salva Impostazioni'}</span>
          </button>
        </div>
      </form>

      {/* Card Gestione Backup & Database SQLite */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <HardDrive size={18} style={{ color: 'var(--accent-cyan)' }} />
            Gestione Database SQLite Locale & Backup
          </h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>
                Scarica File Database SQLite Completo (.sqlite)
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Salva una copia fisica del database su chiavetta USB o cartella sicura per non perdere mai nulla.
              </p>
            </div>
            <a
              href="/api/backup/download-db"
              download
              className="btn btn-primary btn-sm"
            >
              <Download size={15} />
              <span>Scarica .sqlite</span>
            </a>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>
                Esportazione Dati in Formato Aperto (JSON)
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Esporta tutti i pazienti, visite, valori BIA e diete in un unico file JSON standard leggibile.
              </p>
            </div>
            <a
              href="/api/backup/export-json"
              download
              className="btn btn-secondary btn-sm"
            >
              <Download size={15} />
              <span>Esporta JSON</span>
            </a>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--bg-subtle)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div>
              <strong style={{ fontSize: '0.92rem', display: 'block' }}>
                Ripristina Dati Dimostrativi
              </strong>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '2px 0 0' }}>
                Ricarica i pazienti di prova con visite storiche, grafici BIA completi e diete settimanali.
              </p>
            </div>
            <button
              onClick={handleResetDemo}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={15} />
              <span>Ripristina Demo</span>
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
