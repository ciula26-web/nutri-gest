import React, { useState, useEffect } from 'react';
import { X, User, ShieldAlert, Heart, Activity, Check } from 'lucide-react';

export default function PatientModal({ isOpen, onClose, onSave, patientToEdit = null }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    gender: 'F',
    birth_date: '',
    fiscal_code: '',
    phone: '',
    email: '',
    profession: '',
    address: '',
    height: '',
    initial_weight: '',
    target_weight: '',
    goal_description: '',
    activity_level: 'moderata',
    allergies: '',
    intolerances: '',
    pathologies: '',
    medications: '',
    lifestyle_notes: '',
    food_preferences: '',
    status: 'attivo'
  });

  const [activeTab, setActiveTab] = useState('anagrafica'); // anagrafica | antropometria | anamnesi

  useEffect(() => {
    if (patientToEdit) {
      setFormData({
        first_name: patientToEdit.first_name || '',
        last_name: patientToEdit.last_name || '',
        gender: patientToEdit.gender || 'F',
        birth_date: patientToEdit.birth_date || '',
        fiscal_code: patientToEdit.fiscal_code || '',
        phone: patientToEdit.phone || '',
        email: patientToEdit.email || '',
        profession: patientToEdit.profession || '',
        address: patientToEdit.address || '',
        height: patientToEdit.height || '',
        initial_weight: patientToEdit.initial_weight || '',
        target_weight: patientToEdit.target_weight || '',
        goal_description: patientToEdit.goal_description || '',
        activity_level: patientToEdit.activity_level || 'moderata',
        allergies: patientToEdit.allergies || '',
        intolerances: patientToEdit.intolerances || '',
        pathologies: patientToEdit.pathologies || '',
        medications: patientToEdit.medications || '',
        lifestyle_notes: patientToEdit.lifestyle_notes || '',
        food_preferences: patientToEdit.food_preferences || '',
        status: patientToEdit.status || 'attivo'
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        gender: 'F',
        birth_date: '',
        fiscal_code: '',
        phone: '',
        email: '',
        profession: '',
        address: '',
        height: '',
        initial_weight: '',
        target_weight: '',
        goal_description: '',
        activity_level: 'moderata',
        allergies: '',
        intolerances: '',
        pathologies: '',
        medications: '',
        lifestyle_notes: '',
        food_preferences: '',
        status: 'attivo'
      });
    }
  }, [patientToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.first_name || !formData.last_name) {
      alert('Nome e Cognome sono obbligatori.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '850px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <User size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                {patientToEdit ? 'Modifica Scheda Paziente' : 'Nuovo Paziente'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {patientToEdit ? `${formData.first_name} ${formData.last_name}` : 'Inserimento dati anagrafici, antropometrici e anamnesi'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={18} />
          </button>
        </div>

        {/* Tab di navigazione del modale */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-light)', padding: '0 24px', backgroundColor: 'var(--bg-subtle)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('anagrafica')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'anagrafica' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'anagrafica' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            1. Anagrafica & Contatti
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('antropometria')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'antropometria' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'antropometria' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            2. Obiettivi & Misure
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anamnesi')}
            style={{
              padding: '12px 18px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'anamnesi' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'anamnesi' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.88rem',
              cursor: 'pointer'
            }}
          >
            3. Anamnesi Clinica
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            
            {/* TAB 1: ANAGRAFICA */}
            {activeTab === 'anagrafica' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Nome *</label>
                    <input
                      type="text"
                      name="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="es. Laura"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Cognome *</label>
                    <input
                      type="text"
                      name="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="es. Rossi"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Sesso</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="F">Femmina (F)</option>
                      <option value="M">Maschio (M)</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Data di Nascita</label>
                    <input
                      type="date"
                      name="birth_date"
                      value={formData.birth_date}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Codice Fiscale</label>
                    <input
                      type="text"
                      name="fiscal_code"
                      value={formData.fiscal_code}
                      onChange={handleChange}
                      placeholder="es. RSSMRA85M01H501Z"
                      style={{ textTransform: 'uppercase' }}
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Professione</label>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      placeholder="es. Insegnante"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Telefono / Cellulare</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="es. +39 347 1234567"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="es. paziente@email.it"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Stato Paziente</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="attivo">Attivo (in percorso)</option>
                      <option value="in_pausa">In Pausa / Sospeso</option>
                      <option value="concluso">Concluso / Obiettivo raggiunto</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Indirizzo di residenza</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="es. Via Garibaldi 12, Milano"
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: ANTROPOMETRIA & OBIETTIVI */}
            {activeTab === 'antropometria' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Altezza (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      name="height"
                      value={formData.height}
                      onChange={handleChange}
                      placeholder="es. 168"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Peso Iniziale (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="initial_weight"
                      value={formData.initial_weight}
                      onChange={handleChange}
                      placeholder="es. 74.5"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Peso Obiettivo (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      name="target_weight"
                      value={formData.target_weight}
                      onChange={handleChange}
                      placeholder="es. 62.0"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Livello Attività Fisica</label>
                    <select
                      name="activity_level"
                      value={formData.activity_level}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="sedentario">Sedentario (lavoro d'ufficio, no sport)</option>
                      <option value="leggera">Leggera (1-2 volte/settimana camminata/yoga)</option>
                      <option value="moderata">Moderata (3-4 volte/settimana allenamento)</option>
                      <option value="intensa">Intensa (5-6 volte/settimana pesi/cardio)</option>
                      <option value="atleta">Atleta agonista (doppi allenamenti)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrizione Obiettivo Nutrizionale</label>
                  <textarea
                    rows={3}
                    name="goal_description"
                    value={formData.goal_description}
                    onChange={handleChange}
                    placeholder="es. Dimagrimento progressivo, sgonfiamento addominale, educazione alimentare e mantenimento tono muscolare."
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Stile di Vita & Orari Pasti</label>
                  <textarea
                    rows={2}
                    name="lifestyle_notes"
                    value={formData.lifestyle_notes}
                    onChange={handleChange}
                    placeholder="es. Sveglia alle 07:00, pranzo veloce in ufficio alle 13:00, cena in famiglia alle 20:30."
                    className="form-control"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: ANAMNESI CLINICA */}
            {activeTab === 'anamnesi' && (
              <div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label" style={{ color: 'var(--danger)' }}>
                      Allergie Alimentari
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      placeholder="es. Frutta a guscio, crostacei, uova"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ color: '#b45309' }}>
                      Intolleranze Conclamate / Sospette
                    </label>
                    <input
                      type="text"
                      name="intolerances"
                      value={formData.intolerances}
                      onChange={handleChange}
                      placeholder="es. Lattosio, glutine / celiachia, nichel"
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Patologie Diagnosticate</label>
                    <textarea
                      rows={2}
                      name="pathologies"
                      value={formData.pathologies}
                      onChange={handleChange}
                      placeholder="es. Ipotiroidismo di Hashimoto, reflusso gastroesofageo, ipercolesterolemia..."
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Farmaci o Terapie in Uso</label>
                    <textarea
                      rows={2}
                      name="medications"
                      value={formData.medications}
                      onChange={handleChange}
                      placeholder="es. Eutirox 50mcg al mattino, pillola anticoncezionale..."
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferenze & Gusti Alimentari (Cibi graditi / non graditi)</label>
                  <textarea
                    rows={2}
                    name="food_preferences"
                    value={formData.food_preferences}
                    onChange={handleChange}
                    placeholder="es. Ama verdure croccanti e legumi. Non tollera il sapore del pesce azzurro o dei formaggi erborinati."
                    className="form-control"
                  />
                </div>
              </div>
            )}

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>{patientToEdit ? 'Salva Modifiche' : 'Registra Paziente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
