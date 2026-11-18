import React, { useState, useEffect } from 'react';
import {
  Activity,
  Plus,
  Edit2,
  Trash2,
  X,
  Check
} from 'lucide-react';
import { api } from '../api';
import { showPopup, showConfirm } from '../utils/popup';

const EMPTY_BIA_FORM = {
  measurement_date: '',
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
};

// Estrae i parametri unificati da un record BIA (nuovo formato JSON o colonne precedenti)
const extractBiaParams = (b) => {
  if (!b) return { ...EMPTY_BIA_FORM };
  const p = b.params || (() => {
    try {
      return b.bia_params_json ? JSON.parse(b.bia_params_json) : {};
    } catch {
      return {};
    }
  })();

  return {
    measurement_date: p.measurement_date !== undefined ? p.measurement_date : (b.measurement_date || ''),
    weight: p.weight !== undefined ? p.weight : (b.visit_weight !== undefined && b.visit_weight !== null ? String(b.visit_weight) : ''),
    bmi: p.bmi !== undefined ? p.bmi : (b.visit_bmi !== undefined && b.visit_bmi !== null ? String(b.visit_bmi) : ''),
    fat_total: p.fat_total !== undefined ? p.fat_total : (b.fat_mass_percent !== undefined && b.fat_mass_percent !== null ? String(b.fat_mass_percent) : ''),
    fat_arm_left: p.fat_arm_left || '',
    fat_arm_right: p.fat_arm_right || '',
    fat_leg_left: p.fat_leg_left || '',
    fat_leg_right: p.fat_leg_right || '',
    fat_trunk: p.fat_trunk || '',
    muscle_total: p.muscle_total !== undefined ? p.muscle_total : (b.fat_free_mass_kg !== undefined && b.fat_free_mass_kg !== null ? String(b.fat_free_mass_kg) : ''),
    muscle_arm_right: p.muscle_arm_right || '',
    muscle_arm_left: p.muscle_arm_left || '',
    muscle_leg_right: p.muscle_leg_right || '',
    muscle_leg_left: p.muscle_leg_left || '',
    muscle_trunk: p.muscle_trunk || '',
    mq_total: p.mq_total || '',
    mq_arm_right: p.mq_arm_right || '',
    mq_arm_left: p.mq_arm_left || '',
    mq_leg_right: p.mq_leg_right || '',
    mq_leg_left: p.mq_leg_left || '',
    bone_mass: p.bone_mass || '',
    visceral_fat: p.visceral_fat !== undefined ? p.visceral_fat : (b.visceral_fat_level !== undefined && b.visceral_fat_level !== null ? String(b.visceral_fat_level) : ''),
    metabolic_age: p.metabolic_age || '',
    body_water: p.body_water !== undefined ? p.body_water : (b.total_body_water_lt !== undefined && b.total_body_water_lt !== null ? String(b.total_body_water_lt) : ''),
    body_balance: p.body_balance || ''
  };
};

