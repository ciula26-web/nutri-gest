import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Scale,
  Activity,
  UtensilsCrossed,
  Plus,
  Edit2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertTriangle,
  Heart,
  TrendingDown,
  TrendingUp,
  Target,
  FileText,
  Clock,
  Trash2
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import BiaView from './BiaView';
import DietPlanner from './DietPlanner';
import NewVisitModal from './NewVisitModal';
import { api } from '../api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function PatientDetail({
  patientId,
  onBack,
  onEditPatient,
  settings
}) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' | 'bia' | 'diets' | 'anamnesi'
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const data = await api.getPatient(patientId);
      setPatient(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVisit = async (visitPayload) => {
    try {
      await api.addVisit(patient.id, visitPayload);
      setIsVisitModalOpen(false);
      loadPatientData();
      alert('Visita e parametri registrati con successo!');
    } catch (e) {
      alert('Errore salvataggio visita: ' + e.message);
    }
  };

  const handleDeleteVisit = async (visitId) => {
    if (confirm('Sei sicuro di voler eliminare questa visita e le relative misurazioni?')) {
      try {
        await api.deleteVisit(visitId);
        loadPatientData();
      } catch (e) {
        alert('Errore eliminazione: ' + e.message);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
        Caricamento cartella paziente...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
        <h3>Paziente non trovato</h3>
        <button onClick={onBack} className="btn btn-primary" style={{ marginTop: '16px' }}>
          Torna all'elenco
        </button>
      </div>
    );
  }

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const age = calculateAge(patient.birth_date);
  const visits = patient.visits || [];
  const latestWeight = patient.latest_weight || patient.initial_weight;
  const initialWeight = patient.initial_weight;
  const targetWeight = patient.target_weight;

  // Calcolo progresso percentuale verso il target
  let progressPercent = 0;
  if (initialWeight && targetWeight && latestWeight && initialWeight !== targetWeight) {
    const totalToLoseOrGain = initialWeight - targetWeight;
    const currentProgress = initialWeight - latestWeight;
    progressPercent = Math.min(Math.max(Math.round((currentProgress / totalToLoseOrGain) * 100), 0), 100);
  }

  // Dati per Grafico Andamento Peso nel tempo
  const weightLabels = visits.map(v => {
    try {
      return new Date(v.visit_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    } catch {
      return v.visit_date;
    }
  });

  const weightValues = visits.map(v => v.weight);

  const weightChartData = {
    labels: weightLabels,
    datasets: [
      {
        label: 'Peso Rilevato (kg)',
        data: weightValues,
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.1)',
        pointBackgroundColor: '#1e3a5f',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.25,
        fill: true
      },
      ...(targetWeight ? [{
        label: `Obiettivo (${targetWeight} kg)`,
        data: Array(weightLabels.length).fill(targetWeight),
        borderColor: '#10b981',
        borderDash: [6, 6],
        pointRadius: 0,
        fill: false
      }] : [])
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { family: 'Inter', size: 12 } }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: { font: { family: 'Inter' } }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  const getBmiBadge = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return <span className="badge bmi-underweight">Sottopeso ({bmi})</span>;
    if (bmi < 25) return <span className="badge bmi-normal">Normopeso ({bmi})</span>;
    if (bmi < 30) return <span className="badge bmi-overweight">Sovrappeso ({bmi})</span>;
    return <span className="badge bmi-obese">Obesità ({bmi})</span>;
  };

  return (
    <div className="patient-detail-view">
      {/* Barra Superiore: Torna Indietro e Azioni Rapide */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm">
          <ArrowLeft size={16} />
          <span>Torna all'elenco pazienti</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={() => onEditPatient(patient)} className="btn btn-secondary btn-sm">
            <Edit2 size={14} />
            <span>Modifica Anagrafica</span>
          </button>

          <button onClick={() => setIsVisitModalOpen(true)} className="btn btn-primary btn-sm">
            <Plus size={16} />
            <span>Registra Nuova Visita / BIA</span>
          </button>
        </div>
      </div>

      {/* HEADER CARTELLA CLINICA PAZIENTE */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '20px' }}>
          
          {/* Identità Paziente */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              backgroundColor: patient.gender === 'M' ? '#0284c7' : '#0d9488',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.4rem'
            }}>
              {patient.first_name[0]}{patient.last_name[0]}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0 }}>
                  {patient.last_name} {patient.first_name}
                </h2>
                <span className={`badge ${patient.status === 'attivo' ? 'badge-success' : 'badge-muted'}`}>
                  {patient.status.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '14px', marginTop: '4px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {age && <span>{age} anni</span>}
                {patient.birth_date && <span>Nato/a il {new Date(patient.birth_date).toLocaleDateString('it-IT')}</span>}
                {patient.fiscal_code && <span style={{ fontFamily: 'monospace' }}>CF: {patient.fiscal_code}</span>}
                {patient.phone && <span>Tel: {patient.phone}</span>}
              </div>
            </div>
          </div>

          {/* Metric Box Veloci */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
            {/* Peso Attuale e Delta */}
            <div style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              minWidth: '130px'
            }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Peso Attuale
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {latestWeight} <span style={{ fontSize: '0.85rem' }}>kg</span>
              </div>
              {patient.weight_diff_total !== undefined && patient.weight_diff_total !== 0 && (
                <div style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: patient.weight_diff_total < 0 ? 'var(--success)' : 'var(--danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  {patient.weight_diff_total < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                  {patient.weight_diff_total > 0 ? `+${patient.weight_diff_total}` : patient.weight_diff_total} kg tot
                </div>
              )}
            </div>

            {/* Altezza & BMI */}
            <div style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-light)',
              minWidth: '130px'
            }}>
              <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
                Altezza & BMI
              </span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {patient.height || '-'} <span style={{ fontSize: '0.85rem' }}>cm</span>
              </div>
              <div style={{ marginTop: '2px' }}>
                {getBmiBadge(patient.latest_bmi || (patient.height && patient.initial_weight ? (patient.initial_weight / Math.pow(patient.height/100, 2)).toFixed(1) : null))}
              </div>
            </div>

            {/* Target & Obiettivo */}
            {targetWeight && (
              <div style={{
                padding: '10px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary-border)',
                minWidth: '150px'
              }}>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700 }}>
                  Target: {targetWeight} kg
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: 'rgba(13,148,136,0.2)', overflow: 'hidden' }}>
                    <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--primary)', transition: 'width 0.4s ease' }}></div>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {progressPercent}%
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Mancano: {Math.abs(Number((latestWeight - targetWeight).toFixed(1)))} kg
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* NAVIGAZIONE INTERNA A TAB */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '24px',
        gap: '8px',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('weight')}
          className={`btn ${activeTab === 'weight' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Scale size={16} />
          <span>Andamento Peso & Visite ({visits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bia')}
          className={`btn ${activeTab === 'bia' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <Activity size={16} />
          <span>Analisi BIA ({patient.bia_measurements?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('diets')}
          className={`btn ${activeTab === 'diets' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <UtensilsCrossed size={16} />
          <span>Piani Alimentari ({patient.diets?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('anamnesi')}
          className={`btn ${activeTab === 'anamnesi' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: 'var(--radius-md) var(--radius-md) 0 0', borderBottom: 'none' }}
        >
          <FileText size={16} />
          <span>Anamnesi & Dati Clinici</span>
        </button>
      </div>

      {/* ==========================================
          TAB 1: ANDAMENTO PESO & VISITE
          ========================================== */}
      {activeTab === 'weight' && (
        <div>
          {/* Grafico Temporale Peso */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">
                <Scale size={18} style={{ color: 'var(--primary)' }} />
                Curva Ponderale nel Tempo
              </h3>
              <button onClick={() => setIsVisitModalOpen(true)} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>Aggiungi Pesata</span>
              </button>
            </div>

            {visits.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Nessuna pesata registrata. Clicca su "Aggiungi Pesata" per inserire la prima visita.
              </div>
            ) : (
              <div style={{ height: '300px' }}>
                <Line data={weightChartData} options={chartOptions} />
              </div>
            )}
          </div>

          {/* Tabella Storico Visite e Circonferenze */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                Storico Visite e Misure Antropometriche
              </h3>
            </div>

            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Data Visita</th>
                    <th>Tipo</th>
                    <th>Peso (kg)</th>
                    <th>Δ Visita Prec.</th>
                    <th>BMI</th>
                    <th>Vita / Fianchi (WHR)</th>
                    <th>Note Cliniche</th>
                    <th style={{ textAlign: 'right' }}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.slice().reverse().map((v, idx, arr) => {
                    const prevVisit = arr[idx + 1];
                    const deltaPrev = prevVisit ? Number((v.weight - prevVisit.weight).toFixed(1)) : 0;

                    return (
                      <tr key={v.id}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(v.visit_date).toLocaleDateString('it-IT')}
                        </td>
                        <td>
                          <span className="badge badge-primary">{v.visit_type}</span>
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '0.98rem' }}>
                          {v.weight} kg
                        </td>
                        <td>
                          {prevVisit ? (
                            <span style={{
                              fontWeight: 700,
                              color: deltaPrev <= 0 ? 'var(--success)' : 'var(--danger)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              {deltaPrev < 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                              {deltaPrev > 0 ? `+${deltaPrev}` : deltaPrev} kg
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>-</span>
                          )}
                        </td>
                        <td>
                          {getBmiBadge(v.bmi)}
                        </td>
                        <td>
                          <div>
                            {v.waist_circ ? `${v.waist_circ} cm` : '-'}
                            {v.hip_circ ? ` / ${v.hip_circ} cm` : ''}
                            {v.whr ? ` (WHR: ${v.whr})` : ''}
                          </div>
                          {(v.abdomen_circ || v.thigh_circ || v.arm_circ || v.neck_circ) && (
                            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2' }}>
                              {[
                                v.abdomen_circ && `Addome: ${v.abdomen_circ}`,
                                v.thigh_circ && `Coscia: ${v.thigh_circ}`,
                                v.arm_circ && `Bicipite: ${v.arm_circ}`,
                                v.neck_circ && `Collo: ${v.neck_circ}`
                              ].filter(Boolean).join(' • ')} cm
                            </div>
                          )}
                        </td>
                        <td style={{ maxWidth: '250px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {v.clinical_notes || '-'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleDeleteVisit(v.id)}
                            className="btn btn-danger btn-icon-only btn-sm"
                            title="Elimina Visita"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: ANALISI BIOIMPEDENZIOMETRIA (BIA)
          ========================================== */}
      {activeTab === 'bia' && (
        <div>
          <BiaView biaList={patient.bia_measurements || []} patient={patient} />
        </div>
      )}

      {/* ==========================================
          TAB 3: DIETE & PIANI ALIMENTARI
          ========================================== */}
      {activeTab === 'diets' && (
        <div>
          <DietPlanner
            patient={patient}
            settings={settings}
          />
        </div>
      )}

      {/* ==========================================
          TAB 4: ANAMNESI & DATI CLINICI
          ========================================== */}
      {activeTab === 'anamnesi' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
          
          {/* Card Anagrafica & Recapiti */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <User size={18} style={{ color: 'var(--primary)' }} />
                Anagrafica & Recapiti
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
              <div><strong>Nome e Cognome:</strong> {patient.first_name} {patient.last_name}</div>
              <div><strong>Sesso Biologico:</strong> {patient.gender === 'M' ? 'Maschio' : 'Femmina'}</div>
              <div><strong>Data di Nascita:</strong> {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('it-IT') : '-'} ({age} anni)</div>
              <div><strong>Codice Fiscale:</strong> {patient.fiscal_code || '-'}</div>
              <div><strong>Professione:</strong> {patient.profession || '-'}</div>
              <div><strong>Indirizzo:</strong> {patient.address || '-'}</div>
              <div><strong>Telefono:</strong> {patient.phone || '-'}</div>
              <div><strong>Email:</strong> {patient.email || '-'}</div>
              <div><strong>Livello Attività Fisica:</strong> {patient.activity_level}</div>
            </div>
          </div>

          {/* Card Allergie & Intolleranze */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
                Allergie & Intolleranze
              </h3>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <strong style={{ color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>
                Allergie Alimentari:
              </strong>
              {patient.allergies ? (
                <div className="badge badge-danger" style={{ fontSize: '0.85rem' }}>
                  {patient.allergies}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Nessuna allergia segnalata</span>
              )}
            </div>

            <div>
              <strong style={{ color: '#b45309', display: 'block', marginBottom: '4px' }}>
                Intolleranze:
              </strong>
              {patient.intolerances ? (
                <div className="badge badge-warning" style={{ fontSize: '0.85rem' }}>
                  {patient.intolerances}
                </div>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>Nessuna intolleranza segnalata</span>
              )}
            </div>
          </div>

          {/* Card Patologie & Farmaci */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Heart size={18} style={{ color: '#e11d48' }} />
                Patologie & Terapie Farmacologiche
              </h3>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <strong>Patologie Riferite / Diagnosticate:</strong>
              <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {patient.pathologies || 'Nessuna patologia rilevante segnalata.'}
              </p>
            </div>

            <div>
              <strong>Farmaci e Integratori in Uso:</strong>
              <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {patient.medications || 'Nessun farmaco in uso continuativo.'}
              </p>
            </div>
          </div>

          {/* Card Stile di Vita e Gusti */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <UtensilsCrossed size={18} style={{ color: 'var(--success)' }} />
                Stile di Vita & Preferenze Alimentari
              </h3>
            </div>
            <div style={{ marginBottom: '14px' }}>
              <strong>Obiettivo Dichiarato:</strong>
              <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {patient.goal_description || '-'}
              </p>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <strong>Stile di Vita & Orari:</strong>
              <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {patient.lifestyle_notes || '-'}
              </p>
            </div>

            <div>
              <strong>Cibi Graditi / Non Graditi:</strong>
              <p style={{ marginTop: '4px', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                {patient.food_preferences || '-'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* Modale Registrazione Nuova Visita / BIA */}
      <NewVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSave={handleSaveVisit}
        patient={patient}
      />
    </div>
  );
}
