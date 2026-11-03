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
    activity_level: '1-2 volte a settimana',
    sport_type: '',
    daily_steps: '0 - 5.000 passi/giorno',
    allergies: '',
    intolerances: '',
    pathologies: '',
    medications: '',
    lifestyle_notes: '',
    food_preferences: '',
    menstrual_cycle: '',
    pregnancy_lactation: '',
    childbirth_history: '',
    menopause: '',
    questionnaire: {},
    status: 'attivo'
  });

  const [activeTab, setActiveTab] = useState('anagrafica'); // anagrafica | antropometria | anamnesi | abitudini
  const [habitsSection, setHabitsSection] = useState('alimentazione'); // alimentazione | abitudini_fame | sonno_umore | donna

  useEffect(() => {
    const normalizeActivityLevel = (val) => {
      const legacyMap = {
        sedentario: 'Sedentario',
        leggera: '1-2 volte a settimana',
        moderata: '3-4 volte a settimana',
        intensa: '5-6 volte a settimana',
        atleta: 'Tutti i giorni / Agonista'
      };
      return legacyMap[val] || val || '1-2 volte a settimana';
    };

    if (patientToEdit) {
      let parsedQ = {};
      if (patientToEdit.questionnaire && typeof patientToEdit.questionnaire === 'object') {
        parsedQ = patientToEdit.questionnaire;
      } else if (patientToEdit.questionnaire_json) {
        try {
          parsedQ = JSON.parse(patientToEdit.questionnaire_json);
        } catch {
          parsedQ = {};
        }
      }

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
        activity_level: normalizeActivityLevel(patientToEdit.activity_level),
        sport_type: patientToEdit.sport_type || '',
        daily_steps: patientToEdit.daily_steps || '0 - 5.000 passi/giorno',
        allergies: patientToEdit.allergies || '',
        intolerances: patientToEdit.intolerances || '',
        pathologies: patientToEdit.pathologies || '',
        medications: patientToEdit.medications || '',
        lifestyle_notes: patientToEdit.lifestyle_notes || '',
        food_preferences: patientToEdit.food_preferences || '',
        menstrual_cycle: patientToEdit.menstrual_cycle || '',
        pregnancy_lactation: patientToEdit.pregnancy_lactation || '',
        childbirth_history: patientToEdit.childbirth_history || '',
        menopause: patientToEdit.menopause || '',
        questionnaire: parsedQ || {},
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
        activity_level: '1-2 volte a settimana',
        sport_type: '',
        daily_steps: '0 - 5.000 passi/giorno',
        allergies: '',
        intolerances: '',
        pathologies: '',
        medications: '',
        lifestyle_notes: '',
        food_preferences: '',
        menstrual_cycle: '',
        pregnancy_lactation: '',
        childbirth_history: '',
        menopause: '',
        questionnaire: {},
        status: 'attivo'
      });
    }
  }, [patientToEdit, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'gender' && value === 'M' && habitsSection === 'donna') {
      setHabitsSection('alimentazione');
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleQChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      questionnaire: {
        ...(prev.questionnaire || {}),
        [field]: value
      }
    }));
  };

  const q = formData.questionnaire || {};

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
        <div style={{ display: 'flex', flexWrap: 'wrap', borderBottom: '1px solid var(--border-light)', padding: '0 24px', backgroundColor: 'var(--bg-subtle)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('anagrafica')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'anagrafica' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'anagrafica' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            1. Anagrafica & Contatti
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('antropometria')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'antropometria' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'antropometria' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            2. Obiettivi & Misure
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('anamnesi')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'anamnesi' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'anamnesi' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            3. Anamnesi Clinica
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('abitudini')}
            style={{
              padding: '12px 16px',
              border: 'none',
              background: 'transparent',
              borderBottom: activeTab === 'abitudini' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'abitudini' ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.86rem',
              cursor: 'pointer'
            }}
          >
            4. Abitudini Alimentari
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
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fai attività fisica? (Quante volte/settimana)</label>
                    <select
                      name="activity_level"
                      value={formData.activity_level}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="Sedentario">Sedentario (nessuno sport)</option>
                      <option value="1-2 volte a settimana">1-2 volte a settimana</option>
                      <option value="2-3 volte a settimana">2-3 volte a settimana</option>
                      <option value="3-4 volte a settimana">3-4 volte a settimana</option>
                      <option value="4-5 volte a settimana">4-5 volte a settimana</option>
                      <option value="5-6 volte a settimana">5-6 volte a settimana</option>
                      <option value="Tutti i giorni / Agonista">Tutti i giorni / Agonista</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quale attività / Tipo di Sport</label>
                    <input
                      type="text"
                      name="sport_type"
                      value={formData.sport_type}
                      onChange={handleChange}
                      placeholder="es. Palestra, Corsa, Nuoto, Pilates..."
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fai camminate giornaliere?</label>
                    <input
                      type="text"
                      value={q.daily_walks || ''}
                      onChange={(e) => handleQChange('daily_walks', e.target.value)}
                      placeholder="es. Sì 30 min al giorno, No, Solo nel weekend..."
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quanto ti muovi durante una giornata (Passi)</label>
                    <select
                      name="daily_steps"
                      value={formData.daily_steps}
                      onChange={handleChange}
                      className="form-control"
                    >
                      <option value="0 - 5.000 passi/giorno">0 - 5.000 passi/giorno (Sedentario)</option>
                      <option value="5.000 - 10.000 passi/giorno">5.000 - 10.000 passi/giorno (Moderato)</option>
                      <option value="10.000 - 15.000 passi/giorno">10.000 - 15.000 passi/giorno (Attivo)</option>
                      <option value="Oltre 15.000 passi/giorno">Oltre 15.000 passi/giorno (Molto attivo)</option>
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
              </div>
            )}

            {/* TAB 3: ANAMNESI CLINICA (SALUTE) */}
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
                    <label className="form-label">Terapia / Farmaci in Uso</label>
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

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Assunzione di Integratori</label>
                    <input
                      type="text"
                      value={q.supplements_taken || ''}
                      onChange={(e) => handleQChange('supplements_taken', e.target.value)}
                      placeholder="es. Vitamina D, Magnesio, Omega 3, Probiotici..."
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Disturbi Gastrointestinali</label>
                    <input
                      type="text"
                      value={q.gi_disorders || ''}
                      onChange={(e) => handleQChange('gi_disorders', e.target.value)}
                      placeholder="es. Gonfiore post-prandiale, reflusso, meteorismo, gastrite..."
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Minzione (Diuresi)</label>
                    <input
                      type="text"
                      value={q.urination || ''}
                      onChange={(e) => handleQChange('urination', e.target.value)}
                      placeholder="es. Regolare, frequente, scarsa, ritenzione..."
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feci (Regolarità Intestinale / Alvo)</label>
                    <input
                      type="text"
                      value={q.bowel_movements || ''}
                      onChange={(e) => handleQChange('bowel_movements', e.target.value)}
                      placeholder="es. Regolare 1v/giorno, stipsi, alvo alterno, diarrea..."
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ABITUDINI ALIMENTARI (E SEZIONE DONNA) */}
            {activeTab === 'abitudini' && (
              <div>
                {/* Sotto-menu rapido per le 4 aree di Abitudini Alimentari */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    marginBottom: '18px',
                    padding: '6px',
                    backgroundColor: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)'
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setHabitsSection('alimentazione')}
                    className={`btn btn-sm ${habitsSection === 'alimentazione' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: '1 1 auto' }}
                  >
                    🍽️ La Tua Alimentazione
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitsSection('abitudini_fame')}
                    className={`btn btn-sm ${habitsSection === 'abitudini_fame' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: '1 1 auto' }}
                  >
                    😋 Abitudini, Fame & Gusti
                  </button>
                  <button
                    type="button"
                    onClick={() => setHabitsSection('sonno_umore')}
                    className={`btn btn-sm ${habitsSection === 'sonno_umore' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ flex: '1 1 auto' }}
                  >
                    🌙 Sonno e Umore
                  </button>
                  {formData.gender === 'F' && (
                    <button
                      type="button"
                      onClick={() => setHabitsSection('donna')}
                      className={`btn btn-sm ${habitsSection === 'donna' ? 'btn-primary' : 'btn-secondary'}`}
                      style={{
                        flex: '1 1 auto',
                        borderColor: habitsSection === 'donna' ? '#db2777' : '#fbcfe8',
                        backgroundColor: habitsSection === 'donna' ? '#db2777' : '#fdf2f8',
                        color: habitsSection === 'donna' ? '#ffffff' : '#be185d'
                      }}
                    >
                      🌸 Area Donna (Ciclo, Parto, Allattamento)
                    </button>
                  )}
                </div>

                {/* SOTTO-SEZIONE 1: LA TUA ALIMENTAZIONE */}
                {habitsSection === 'alimentazione' && (
                  <div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">A che ora fai colazione?</label>
                        <input
                          type="text"
                          value={q.breakfast_time || ''}
                          onChange={(e) => handleQChange('breakfast_time', e.target.value)}
                          placeholder="es. 07:30"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Cosa mangi e bevi a colazione?</label>
                        <input
                          type="text"
                          value={q.breakfast_food || ''}
                          onChange={(e) => handleQChange('breakfast_food', e.target.value)}
                          placeholder="es. Caffè macchiato con 3 fette biscottate e marmellata, oppure yogurt..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Fai spuntini? Quanti e come?</label>
                      <input
                        type="text"
                        value={q.snacks_habit || ''}
                        onChange={(e) => handleQChange('snacks_habit', e.target.value)}
                        placeholder="es. 1 a metà mattina (frutta o crackers) e 1 al pomeriggio (yogurt o frutta secca)"
                        className="form-control"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">A che ora pranzi?</label>
                        <input
                          type="text"
                          value={q.lunch_time || ''}
                          onChange={(e) => handleQChange('lunch_time', e.target.value)}
                          placeholder="es. 13:00 - 13:30"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Cosa mangi a pranzo?</label>
                        <input
                          type="text"
                          value={q.lunch_food || ''}
                          onChange={(e) => handleQChange('lunch_food', e.target.value)}
                          placeholder="es. Primo piatto veloce in mensa/bar oppure insalatona con pane..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">A che ora ceni?</label>
                        <input
                          type="text"
                          value={q.dinner_time || ''}
                          onChange={(e) => handleQChange('dinner_time', e.target.value)}
                          placeholder="es. 20:00 - 20:30"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">Cosa mangi a cena?</label>
                        <input
                          type="text"
                          value={q.dinner_food || ''}
                          onChange={(e) => handleQChange('dinner_food', e.target.value)}
                          placeholder="es. Secondo di carne/pesce/uova con verdura e pane..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Mangi dopo cena?</label>
                        <input
                          type="text"
                          value={q.after_dinner_eating || ''}
                          onChange={(e) => handleQChange('after_dinner_eating', e.target.value)}
                          placeholder="es. No, oppure cioccolato/biscotti davanti alla TV"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Bevi alcolici?</label>
                        <input
                          type="text"
                          value={q.alcohol_intake || ''}
                          onChange={(e) => handleQChange('alcohol_intake', e.target.value)}
                          placeholder="es. 1-2 calici di vino nel weekend, No..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Quanti caffè / tè bevi al giorno?</label>
                        <input
                          type="text"
                          value={q.coffee_tea_intake || ''}
                          onChange={(e) => handleQChange('coffee_tea_intake', e.target.value)}
                          placeholder="es. 3 caffè amari al giorno, 1 tè verde..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Quanta acqua bevi al giorno?</label>
                        <input
                          type="text"
                          value={q.water_intake || ''}
                          onChange={(e) => handleQChange('water_intake', e.target.value)}
                          placeholder="es. Circa 1.5 - 2 litri al giorno"
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Note Generali Stile di Vita & Orari</label>
                      <textarea
                        rows={2}
                        name="lifestyle_notes"
                        value={formData.lifestyle_notes}
                        onChange={handleChange}
                        placeholder="Ulteriori note su turni lavorativi, routine giornaliera..."
                        className="form-control"
                      />
                    </div>
                  </div>
                )}

                {/* SOTTO-SEZIONE 2: ABITUDINI, FAME & GUSTI */}
                {habitsSection === 'abitudini_fame' && (
                  <div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Hai più fame in determinati momenti della giornata?</label>
                        <input
                          type="text"
                          value={q.hunger_moments || ''}
                          onChange={(e) => handleQChange('hunger_moments', e.target.value)}
                          placeholder="es. Tardo pomeriggio (17:00-19:00), sera dopo cena..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Ti capita di saltare i pasti?</label>
                        <input
                          type="text"
                          value={q.skip_meals || ''}
                          onChange={(e) => handleQChange('skip_meals', e.target.value)}
                          placeholder="es. Mai, A volte salto il pranzo o la colazione..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Mangi velocemente?</label>
                        <input
                          type="text"
                          value={q.eating_speed || ''}
                          onChange={(e) => handleQChange('eating_speed', e.target.value)}
                          placeholder="es. Sì molto velocemente (<10 min), Normale..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Mangi spesso fuori casa?</label>
                        <input
                          type="text"
                          value={q.eat_out_often || ''}
                          onChange={(e) => handleQChange('eat_out_often', e.target.value)}
                          placeholder="es. A pranzo dal lunedì al venerdì, 1-2 volte a settimana..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Quanti pasti preferisci fare?</label>
                        <input
                          type="text"
                          value={q.preferred_meals_count || ''}
                          onChange={(e) => handleQChange('preferred_meals_count', e.target.value)}
                          placeholder="es. 5 pasti (3 principali + 2 spuntini), oppure 3 pasti..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Come li vuoi strutturare?</label>
                        <input
                          type="text"
                          value={q.meals_structure_preference || ''}
                          onChange={(e) => handleQChange('meals_structure_preference', e.target.value)}
                          placeholder="es. Piatto unico a pranzo, secondo e contorno a cena..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Hai bisogno di pasti veloci da preparare?</label>
                        <input
                          type="text"
                          value={q.quick_meals_needed || ''}
                          onChange={(e) => handleQChange('quick_meals_needed', e.target.value)}
                          placeholder="es. Sì soprattutto a pranzo, No ho tempo di cucinare..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Quali alimenti ti piacciono particolarmente?</label>
                      <input
                        type="text"
                        value={q.liked_foods || ''}
                        onChange={(e) => handleQChange('liked_foods', e.target.value)}
                        placeholder="es. Pasta, pesce azzurro, verdure grigliate, yogurt greco, frutta secca..."
                        className="form-control"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Quali preferiresti mangiare più raramente?</label>
                        <input
                          type="text"
                          value={q.rarely_liked_foods || ''}
                          onChange={(e) => handleQChange('rarely_liked_foods', e.target.value)}
                          placeholder="es. Carne rossa, legumi, minestroni..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Quali vorresti assolutamente evitare?</label>
                        <input
                          type="text"
                          value={q.avoid_foods || ''}
                          onChange={(e) => handleQChange('avoid_foods', e.target.value)}
                          placeholder="es. Fegato, cavolfiore, formaggi piccanti, coniglio..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Riepilogo Cibi che Piacciono e Non Piacciono (Note generali)</label>
                      <textarea
                        rows={2}
                        name="food_preferences"
                        value={formData.food_preferences}
                        onChange={handleChange}
                        placeholder="Eventuali ulteriori note sulle preferenze alimentari..."
                        className="form-control"
                      />
                    </div>
                  </div>
                )}

                {/* SOTTO-SEZIONE 3: SONNO E UMORE */}
                {habitsSection === 'sonno_umore' && (
                  <div>
                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Quante ore dormi per notte?</label>
                        <input
                          type="text"
                          value={q.sleep_hours || ''}
                          onChange={(e) => handleQChange('sleep_hours', e.target.value)}
                          placeholder="es. 7-8 ore, Meno di 6 ore..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Sonno continuo o frammentato?</label>
                        <select
                          value={q.sleep_quality || ''}
                          onChange={(e) => handleQChange('sleep_quality', e.target.value)}
                          className="form-control"
                        >
                          <option value="">-- Seleziona --</option>
                          <option value="Continuo e riposante">Continuo e riposante</option>
                          <option value="Frammentato (risvegli notturni)">Frammentato (risvegli notturni)</option>
                          <option value="Difficoltà ad addormentarsi">Difficoltà ad addormentarsi</option>
                          <option value="Risveglio precoce">Risveglio precoce</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Urini frequentemente durante la notte?</label>
                        <input
                          type="text"
                          value={q.nocturia || ''}
                          onChange={(e) => handleQChange('nocturia', e.target.value)}
                          placeholder="es. No, Sì 1-2 volte a notte..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Sei stressato?</label>
                        <input
                          type="text"
                          value={q.stress_level || ''}
                          onChange={(e) => handleQChange('stress_level', e.target.value)}
                          placeholder="es. Molto per lavoro, Moderatamente, No..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Apnee notturne / Russamento?</label>
                        <input
                          type="text"
                          value={q.sleep_apnea || ''}
                          onChange={(e) => handleQChange('sleep_apnea', e.target.value)}
                          placeholder="es. No, Russamento lieve, Sì diagnosticate..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Ti senti molto stanco durante il giorno?</label>
                        <input
                          type="text"
                          value={q.daytime_fatigue || ''}
                          onChange={(e) => handleQChange('daytime_fatigue', e.target.value)}
                          placeholder="es. Sì soprattutto dopo pranzo, Al risveglio, No..."
                          className="form-control"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label className="form-label">Hai dolori addominali durante la notte?</label>
                        <input
                          type="text"
                          value={q.night_abdominal_pain || ''}
                          onChange={(e) => handleQChange('night_abdominal_pain', e.target.value)}
                          placeholder="es. No, A volte gonfiore/crampi..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">La cena influisce sulla qualità del sonno?</label>
                        <input
                          type="text"
                          value={q.dinner_affects_sleep || ''}
                          onChange={(e) => handleQChange('dinner_affects_sleep', e.target.value)}
                          placeholder="es. Sì se mangio tardi o pesante, No..."
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Ipertensione / Tachicardia notturna?</label>
                        <input
                          type="text"
                          value={q.night_hypertension_tachycardia || ''}
                          onChange={(e) => handleQChange('night_hypertension_tachycardia', e.target.value)}
                          placeholder="es. No, Episodi sporadici..."
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* SOTTO-SEZIONE 4: AREA DONNA (SOLO SE SESSO === 'F') */}
                {habitsSection === 'donna' && formData.gender === 'F' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

                    {/* 1. CICLO MESTRUALE E MENOPAUSA */}
                    <div
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: '#fdf2f8',
                        border: '1px solid #fbcfe8'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#be185d', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Heart size={16} />
                        <span>1. Ciclo Mestruale e Menopausa</span>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Quando le prime mestruazioni (Menarca)?</label>
                          <input
                            type="text"
                            value={q.menarche_age || ''}
                            onChange={(e) => handleQChange('menarche_age', e.target.value)}
                            placeholder="es. 12 anni"
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Sei in menopausa?</label>
                          <select
                            name="menopause"
                            value={formData.menopause}
                            onChange={handleChange}
                            className="form-control"
                          >
                            <option value="">-- Seleziona --</option>
                            <option value="No (Età fertile)">No (Età fertile)</option>
                            <option value="Perimenopausa / Pre-menopausa">Perimenopausa / Pre-menopausa</option>
                            <option value="Menopausa Fisiologica">Sì - Menopausa Fisiologica</option>
                            <option value="Menopausa Chirurgica / Indotta">Sì - Menopausa Chirurgica / Indotta</option>
                            <option value="Menopausa in Terapia Ormonale (TOS)">Sì - In Terapia Ormonale (TOS)</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Il ciclo è regolare?</label>
                          <select
                            name="menstrual_cycle"
                            value={formData.menstrual_cycle}
                            onChange={handleChange}
                            className="form-control"
                          >
                            <option value="">-- Seleziona --</option>
                            <option value="Regolare">Sì, regolare (26-32 giorni)</option>
                            <option value="Irregolare / Oligomenorrea">No, irregolare / Oligomenorrea</option>
                            <option value="Dismenorrea (Doloroso)">Dismenorrea (Ciclo doloroso)</option>
                            <option value="Amenorrea (Assente)">Amenorrea (Assenza di ciclo)</option>
                            <option value="Sindrome Ovaio Policistico (PCOS)">Sindrome Ovaio Policistico (PCOS)</option>
                            <option value="Contraccettivo ormonale">In uso contraccettivo ormonale</option>
                            <option value="Assente per Menopausa / Gravidanza">Assente per Menopausa / Gravidanza</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Quanto dura il ciclo?</label>
                          <input
                            type="text"
                            value={q.cycle_duration || ''}
                            onChange={(e) => handleQChange('cycle_duration', e.target.value)}
                            placeholder="es. 4-5 giorni ogni 28 giorni"
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Uso di antinfiammatori / antidolorifici</label>
                          <input
                            type="text"
                            value={q.cycle_painkillers || ''}
                            onChange={(e) => handleQChange('cycle_painkillers', e.target.value)}
                            placeholder="es. No, Sì nei primi 2 giorni (Ibuprofene/Oki)..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Sintomi da annotare (PMS / Menopausa)</label>
                          <input
                            type="text"
                            value={q.cycle_symptoms || ''}
                            onChange={(e) => handleQChange('cycle_symptoms', e.target.value)}
                            placeholder="es. Gonfiore, ritenzione, fame di dolci, vampate..."
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 2. PARTO & GRAVIDANZA */}
                    <div
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                        2. Parto & Storia Gravidanza
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Quando hai partorito?</label>
                          <input
                            type="text"
                            value={q.childbirth_date || ''}
                            onChange={(e) => handleQChange('childbirth_date', e.target.value)}
                            placeholder="es. Nessun parto, oppure Marzo 2025..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Naturale o cesareo?</label>
                          <input
                            type="text"
                            name="childbirth_history"
                            value={formData.childbirth_history}
                            onChange={handleChange}
                            placeholder="es. Parto naturale, Taglio cesareo..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Peso indicativo prima della gravidanza</label>
                          <input
                            type="text"
                            value={q.pre_pregnancy_weight || ''}
                            onChange={(e) => handleQChange('pre_pregnancy_weight', e.target.value)}
                            placeholder="es. 60 kg"
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Diabete, ipertensione, anemia (in gravidanza/post)</label>
                          <input
                            type="text"
                            value={q.pregnancy_complications || ''}
                            onChange={(e) => handleQChange('pregnancy_complications', e.target.value)}
                            placeholder="es. Nessuna, Anemia sideropenica, Diabete gestazionale..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Esami del sangue recenti</label>
                          <input
                            type="text"
                            value={q.recent_blood_tests || ''}
                            onChange={(e) => handleQChange('recent_blood_tests', e.target.value)}
                            placeholder="es. Nella norma, Ferritina e Vit. D basse..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Variazioni di peso post-parto</label>
                          <input
                            type="text"
                            value={q.postpartum_weight_changes || ''}
                            onChange={(e) => handleQChange('postpartum_weight_changes', e.target.value)}
                            placeholder="es. +12 kg in gravidanza, rimasti +4 kg..."
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">È tornato il ciclo post-parto (Capoparto)?</label>
                          <input
                            type="text"
                            value={q.capoparto_returned || ''}
                            onChange={(e) => handleQChange('capoparto_returned', e.target.value)}
                            placeholder="es. Sì dopo 4 mesi, Non ancora..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Diastasi addominale</label>
                          <input
                            type="text"
                            value={q.diastasis_recti || ''}
                            onChange={(e) => handleQChange('diastasis_recti', e.target.value)}
                            placeholder="es. Assente, Lieve fisiologica, Diagnosticata..."
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 3. ALLATTAMENTO */}
                    <div
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                        3. Allattamento
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Stai ancora allattando / Stato attuale</label>
                          <select
                            name="pregnancy_lactation"
                            value={formData.pregnancy_lactation}
                            onChange={handleChange}
                            className="form-control"
                          >
                            <option value="">-- Seleziona --</option>
                            <option value="Nessuna">No (Né gravidanza né allattamento)</option>
                            <option value="Sì - In Allattamento">Sì, sto allattando</option>
                            <option value="Gravidanza - 1° Trimestre">In Gravidanza (1° Trimestre)</option>
                            <option value="Gravidanza - 2° Trimestre">In Gravidanza (2° Trimestre)</option>
                            <option value="Gravidanza - 3° Trimestre">In Gravidanza (3° Trimestre)</option>
                            <option value="Ricerca Gravidanza / PMA">Ricerca Gravidanza / PMA</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Allattamento esclusivo o misto?</label>
                          <select
                            value={q.breastfeeding_type || ''}
                            onChange={(e) => handleQChange('breastfeeding_type', e.target.value)}
                            className="form-control"
                          >
                            <option value="">-- Seleziona --</option>
                            <option value="Non applicabile">Non applicabile</option>
                            <option value="Esclusivo al seno">Esclusivo al seno</option>
                            <option value="Misto (Seno + Formula)">Misto (Seno + Formula)</option>
                            <option value="In fase di svezzamento">In fase di svezzamento</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Quante poppate nelle 24h?</label>
                          <input
                            type="text"
                            value={q.feedings_per_24h || ''}
                            onChange={(e) => handleQChange('feedings_per_24h', e.target.value)}
                            placeholder="es. 6-8 poppate a richiesta, 2 notturne..."
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Svezzamento</label>
                          <input
                            type="text"
                            value={q.weaning_notes || ''}
                            onChange={(e) => handleQChange('weaning_notes', e.target.value)}
                            placeholder="es. Non iniziato, Iniziato a 6 mesi (autosvezzamento/pappe)..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Riduzione produzione di latte?</label>
                          <input
                            type="text"
                            value={q.milk_reduction || ''}
                            onChange={(e) => handleQChange('milk_reduction', e.target.value)}
                            placeholder="es. No regolare, Lieve calo serale..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Intenzione di continuare ad allattare?</label>
                          <input
                            type="text"
                            value={q.continue_breastfeeding || ''}
                            onChange={(e) => handleQChange('continue_breastfeeding', e.target.value)}
                            placeholder="es. Sì fino all'anno, Vorrei scalare gradualmente..."
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. CONDIZIONI DEL NEONATO */}
                    <div
                      style={{
                        padding: '16px 18px',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-light)'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '12px' }}>
                        4. Condizioni del Neonato (se applicabile)
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Allergie diagnosticate o sospette (neonato)</label>
                          <input
                            type="text"
                            value={q.newborn_allergies || ''}
                            onChange={(e) => handleQChange('newborn_allergies', e.target.value)}
                            placeholder="es. Nessuna, Sospetta APLV (proteine latte vaccino)..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Disturbi gastrointestinali (neonato)</label>
                          <input
                            type="text"
                            value={q.newborn_gi_disorders || ''}
                            onChange={(e) => handleQChange('newborn_gi_disorders', e.target.value)}
                            placeholder="es. Coliche gassose, reflusso, stipsi..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: '10px' }}>
                          <label className="form-label">Problemi di crescita o aumenti di peso</label>
                          <input
                            type="text"
                            value={q.newborn_growth_issues || ''}
                            onChange={(e) => handleQChange('newborn_growth_issues', e.target.value)}
                            placeholder="es. Crescita regolare secondo percentili..."
                            className="form-control"
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Indicazioni pediatriche particolari / importanti</label>
                          <input
                            type="text"
                            value={q.newborn_pediatric_notes || ''}
                            onChange={(e) => handleQChange('newborn_pediatric_notes', e.target.value)}
                            placeholder="es. Nessuna in particolare..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Assume farmaci o integratori (neonato)?</label>
                          <input
                            type="text"
                            value={q.newborn_meds_supplements || ''}
                            onChange={(e) => handleQChange('newborn_meds_supplements', e.target.value)}
                            placeholder="es. Vitamina D, Fermenti lattici..."
                            className="form-control"
                          />
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label">Alimenti materni correlati a disturbi GI del neonato</label>
                          <input
                            type="text"
                            value={q.newborn_food_correlations || ''}
                            onChange={(e) => handleQChange('newborn_food_correlations', e.target.value)}
                            placeholder="es. Latticini, legumi, cioccolato..."
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}
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
