import React, { useState, useEffect } from 'react';
import { X, Scale, Activity, Plus, Check, ChevronDown, ChevronUp } from 'lucide-react';

export default function NewVisitModal({ isOpen, onClose, onSave, patient, defaultDate = '' }) {
  const today = new Date().toISOString().split('T')[0];

  const [visitData, setVisitData] = useState({
    visit_date: defaultDate || today,
    visit_type: 'Controllo',
    weight: '',
    height: patient?.height || '',
    waist_circ: '',
    hip_circ: '',
    arm_circ: '',
    thigh_circ: '',
    neck_circ: '',
    clinical_notes: '',
    next_appointment: ''
  });

  const [showBiaSection, setShowBiaSection] = useState(false);
  const [biaData, setBiaData] = useState({
    measurement_date: defaultDate || today,
    weight: '',
    bmi: '',
    fat_total: '',
    fat_arm_left: '',
    fat_arm_right: '',
    fat_leg_left: '',
    fat_leg_right: '',
    fat_trunk: '',
    muscle_total: '',
    muscle_arm_right: '',
    muscle_arm_left: '',
    muscle_leg_right: '',
    muscle_leg_left: '',
    muscle_trunk: '',
    mq_total: '',
    mq_arm_right: '',
    mq_arm_left: '',
    mq_leg_right: '',
    mq_leg_left: '',
    bone_mass: '',
    visceral_fat: '',
    metabolic_age: '',
    body_water: '',
    body_balance: ''
  });

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

  const handleVisitChange = (e) => {
    const { name, value } = e.target;
    setVisitData(prev => ({ ...prev, [name]: value }));
  };

  const handleBiaChange = (e) => {
    const { name, value } = e.target;
    setBiaData(prev => ({ ...prev, [name]: value }));
  };

  // Calcolo automatico BMI in anteprima
  const currentBmi = (visitData.weight && (visitData.height || patient?.height))
    ? (Number(visitData.weight) / Math.pow(Number(visitData.height || patient?.height) / 100, 2)).toFixed(1)
    : null;

  // Calcolo automatico WHR (Rapporto Vita/Fianchi)
  const currentWhr = (visitData.waist_circ && visitData.hip_circ)
    ? (Number(visitData.waist_circ) / Number(visitData.hip_circ)).toFixed(2)
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!visitData.weight || !visitData.visit_date) {
      alert('Data visita e Peso sono obbligatori.');
      return;
    }

    onSave({
      ...visitData,
      bia_data: showBiaSection ? biaData : null
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Scale size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Registra Nuova Visita & Pesata</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Paziente: <strong style={{ color: 'var(--text-primary)' }}>{patient?.first_name} {patient?.last_name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon-only">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">

            {/* Riga 1: Data e Tipo Visita */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Data Visita *</label>
                <input
                  type="date"
                  name="visit_date"
                  required
                  value={visitData.visit_date}
                  onChange={handleVisitChange}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tipo Visita</label>
                <select
                  name="visit_type"
                  value={visitData.visit_type}
                  onChange={handleVisitChange}
                  className="form-control"
                >
                  <option value="Prima Visita">Prima Visita</option>
                  <option value="Controllo">Controllo di Routine</option>

                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Prossimo Controllo</label>
                <input
                  type="date"
                  name="next_appointment"
                  value={visitData.next_appointment}
                  onChange={handleVisitChange}
                  className="form-control"
                />
              </div>
            </div>

            {/* Riga 2: Peso, Altezza e BMI calcolato */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Peso Rilevato (kg) *</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  name="weight"
                  value={visitData.weight}
                  onChange={handleVisitChange}
                  placeholder="es. 68.4"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Altezza (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  name="height"
                  value={visitData.height}
                  onChange={handleVisitChange}
                  placeholder="es. 165"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">BMI Calcolato</label>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-subtle)',
                  fontWeight: '700',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-light)'
                }}>
                  <span>{currentBmi ? `${currentBmi} kg/m²` : '-'}</span>
                  {patient?.initial_weight && visitData.weight && (
                    <span style={{
                      fontSize: '0.78rem',
                      color: Number(visitData.weight) <= Number(patient.initial_weight) ? 'var(--success)' : 'var(--danger)'
                    }}>
                      Δ tot: {(Number(visitData.weight) - Number(patient.initial_weight)).toFixed(1)} kg
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Circonferenze Corporee */}
            <div style={{ margin: '14px 0 10px', padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '0.84rem', fontWeight: '700', marginBottom: '10px', color: 'var(--text-secondary)' }}>
                Circonferenze Corporee (cm)
              </div>
              <div className="form-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Vita (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="waist_circ"
                    value={visitData.waist_circ}
                    onChange={handleVisitChange}
                    placeholder="es. 76"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Fianchi (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="hip_circ"
                    value={visitData.hip_circ}
                    onChange={handleVisitChange}
                    placeholder="es. 98"
                    className="form-control"
                  />
                </div>


                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Coscia (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="thigh_circ"
                    value={visitData.thigh_circ}
                    onChange={handleVisitChange}
                    placeholder="es. 54"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Bicipite (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="arm_circ"
                    value={visitData.arm_circ}
                    onChange={handleVisitChange}
                    placeholder="es. 28"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Collo (cm)</label>
                  <input
                    type="number"
                    step="0.5"
                    name="neck_circ"
                    value={visitData.neck_circ}
                    onChange={handleVisitChange}
                    placeholder="es. 36"
                    className="form-control"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">WHR (Vita/Fianchi)</label>
                  <div style={{ padding: '8px 10px', fontWeight: '700', color: 'var(--text-primary)', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', textAlign: 'center' }}>
                    {currentWhr || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Note Cliniche Visita */}
            <div className="form-group">
              <label className="form-label">Note Cliniche & Sintomi Riferiti</label>
              <textarea
                rows={2}
                name="clinical_notes"
                value={visitData.clinical_notes}
                onChange={handleVisitChange}
                placeholder="es. Ottima aderenza al piano alimentare, riduzione del senso di fame serale, alvo regolare..."
                className="form-control"
              />
            </div>

            {/* SEZIONE BIA (BIOIMPEDENZIOMETRIA) OPZIONALE */}
            <div style={{ marginTop: '16px', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
              <button
                type="button"
                onClick={() => setShowBiaSection(!showBiaSection)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  backgroundColor: showBiaSection ? 'var(--primary-light)' : 'var(--bg-subtle)',
                  color: showBiaSection ? 'var(--primary)' : 'var(--text-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.92rem'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} />
                  <span>Aggiungi Dati Analisi BIA (Bioimpedenziometria)</span>
                </span>
                {showBiaSection ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {showBiaSection && (
                <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Dati Generali BIA: Data, Peso, IMC */}
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Data</label>
                      <input
                        type="text"
                        name="measurement_date"
                        value={biaData.measurement_date}
                        onChange={handleBiaChange}
                        placeholder="es. 18/11/2026"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Peso</label>
                      <input
                        type="text"
                        name="weight"
                        value={biaData.weight !== '' ? biaData.weight : visitData.weight}
                        onChange={handleBiaChange}
                        placeholder="es. 68.5 kg"
                        className="form-control"
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">IMC</label>
                      <input
                        type="text"
                        name="bmi"
                        value={biaData.bmi !== '' ? biaData.bmi : (currentBmi || '')}
                        onChange={handleBiaChange}
                        placeholder="es. 23.7"
                        className="form-control"
                      />
                    </div>
                  </div>

                  {/* Grasso Corporeo (%) */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '10px' }}>
                      Grasso corporeo (%)
                    </div>
                    <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Totale (%)</label>
                        <input type="text" name="fat_total" value={biaData.fat_total} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Braccio sx</label>
                        <input type="text" name="fat_arm_left" value={biaData.fat_arm_left} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Braccio dx</label>
                        <input type="text" name="fat_arm_right" value={biaData.fat_arm_right} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gamba sx</label>
                        <input type="text" name="fat_leg_left" value={biaData.fat_leg_left} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gamba dx</label>
                        <input type="text" name="fat_leg_right" value={biaData.fat_leg_right} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tronco</label>
                        <input type="text" name="fat_trunk" value={biaData.fat_trunk} onChange={handleBiaChange} className="form-control" />
                      </div>
                    </div>
                  </div>

                  {/* Massa Muscolare (kg) */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '10px' }}>
                      Massa muscolare (kg)
                    </div>
                    <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Totale (kg)</label>
                        <input type="text" name="muscle_total" value={biaData.muscle_total} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Braccio dx</label>
                        <input type="text" name="muscle_arm_right" value={biaData.muscle_arm_right} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Braccio sx</label>
                        <input type="text" name="muscle_arm_left" value={biaData.muscle_arm_left} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gamba dx</label>
                        <input type="text" name="muscle_leg_right" value={biaData.muscle_leg_right} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gamba sx</label>
                        <input type="text" name="muscle_leg_left" value={biaData.muscle_leg_left} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Tronco</label>
                        <input type="text" name="muscle_trunk" value={biaData.muscle_trunk} onChange={handleBiaChange} className="form-control" />
                      </div>
                    </div>
                  </div>

                  {/* Qualità Massa Muscolare (MQ) */}
                  <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary)', marginBottom: '10px' }}>
                      Qualità massa muscolare (MQ)
                    </div>
                    <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Totale (MQ)</label>
                        <input type="text" name="mq_total" value={biaData.mq_total} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Braccio dx</label>
                        <input type="text" name="mq_arm_right" value={biaData.mq_arm_right} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Braccio sx</label>
                        <input type="text" name="mq_arm_left" value={biaData.mq_arm_left} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gamba dx</label>
                        <input type="text" name="mq_leg_right" value={biaData.mq_leg_right} onChange={handleBiaChange} className="form-control" />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Gamba sx</label>
                        <input type="text" name="mq_leg_left" value={biaData.mq_leg_left} onChange={handleBiaChange} className="form-control" />
                      </div>
                    </div>
                  </div>

                  {/* Altri Parametri BIA */}
                  <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Massa ossea</label>
                      <input type="text" name="bone_mass" value={biaData.bone_mass} onChange={handleBiaChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Grasso viscerale</label>
                      <input type="text" name="visceral_fat" value={biaData.visceral_fat} onChange={handleBiaChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Età metabolica</label>
                      <input type="text" name="metabolic_age" value={biaData.metabolic_age} onChange={handleBiaChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Acqua corporea</label>
                      <input type="text" name="body_water" value={biaData.body_water} onChange={handleBiaChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Equilibrio del corpo</label>
                      <input type="text" name="body_balance" value={biaData.body_balance} onChange={handleBiaChange} className="form-control" />
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={16} />
              <span>Salva Visita</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
