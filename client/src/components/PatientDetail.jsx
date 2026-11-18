import React, { useState, useEffect, useRef } from 'react';
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
  Trash2,
  Upload,
  Eye,
  X,
  ExternalLink,
  ShieldCheck
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
import { showPopup, showConfirm } from '../utils/popup';
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
  refreshKey,
  onBack,
  onEditPatient,
  settings
}) {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weight'); // 'weight' | 'bia' | 'diets' | 'anamnesi'
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isPrivacyViewerOpen, setIsPrivacyViewerOpen] = useState(false);
  const [privacyBlobUrl, setPrivacyBlobUrl] = useState(null);
  const [uploadingPrivacy, setUploadingPrivacy] = useState(false);
  const privacyInputRef = useRef(null);

  useEffect(() => {
    if (isPrivacyViewerOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isPrivacyViewerOpen]);

  const handleOpenPrivacyViewer = async () => {
    try {
      const url = `${api.getPrivacyPdfUrl(patient.id)}?t=${Date.now()}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Impossibile caricare il documento PDF della privacy');
      }
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
      if (privacyBlobUrl) {
        URL.revokeObjectURL(privacyBlobUrl);
      }
      const objectUrl = URL.createObjectURL(blob);
      setPrivacyBlobUrl(objectUrl);
      setIsPrivacyViewerOpen(true);
    } catch (err) {
      showPopup(err.message || 'Errore apertura PDF privacy', 'error');
    }
  };

  const handleClosePrivacyViewer = () => {
    setIsPrivacyViewerOpen(false);
    if (privacyBlobUrl) {
      URL.revokeObjectURL(privacyBlobUrl);
      setPrivacyBlobUrl(null);
    }
  };

  useEffect(() => {
    loadPatientData();
  }, [patientId, refreshKey]);

  const handlePrivacyFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      showPopup('Seleziona un file in formato PDF (.pdf).', 'warning', 'Formato non valido');
      e.target.value = '';
      return;
    }

    try {
      setUploadingPrivacy(true);
      const dataBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Errore nella lettura del file PDF'));
        reader.readAsDataURL(file);
      });

      const cleanPatientName = `${patient.first_name || ''} ${patient.last_name || ''}`
        .trim()
        .replace(/[^a-zA-Z0-9À-ÿ\s_-]/g, '')
        .replace(/\s+/g, '_');

      await api.uploadPrivacyPdf(patient.id, {
        filename: `privacy_${cleanPatientName}.pdf`,
        dataBase64
      });

      await loadPatientData();
      showPopup('Documento PDF della dichiarazione privacy salvato con successo!', 'success', 'Privacy Salvata');
    } catch (err) {
      showPopup('Errore nel salvataggio del PDF: ' + err.message, 'error');
    } finally {
      setUploadingPrivacy(false);
      e.target.value = '';
    }
  };

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
      showPopup('Visita e parametri registrati con successo!', 'success', 'Visita Registrata');
    } catch (e) {
      showPopup('Errore salvataggio visita: ' + e.message, 'error');
    }
  };

  const handleDeleteVisit = async (visitId) => {
    const confirmed = await showConfirm(
      'Sei sicuro di voler eliminare questa visita e le relative misurazioni?',
      { title: 'Elimina Visita', confirmText: 'Elimina', danger: true }
    );
    if (confirmed) {
      try {
        await api.deleteVisit(visitId);
        loadPatientData();
        showPopup('Visita eliminata con successo.', 'success', 'Visita Eliminata');
      } catch (e) {
        showPopup('Errore eliminazione: ' + e.message, 'error');
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

        {/* BARRA DOCUMENTO PDF DICHIARAZIONE PRIVACY */}
        <div style={{
          marginTop: '18px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <ShieldCheck size={18} style={{ color: patient.privacy_pdf_name ? 'var(--success)' : 'var(--text-muted)' }} />
            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Dichiarazione Privacy (PDF):
            </span>
            {patient.privacy_pdf_name ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span className="badge badge-success" style={{ fontSize: '0.78rem' }}>
                  Presente ({patient.privacy_pdf_name})
                </span>
                {patient.privacy_pdf_date && (
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Caricato il {new Date(patient.privacy_pdf_date).toLocaleDateString('it-IT')}
                  </span>
                )}
              </div>
            ) : (
              <span className="badge badge-warning" style={{ fontSize: '0.78rem' }}>
                Nessun PDF caricato
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <input
              ref={privacyInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handlePrivacyFileChange}
              style={{ display: 'none' }}
            />

            {patient.privacy_pdf_name && (
              <button
                type="button"
                onClick={handleOpenPrivacyViewer}
                className="btn btn-primary btn-sm"
              >
                <Eye size={15} />
                <span>Visualizza PDF Privacy</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => privacyInputRef.current && privacyInputRef.current.click()}
              disabled={uploadingPrivacy}
              className={`btn ${patient.privacy_pdf_name ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            >
              <Upload size={15} />
              <span>
                {uploadingPrivacy
                  ? 'Salvataggio in corso...'
                  : patient.privacy_pdf_name
                  ? 'Sostituisci PDF Privacy'
                  : 'Salva PDF Privacy'}
              </span>
            </button>
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
                    <th>Peso</th>
                    <th>Δ Prec.</th>
                    <th>Altezza</th>
                    <th>BMI</th>
                    <th>Vita</th>
                    <th>Fianchi</th>
                    <th>WHR</th>
                    <th>Coscia</th>
                    <th>Bicipite</th>
                    <th>Collo</th>
                    <th>Note Cliniche</th>
                    <th style={{ textAlign: 'right' }}>Azioni</th>
                  </tr>
                </thead>
                <tbody>
                  {visits.slice().reverse().map((v, idx, arr) => {
                    const prevVisit = arr[idx + 1];
                    const deltaPrev = prevVisit ? Number((v.weight - prevVisit.weight).toFixed(1)) : 0;

                    return (
                      <tr key={v.id} style={{ whiteSpace: 'nowrap' }}>
                        <td style={{ fontWeight: 600 }}>
                          {new Date(v.visit_date).toLocaleDateString('it-IT')}
                        </td>
                        <td>
                          <span className="badge badge-primary">{v.visit_type}</span>
                        </td>
                        <td style={{ fontWeight: 800, fontSize: '0.95rem' }}>
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
                        <td>{v.height ? `${v.height} cm` : '-'}</td>
                        <td>{getBmiBadge(v.bmi)}</td>
                        <td>{v.waist_circ ? `${v.waist_circ} cm` : '-'}</td>
                        <td>{v.hip_circ ? `${v.hip_circ} cm` : '-'}</td>
                        <td style={{ fontWeight: v.whr ? 600 : 400 }}>{v.whr || '-'}</td>
                        <td>{v.thigh_circ ? `${v.thigh_circ} cm` : '-'}</td>
                        <td>{v.arm_circ ? `${v.arm_circ} cm` : '-'}</td>
                        <td>{v.neck_circ ? `${v.neck_circ} cm` : '-'}</td>
                        <td style={{ maxWidth: '220px', whiteSpace: 'normal', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
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
          <BiaView
            biaList={patient.bia_measurements || []}
            patient={patient}
            onRefresh={loadPatientData}
          />
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
      {activeTab === 'anamnesi' && (() => {
        const q = patient.questionnaire || (patient.questionnaire_json ? (() => { try { return JSON.parse(patient.questionnaire_json); } catch { return {}; } })() : {});
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            
            {/* Card Anagrafica, Recapiti & Attività Fisica */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <User size={18} style={{ color: 'var(--primary)' }} />
                  Anagrafica, Recapiti & Attività Fisica
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div><strong>Nome e Cognome:</strong> {patient.first_name} {patient.last_name}</div>
                <div><strong>Sesso Biologico:</strong> {patient.gender === 'M' ? 'Maschio' : 'Femmina'}</div>
                <div><strong>Data di Nascita:</strong> {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('it-IT') : '-'} ({age} anni)</div>
                <div><strong>Codice Fiscale:</strong> {patient.fiscal_code || '-'}</div>
                <div><strong>Professione:</strong> {patient.profession || '-'}</div>
                <div><strong>Indirizzo:</strong> {patient.address || '-'}</div>
                <div><strong>Telefono:</strong> {patient.phone || '-'}</div>
                <div><strong>Email:</strong> {patient.email || '-'}</div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '4px 0' }} />
                <div><strong>Attività Fisica (Sport):</strong> {patient.activity_level || '-'}{patient.sport_type ? ` (${patient.sport_type})` : ''}</div>
                <div><strong>Camminate Giornaliere:</strong> {q.daily_walks || '-'}</div>
                <div><strong>Movimento Giornaliero (Passi):</strong> {patient.daily_steps || '-'}</div>
                <div><strong>Obiettivo Nutrizionale:</strong> {patient.goal_description || '-'}</div>
              </div>
            </div>

            {/* Card Salute, Patologie, Allergie & Alvo */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Heart size={18} style={{ color: '#e11d48' }} />
                  Salute, Patologie & Alvo
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem' }}>
                <div>
                  <strong style={{ color: 'var(--danger)' }}>Allergie Alimentari: </strong>
                  {patient.allergies ? (
                    <span className="badge badge-danger" style={{ fontSize: '0.82rem' }}>{patient.allergies}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Nessuna</span>
                  )}
                </div>
                <div>
                  <strong style={{ color: '#b45309' }}>Intolleranze: </strong>
                  {patient.intolerances ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.82rem' }}>{patient.intolerances}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Nessuna</span>
                  )}
                </div>
                <div><strong>Patologie Diagnosticate:</strong> {patient.pathologies || '-'}</div>
                <div><strong>Terapia / Farmaci:</strong> {patient.medications || '-'}</div>
                <div><strong>Assunzione Integratori:</strong> {q.supplements_taken || '-'}</div>
                <div><strong>Disturbi Gastrointestinali:</strong> {q.gi_disorders || '-'}</div>
                <div><strong>Minzione:</strong> {q.urination || '-'}</div>
                <div><strong>Feci / Alvo:</strong> {q.bowel_movements || '-'}</div>
              </div>
            </div>

            {/* Card La Tua Alimentazione (Recall 24h) */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <UtensilsCrossed size={18} style={{ color: 'var(--success)' }} />
                  La Tua Alimentazione & Idratazione
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div><strong>Colazione ({q.breakfast_time || 'orario n/d'}):</strong> {q.breakfast_food || '-'}</div>
                <div><strong>Spuntini:</strong> {q.snacks_habit || '-'}</div>
                <div><strong>Pranzo ({q.lunch_time || 'orario n/d'}):</strong> {q.lunch_food || '-'}</div>
                <div><strong>Cena ({q.dinner_time || 'orario n/d'}):</strong> {q.dinner_food || '-'}</div>
                <div><strong>Dopo cena:</strong> {q.after_dinner_eating || '-'}</div>
                <div><strong>Alcolici:</strong> {q.alcohol_intake || '-'}</div>
                <div><strong>Caffè / Tè:</strong> {q.coffee_tea_intake || '-'}</div>
                <div><strong>Acqua bevuta:</strong> {q.water_intake || '-'}</div>
                {patient.lifestyle_notes && (
                  <div><strong>Note Stile di Vita:</strong> {patient.lifestyle_notes}</div>
                )}
              </div>
            </div>

            {/* Card Abitudini, Fame & Gusti */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <FileText size={18} style={{ color: 'var(--primary)' }} />
                  Abitudini, Fame & Preferenze
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div><strong>Momenti di maggiore fame:</strong> {q.hunger_moments || '-'}</div>
                <div><strong>Salta i pasti:</strong> {q.skip_meals || '-'}</div>
                <div><strong>Mangia velocemente:</strong> {q.eating_speed || '-'}</div>
                <div><strong>Mangia fuori casa:</strong> {q.eat_out_often || '-'}</div>
                <div><strong>Quanti pasti preferisce:</strong> {q.preferred_meals_count || '-'}</div>
                <div><strong>Struttura pasti preferita:</strong> {q.meals_structure_preference || '-'}</div>
                <div><strong>Necessità pasti veloci:</strong> {q.quick_meals_needed || '-'}</div>
                <hr style={{ border: 'none', borderTop: '1px solid var(--border-light)', margin: '4px 0' }} />
                <div><strong>Alimenti molto graditi:</strong> {q.liked_foods || '-'}</div>
                <div><strong>Da mangiare raramente:</strong> {q.rarely_liked_foods || '-'}</div>
                <div><strong>Da evitare assolutamente:</strong> {q.avoid_foods || '-'}</div>
                {patient.food_preferences && (
                  <div><strong>Altre preferenze:</strong> {patient.food_preferences}</div>
                )}
              </div>
            </div>

            {/* Card Sonno e Umore */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  <Clock size={18} style={{ color: '#0284c7' }} />
                  Sonno e Umore
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.88rem' }}>
                <div><strong>Ore di sonno per notte:</strong> {q.sleep_hours || '-'}</div>
                <div><strong>Qualità del sonno:</strong> {q.sleep_quality || '-'}</div>
                <div><strong>Minzione notturna (Nicturia):</strong> {q.nocturia || '-'}</div>
                <div><strong>Livello di stress:</strong> {q.stress_level || '-'}</div>
                <div><strong>Apnee notturne:</strong> {q.sleep_apnea || '-'}</div>
                <div><strong>Stanchezza diurna:</strong> {q.daytime_fatigue || '-'}</div>
                <div><strong>Dolori addominali notturni:</strong> {q.night_abdominal_pain || '-'}</div>
                <div><strong>Cena influisce sul sonno:</strong> {q.dinner_affects_sleep || '-'}</div>
                <div><strong>Ipertensione / Tachicardia notturna:</strong> {q.night_hypertension_tachycardia || '-'}</div>
              </div>
            </div>

            {/* Card Riservata alle Pazienti Donne (gender === 'F') */}
            {patient.gender === 'F' && (
              <div className="card" style={{ borderColor: '#fbcfe8' }}>
                <div className="card-header" style={{ borderBottomColor: '#fce7f3' }}>
                  <h3 className="card-title" style={{ color: '#be185d' }}>
                    <Heart size={18} style={{ color: '#db2777' }} />
                    Area Donna (Ciclo, Parto, Allattamento, Neonato)
                  </h3>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.86rem' }}>
                  <div style={{ fontWeight: 700, color: '#be185d', marginTop: '2px' }}>Ciclo Mestruale e Menopausa</div>
                  <div><strong>Prime mestruazioni (Menarca):</strong> {q.menarche_age || '-'}</div>
                  <div><strong>Menopausa:</strong> {patient.menopause || '-'}</div>
                  <div><strong>Regolarità ciclo:</strong> {patient.menstrual_cycle || '-'}</div>
                  <div><strong>Durata ciclo:</strong> {q.cycle_duration || '-'}</div>
                  <div><strong>Antinfiammatori / Antidolorifici:</strong> {q.cycle_painkillers || '-'}</div>
                  <div><strong>Sintomi annotati:</strong> {q.cycle_symptoms || '-'}</div>

                  <hr style={{ border: 'none', borderTop: '1px solid #fce7f3', margin: '4px 0' }} />
                  <div style={{ fontWeight: 700, color: '#be185d' }}>Parto & Gravidanza</div>
                  <div><strong>Quando ha partorito:</strong> {q.childbirth_date || '-'}</div>
                  <div><strong>Naturale o cesareo:</strong> {patient.childbirth_history || '-'}</div>
                  <div><strong>Peso pre-gravidanza:</strong> {q.pre_pregnancy_weight || '-'}</div>
                  <div><strong>Diabete / Ipertensione / Anemia:</strong> {q.pregnancy_complications || '-'}</div>
                  <div><strong>Esami del sangue recenti:</strong> {q.recent_blood_tests || '-'}</div>
                  <div><strong>Variazioni peso post-parto:</strong> {q.postpartum_weight_changes || '-'}</div>
                  <div><strong>Ritorno ciclo post-parto:</strong> {q.capoparto_returned || '-'}</div>
                  <div><strong>Diastasi addominale:</strong> {q.diastasis_recti || '-'}</div>

                  <hr style={{ border: 'none', borderTop: '1px solid #fce7f3', margin: '4px 0' }} />
                  <div style={{ fontWeight: 700, color: '#be185d' }}>Allattamento & Condizioni Neonato</div>
                  <div><strong>Stato allattamento / gravidanza:</strong> {patient.pregnancy_lactation || '-'}</div>
                  <div><strong>Tipo allattamento:</strong> {q.breastfeeding_type || '-'}</div>
                  <div><strong>Poppate nelle 24h:</strong> {q.feedings_per_24h || '-'}</div>
                  <div><strong>Svezzamento:</strong> {q.weaning_notes || '-'}</div>
                  <div><strong>Riduzione latte:</strong> {q.milk_reduction || '-'}</div>
                  <div><strong>Intenzione di continuare:</strong> {q.continue_breastfeeding || '-'}</div>
                  {(q.newborn_allergies || q.newborn_gi_disorders || q.newborn_growth_issues || q.newborn_pediatric_notes || q.newborn_meds_supplements || q.newborn_food_correlations) && (
                    <>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '4px' }}>Condizioni del Neonato:</div>
                      <div><strong>Allergie neonato:</strong> {q.newborn_allergies || '-'}</div>
                      <div><strong>Disturbi GI neonato:</strong> {q.newborn_gi_disorders || '-'}</div>
                      <div><strong>Crescita / Peso neonato:</strong> {q.newborn_growth_issues || '-'}</div>
                      <div><strong>Indicazioni pediatriche:</strong> {q.newborn_pediatric_notes || '-'}</div>
                      <div><strong>Farmaci/Integratori neonato:</strong> {q.newborn_meds_supplements || '-'}</div>
                      <div><strong>Alimenti correlati a disturbi GI:</strong> {q.newborn_food_correlations || '-'}</div>
                    </>
                  )}
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* Modale Registrazione Nuova Visita / BIA */}
      <NewVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        onSave={handleSaveVisit}
        patient={patient}
      />

      {/* Modale Visualizzazione PDF Dichiarazione Privacy */}
      {isPrivacyViewerOpen && patient.privacy_pdf_name && (
        <div
          className="modal-overlay"
          onClick={handleClosePrivacyViewer}
          style={{ zIndex: 1200 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '960px',
              width: '94vw',
              height: '88vh',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <div
              className="modal-header"
              style={{
                padding: '14px 20px',
                borderBottom: '1px solid var(--border-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexShrink: 0
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                    Dichiarazione Privacy — {patient.last_name} {patient.first_name}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {patient.privacy_pdf_name}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href={privacyBlobUrl || `${api.getPrivacyPdfUrl(patient.id)}?t=${Date.now()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  <span>Apri in nuova scheda</span>
                </a>
                <button
                  type="button"
                  onClick={handleClosePrivacyViewer}
                  className="btn btn-secondary btn-icon-only btn-sm"
                  title="Chiudi"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ position: 'relative', flex: 1, backgroundColor: '#525659', width: '100%', minHeight: '70vh' }}>
              <embed
                src={privacyBlobUrl || `${api.getPrivacyPdfUrl(patient.id)}?t=${Date.now()}`}
                type="application/pdf"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
