import React, { useState } from 'react';
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
    device_model: 'Analizzatore BIA Vettoriale',
    resistance_rz: '',
    reactance_xc: '',
    phase_angle: '',
    fat_mass_kg: '',
    fat_mass_percent: '',
    fat_free_mass_kg: '',
    fat_free_mass_percent: '',
    total_body_water_lt: '',
    total_body_water_percent: '',
    extracellular_water_lt: '',
    extracellular_water_percent: '',
    intracellular_water_lt: '',
    intracellular_water_percent: '',
    body_cell_mass_kg: '',
    body_cell_mass_percent: '',
    visceral_fat_level: '',
    basal_metabolic_rate: '',
    bia_vector_notes: ''
  });

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
                <div style={{ padding: '18px', backgroundColor: 'var(--bg-surface)' }}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Angolo di Fase (PhA °) *</label>
                      <input
                        type="number"
                        step="0.01"
                        name="phase_angle"
                        value={biaData.phase_angle}
                        onChange={handleBiaChange}
                        placeholder="es. 6.20"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Massa Grassa (FM %)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="fat_mass_percent"
                        value={biaData.fat_mass_percent}
                        onChange={handleBiaChange}
                        placeholder="es. 24.5"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Massa Grassa (FM kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="fat_mass_kg"
                        value={biaData.fat_mass_kg}
                        onChange={handleBiaChange}
                        placeholder="es. 16.8"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Massa Magra (FFM kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="fat_free_mass_kg"
                        value={biaData.fat_free_mass_kg}
                        onChange={handleBiaChange}
                        placeholder="es. 51.6"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Acqua Corporea Totale (TBW litri)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="total_body_water_lt"
                        value={biaData.total_body_water_lt}
                        onChange={handleBiaChange}
                        placeholder="es. 36.2"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Acqua Extracellulare (ECW litri)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="extracellular_water_lt"
                        value={biaData.extracellular_water_lt}
                        onChange={handleBiaChange}
                        placeholder="es. 16.5"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Massa Cellulare (BCM kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        name="body_cell_mass_kg"
                        value={biaData.body_cell_mass_kg}
                        onChange={handleBiaChange}
                        placeholder="es. 24.8"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Grasso Viscerale (Livello 1-20)</label>
                      <input
                        type="number"
                        step="0.5"
                        name="visceral_fat_level"
                        value={biaData.visceral_fat_level}
                        onChange={handleBiaChange}
                        placeholder="es. 5.5"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Resistenza Rz (Ohm)</label>
                      <input
                        type="number"
                        name="resistance_rz"
                        value={biaData.resistance_rz}
                        onChange={handleBiaChange}
                        placeholder="es. 580"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Reattanza Xc (Ohm)</label>
                      <input
                        type="number"
                        name="reactance_xc"
                        value={biaData.reactance_xc}
                        onChange={handleBiaChange}
                        placeholder="es. 58"
                        className="form-control"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Metabolismo Basale (BMR kcal)</label>
                      <input
                        type="number"
                        name="basal_metabolic_rate"
                        value={biaData.basal_metabolic_rate}
                        onChange={handleBiaChange}
                        placeholder="es. 1420"
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Note Vettoriali BIVA / Valutazione Idratazione</label>
                    <textarea
                      rows={2}
                      name="bia_vector_notes"
                      value={biaData.bia_vector_notes}
                      onChange={handleBiaChange}
                      placeholder="es. Vettore centrato nell'ellisse di confidenza al 50%. Normoidratazione e buona massa cellulare."
                      className="form-control"
                    />
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