export default function BiaView({ biaList = [], patient = null, onRefresh }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBiaId, setEditingBiaId] = useState(null);
  const [formData, setFormData] = useState({ ...EMPTY_BIA_FORM });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isModalOpen]);

  const handleOpenNew = () => {
    const todayStr = new Date().toLocaleDateString('it-IT');
    setEditingBiaId(null);
    setFormData({
      ...EMPTY_BIA_FORM,
      measurement_date: todayStr,
      weight: patient?.latest_weight ? String(patient.latest_weight) : '',
      bmi: patient?.latest_bmi ? String(patient.latest_bmi) : ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (biaRecord) => {
    setEditingBiaId(biaRecord.id);
    setFormData(extractBiaParams(biaRecord));
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!patient?.id) return;

    try {
      setSaving(true);
      if (editingBiaId) {
        await api.updateBiaMeasurement(editingBiaId, formData);
        showPopup('Parametri BIA aggiornati con successo!', 'success', 'BIA Aggiornata');
      } else {
        await api.addBiaMeasurement(patient.id, formData);
        showPopup('Nuova rilevazione BIA salvata con successo!', 'success', 'BIA Salvata');
      }
      setIsModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      showPopup('Errore salvataggio BIA: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (biaId) => {
    const confirmed = await showConfirm(
      'Sei sicuro di voler eliminare questa rilevazione BIA?',
      { title: 'Elimina Rilevazione BIA', confirmText: 'Elimina', danger: true }
    );
    if (!confirmed) return;

    try {
      await api.deleteBiaMeasurement(biaId);
      showPopup('Rilevazione BIA eliminata.', 'success', 'BIA Eliminata');
      if (onRefresh) onRefresh();
    } catch (err) {
      showPopup('Errore eliminazione BIA: ' + err.message, 'error');
    }
  };

  const latestRecord = biaList.length > 0 ? biaList[biaList.length - 1] : null;
  const latest = latestRecord ? extractBiaParams(latestRecord) : null;

  return (
    <div className="bia-view-component">
      {/* Barra superiore Azioni BIA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '12px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Activity size={20} style={{ color: 'var(--primary)' }} />
            Parametri BIA (Bioimpedenziometria)
          </h3>
          {latest && (
            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Ultima rilevazione: <strong>{latest.measurement_date || '-'}</strong>
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {latestRecord && (
            <button
              type="button"
              onClick={() => handleOpenEdit(latestRecord)}
              className="btn btn-secondary btn-sm"
            >
              <Edit2 size={14} />
              <span>Modifica Ultima BIA</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleOpenNew}
            className="btn btn-primary btn-sm"
          >
            <Plus size={16} />
            <span>Nuova Rilevazione BIA</span>
          </button>
        </div>
      </div>

      {!latest ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <Activity size={48} style={{ margin: '0 auto 14px', opacity: 0.4, color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Nessuna Rilevazione BIA Registrata</h3>
          <p style={{ maxWidth: '500px', margin: '8px auto 18px', fontSize: '0.88rem' }}>
            Clicca su &ldquo;Nuova Rilevazione BIA&rdquo; per inserire i parametri di composizione corporea.
          </p>
          <button type="button" onClick={handleOpenNew} className="btn btn-primary">
            <Plus size={16} />
            <span>Inserisci Parametri BIA</span>
          </button>
        </div>
      ) : (
        <>
          {/* Riepilogo Dati Generali e Metabolici */}
          <div className="bia-grid" style={{ marginBottom: '20px' }}>
            <div className="bia-metric-card" style={{ borderLeft: '4px solid #0284c7' }}>
              <div className="bia-metric-title">Data</div>
              <div className="bia-metric-value" style={{ fontSize: '1.25rem', color: '#0284c7' }}>
                {latest.measurement_date || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #1e3a5f' }}>
              <div className="bia-metric-title">Peso</div>
              <div className="bia-metric-value" style={{ fontSize: '1.35rem', color: '#1e3a5f' }}>
                {latest.weight || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #0d9488' }}>
              <div className="bia-metric-title">IMC</div>
              <div className="bia-metric-value" style={{ fontSize: '1.35rem', color: '#0d9488' }}>
                {latest.bmi || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <div className="bia-metric-title">Massa Ossea</div>
              <div className="bia-metric-value" style={{ fontSize: '1.35rem', color: '#7c3aed' }}>
                {latest.bone_mass || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="bia-metric-title">Grasso Viscerale</div>
              <div className="bia-metric-value" style={{ fontSize: '1.35rem', color: '#dc2626' }}>
                {latest.visceral_fat || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #ec4899' }}>
              <div className="bia-metric-title">Età Metabolica</div>
              <div className="bia-metric-value" style={{ fontSize: '1.35rem', color: '#db2777' }}>
                {latest.metabolic_age || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
              <div className="bia-metric-title">Acqua Corporea</div>
              <div className="bia-metric-value" style={{ fontSize: '1.35rem', color: '#0284c7' }}>
                {latest.body_water || '-'}
              </div>
            </div>

            <div className="bia-metric-card" style={{ borderLeft: '4px solid #10b981' }}>
              <div className="bia-metric-title">Equilibrio del Corpo</div>
              <div className="bia-metric-value" style={{ fontSize: '1.25rem', color: '#059669' }}>
                {latest.body_balance || '-'}
              </div>
            </div>
          </div>

          {/* 3 Card Segmentali: Grasso Corporeo (%), Massa Muscolare (kg), Qualità Massa Muscolare (MQ) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            {/* Card 1: Grasso corporeo (%) */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '12px', paddingBottom: '10px' }}>
                <h4 className="card-title" style={{ fontSize: '1rem', color: '#d97706' }}>
                  Grasso corporeo (%)
                </h4>
                <span className="badge badge-warning" style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                  {latest.fat_total || '-'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Braccio sx:</span>
                  <strong>{latest.fat_arm_left || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Braccio dx:</span>
                  <strong>{latest.fat_arm_right || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Gamba sx:</span>
                  <strong>{latest.fat_leg_left || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Gamba dx:</span>
                  <strong>{latest.fat_leg_right || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tronco:</span>
                  <strong>{latest.fat_trunk || '-'}</strong>
                </div>
              </div>
            </div>

            {/* Card 2: Massa muscolare (kg) */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '12px', paddingBottom: '10px' }}>
                <h4 className="card-title" style={{ fontSize: '1rem', color: '#1e3a5f' }}>
                  Massa muscolare (kg)
                </h4>
                <span className="badge badge-primary" style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                  {latest.muscle_total || '-'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Braccio dx:</span>
                  <strong>{latest.muscle_arm_right || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Braccio sx:</span>
                  <strong>{latest.muscle_arm_left || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Gamba dx:</span>
                  <strong>{latest.muscle_leg_right || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Gamba sx:</span>
                  <strong>{latest.muscle_leg_left || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Tronco:</span>
                  <strong>{latest.muscle_trunk || '-'}</strong>
                </div>
              </div>
            </div>

            {/* Card 3: Qualità massa muscolare (MQ) */}
            <div className="card">
              <div className="card-header" style={{ marginBottom: '12px', paddingBottom: '10px' }}>
                <h4 className="card-title" style={{ fontSize: '1rem', color: '#0d9488' }}>
                  Qualità massa muscolare (MQ)
                </h4>
                <span className="badge badge-success" style={{ fontSize: '0.88rem', fontWeight: 800 }}>
                  {latest.mq_total || '-'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Braccio dx:</span>
                  <strong>{latest.mq_arm_right || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Braccio sx:</span>
                  <strong>{latest.mq_arm_left || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-light)', paddingBottom: '6px' }}>
                  <span>Gamba dx:</span>
                  <strong>{latest.mq_leg_right || '-'}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Gamba sx:</span>
                  <strong>{latest.mq_leg_left || '-'}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Storico Rilevazioni BIA */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Storico Rilevazioni BIA ({biaList.length})</h3>
            </div>
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Peso</th>
                    <th>IMC</th>
                    <th>Grasso Corporeo (%)</th>
                    <th>Massa Muscolare (kg)</th>
                    <th>Qualità Muscolare (MQ)</th>
                    <th>Massa Ossea</th>
                    <th>Grasso Visc.</th>
                    <th>Età Metab.</th>
                    <th>Acqua Corp.</th>
                    <th>Equilibrio</th>
                    <th style={{ textAlign: 'right' }}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {biaList.slice().reverse().map((record) => {
                    const p = extractBiaParams(record);
                    return (
                      <tr key={record.id} style={{ verticalAlign: 'top' }}>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{p.measurement_date || '-'}</td>
                        <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{p.weight || '-'}</td>
                        <td>{p.bmi || '-'}</td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div><strong>Tot:</strong> {p.fat_total || '-'}</div>
                          {(p.fat_arm_left || p.fat_arm_right || p.fat_leg_left || p.fat_leg_right || p.fat_trunk) && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                              B.sx: {p.fat_arm_left || '-'} | B.dx: {p.fat_arm_right || '-'}<br />
                              G.sx: {p.fat_leg_left || '-'} | G.dx: {p.fat_leg_right || '-'}<br />
                              Tronco: {p.fat_trunk || '-'}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div><strong>Tot:</strong> {p.muscle_total || '-'}</div>
                          {(p.muscle_arm_right || p.muscle_arm_left || p.muscle_leg_right || p.muscle_leg_left || p.muscle_trunk) && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                              B.dx: {p.muscle_arm_right || '-'} | B.sx: {p.muscle_arm_left || '-'}<br />
                              G.dx: {p.muscle_leg_right || '-'} | G.sx: {p.muscle_leg_left || '-'}<br />
                              Tronco: {p.muscle_trunk || '-'}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem' }}>
                          <div><strong>Tot:</strong> {p.mq_total || '-'}</div>
                          {(p.mq_arm_right || p.mq_arm_left || p.mq_leg_right || p.mq_leg_left) && (
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>
                              B.dx: {p.mq_arm_right || '-'} | B.sx: {p.mq_arm_left || '-'}<br />
                              G.dx: {p.mq_leg_right || '-'} | G.sx: {p.mq_leg_left || '-'}
                            </div>
                          )}
                        </td>
                        <td>{p.bone_mass || '-'}</td>
                        <td>{p.visceral_fat || '-'}</td>
                        <td>{p.metabolic_age || '-'}</td>
                        <td>{p.body_water || '-'}</td>
                        <td>{p.body_balance || '-'}</td>
                        <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(record)}
                              className="btn btn-secondary btn-icon-only btn-sm"
                              title="Modifica BIA"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(record.id)}
                              className="btn btn-danger btn-icon-only btn-sm"
                              title="Elimina BIA"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modale Inserimento / Modifica Parametri BIA */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 1100 }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '860px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Activity size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                    {editingBiaId ? 'Modifica Parametri BIA' : 'Nuova Rilevazione Parametri BIA'}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Tutti i campi sono liberamente editabili con numeri e lettere
                  </p>
                </div>
              </div>
              <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary btn-icon-only">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Data, Peso, IMC */}
                <div className="form-row">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Data</label>
                    <input
                      type="text"
                      name="measurement_date"
                      value={formData.measurement_date}
                      onChange={handleChange}
                      placeholder="es. 18/11/2026"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Peso</label>
                    <input
                      type="text"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      placeholder="es. 68.5 kg"
                      className="form-control"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">IMC</label>
                    <input
                      type="text"
                      name="bmi"
                      value={formData.bmi}
                      onChange={handleChange}
                      placeholder="es. 23.7"
                      className="form-control"
                    />
                  </div>
                </div>

                {/* Grasso corporeo (%) */}
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px' }}>
                    Grasso corporeo (%)
                  </div>
                  <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Totale (%)</label>
                      <input type="text" name="fat_total" value={formData.fat_total} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Braccio sx</label>
                      <input type="text" name="fat_arm_left" value={formData.fat_arm_left} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Braccio dx</label>
                      <input type="text" name="fat_arm_right" value={formData.fat_arm_right} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gamba sx</label>
                      <input type="text" name="fat_leg_left" value={formData.fat_leg_left} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gamba dx</label>
                      <input type="text" name="fat_leg_right" value={formData.fat_leg_right} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tronco</label>
                      <input type="text" name="fat_trunk" value={formData.fat_trunk} onChange={handleChange} className="form-control" />
                    </div>
                  </div>
                </div>

                {/* Massa muscolare (kg) */}
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px' }}>
                    Massa muscolare (kg)
                  </div>
                  <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Totale (kg)</label>
                      <input type="text" name="muscle_total" value={formData.muscle_total} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Braccio dx</label>
                      <input type="text" name="muscle_arm_right" value={formData.muscle_arm_right} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Braccio sx</label>
                      <input type="text" name="muscle_arm_left" value={formData.muscle_arm_left} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gamba dx</label>
                      <input type="text" name="muscle_leg_right" value={formData.muscle_leg_right} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gamba sx</label>
                      <input type="text" name="muscle_leg_left" value={formData.muscle_leg_left} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Tronco</label>
                      <input type="text" name="muscle_trunk" value={formData.muscle_trunk} onChange={handleChange} className="form-control" />
                    </div>
                  </div>
                </div>

                {/* Qualità massa muscolare (MQ) */}
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-light)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '10px' }}>
                    Qualità massa muscolare (MQ)
                  </div>
                  <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Totale (MQ)</label>
                      <input type="text" name="mq_total" value={formData.mq_total} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Braccio dx</label>
                      <input type="text" name="mq_arm_right" value={formData.mq_arm_right} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Braccio sx</label>
                      <input type="text" name="mq_arm_left" value={formData.mq_arm_left} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gamba dx</label>
                      <input type="text" name="mq_leg_right" value={formData.mq_leg_right} onChange={handleChange} className="form-control" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Gamba sx</label>
                      <input type="text" name="mq_leg_left" value={formData.mq_leg_left} onChange={handleChange} className="form-control" />
                    </div>
                  </div>
                </div>

                {/* Massa ossea, Grasso viscerale, Età metabolica, Acqua corporea, Equilibrio del corpo */}
                <div className="form-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Massa ossea</label>
                    <input type="text" name="bone_mass" value={formData.bone_mass} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Grasso viscerale</label>
                    <input type="text" name="visceral_fat" value={formData.visceral_fat} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Età metabolica</label>
                    <input type="text" name="metabolic_age" value={formData.metabolic_age} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Acqua corporea</label>
                    <input type="text" name="body_water" value={formData.body_water} onChange={handleChange} className="form-control" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Equilibrio del corpo</label>
                    <input type="text" name="body_balance" value={formData.body_balance} onChange={handleChange} className="form-control" />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
                  Annulla
                </button>
                <button type="submit" disabled={saving} className="btn btn-primary">
                  <Check size={16} />
                  <span>{saving ? 'Salvataggio...' : 'Salva Parametri BIA'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
