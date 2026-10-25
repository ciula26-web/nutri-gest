import React from 'react';
import {
  Activity,
  Droplets,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
  Layers,
  HeartPulse,
  Flame
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BiaView({ biaList = [], patient = null }) {
  if (!biaList || biaList.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
        <Activity size={48} style={{ margin: '0 auto 14px', opacity: 0.4, color: 'var(--secondary)' }} />
        <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>Nessuna Misurazione BIA Registrata</h3>
        <p style={{ maxWidth: '500px', margin: '8px auto 0', fontSize: '0.88rem' }}>
          La bioimpedenziometria (BIA) consente di valutare la composizione corporea qualitativa e quantitativa:
          massa grassa, massa magra, idratazione (TBW/ECW/ICW) e l'Angolo di Fase (PhA).
        </p>
      </div>
    );
  }

  const latest = biaList[biaList.length - 1];
  const first = biaList[0];
  const hasMultiple = biaList.length > 1;

  // Calcolo Delta prima vs ultima
  const deltaWeight = hasMultiple && latest.visit_weight && first.visit_weight
    ? Number((latest.visit_weight - first.visit_weight).toFixed(1))
    : null;

  const deltaFmKg = hasMultiple && latest.fat_mass_kg && first.fat_mass_kg
    ? Number((latest.fat_mass_kg - first.fat_mass_kg).toFixed(1))
    : null;

  const deltaFfmKg = hasMultiple && latest.fat_free_mass_kg && first.fat_free_mass_kg
    ? Number((latest.fat_free_mass_kg - first.fat_free_mass_kg).toFixed(1))
    : null;

  const deltaPhA = hasMultiple && latest.phase_angle && first.phase_angle
    ? Number((latest.phase_angle - first.phase_angle).toFixed(2))
    : null;

  const deltaTbw = hasMultiple && latest.total_body_water_lt && first.total_body_water_lt
    ? Number((latest.total_body_water_lt - first.total_body_water_lt).toFixed(1))
    : null;

  // Dati per Grafico FM vs FFM nel tempo
  const labels = biaList.map(b => {
    try {
      return new Date(b.measurement_date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    } catch {
      return b.measurement_date;
    }
  });

  const compositionChartData = {
    labels,
    datasets: [
      {
        label: 'Massa Grassa (FM kg)',
        data: biaList.map(b => b.fat_mass_kg),
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Massa Magra (FFM kg)',
        data: biaList.map(b => b.fat_free_mass_kg),
        borderColor: '#1e3a5f',
        backgroundColor: 'rgba(30, 58, 95, 0.15)',
        tension: 0.3,
        fill: true
      }
    ]
  };

  // Dati per Grafico Angolo di Fase nel tempo
  const phaseAngleChartData = {
    labels,
    datasets: [
      {
        label: 'Angolo di Fase (PhA °)',
        data: biaList.map(b => b.phase_angle),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        pointBackgroundColor: '#6366f1',
        pointRadius: 6,
        tension: 0.2
      }
    ]
  };

  // Dati per Grafico Fluidi (TBW, ECW, ICW)
  const fluidsChartData = {
    labels,
    datasets: [
      {
        label: 'Acqua Extracellulare ECW (L)',
        data: biaList.map(b => b.extracellular_water_lt),
        backgroundColor: '#38bdf8'
      },
      {
        label: 'Acqua Intracellulare ICW (L)',
        data: biaList.map(b => b.intracellular_water_lt),
        backgroundColor: '#0284c7'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { boxWidth: 12, font: { family: 'Inter', size: 11 } }
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="bia-view-component">
      {/* Intestazione ultima rilevazione */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--secondary)' }} />
            Ultima Valutazione BIA ({new Date(latest.measurement_date).toLocaleDateString('it-IT')})
          </h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Strumento: {latest.device_model || 'Analizzatore Bioimpedenziometrico'}
          </p>
        </div>

        {latest.phase_angle && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 18px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--secondary-light)',
            border: '1px solid rgba(99, 102, 241, 0.2)'
          }}>
            <Zap size={22} style={{ color: 'var(--secondary)' }} />
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', fontWeight: 600, color: 'var(--secondary)' }}>
                Angolo di Fase (PhA)
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#312e81', lineHeight: 1 }}>
                {latest.phase_angle}°
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid Parametri Chiave Ultima BIA */}
      <div className="bia-grid">
        {/* Massa Grassa FM */}
        <div className="bia-metric-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="bia-metric-title">Massa Grassa (FM)</div>
          <div className="bia-metric-value" style={{ color: '#d97706' }}>
            {latest.fat_mass_percent ? `${latest.fat_mass_percent}%` : '-'}
          </div>
          <div className="bia-metric-sub">
            {latest.fat_mass_kg ? `${latest.fat_mass_kg} kg` : 'kg non specificati'}
          </div>
        </div>

        {/* Massa Magra FFM */}
        <div className="bia-metric-card" style={{ borderLeft: '4px solid #1e3a5f' }}>
          <div className="bia-metric-title">Massa Magra (FFM)</div>
          <div className="bia-metric-value" style={{ color: '#1e3a5f' }}>
            {latest.fat_free_mass_percent ? `${latest.fat_free_mass_percent}%` : '-'}
          </div>
          <div className="bia-metric-sub">
            {latest.fat_free_mass_kg ? `${latest.fat_free_mass_kg} kg` : 'kg non specificati'}
          </div>
        </div>

        {/* Acqua Corporea TBW */}
        <div className="bia-metric-card" style={{ borderLeft: '4px solid #0284c7' }}>
          <div className="bia-metric-title">Acqua Totale (TBW)</div>
          <div className="bia-metric-value" style={{ color: '#0284c7' }}>
            {latest.total_body_water_lt ? `${latest.total_body_water_lt} L` : '-'}
          </div>
          <div className="bia-metric-sub">
            {latest.total_body_water_percent ? `${latest.total_body_water_percent}% del peso` : 'Idratazione corporea'}
          </div>
        </div>

        {/* Massa Cellulare BCM */}
        <div className="bia-metric-card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div className="bia-metric-title">Massa Cellulare (BCM)</div>
          <div className="bia-metric-value" style={{ color: '#7c3aed' }}>
            {latest.body_cell_mass_kg ? `${latest.body_cell_mass_kg} kg` : '-'}
          </div>
          <div className="bia-metric-sub">
            {latest.body_cell_mass_percent ? `${latest.body_cell_mass_percent}% su FFM` : 'Tessuto metabolicamente attivo'}
          </div>
        </div>

        {/* Grasso Viscerale */}
        <div className="bia-metric-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="bia-metric-title">Grasso Viscerale</div>
          <div className="bia-metric-value" style={{ color: latest.visceral_fat_level > 9 ? '#dc2626' : '#16a34a' }}>
            {latest.visceral_fat_level ? `Liv. ${latest.visceral_fat_level}` : '-'}
          </div>
          <div className="bia-metric-sub">
            {latest.visceral_fat_level <= 9 ? 'Intervallo di sicurezza (≤9)' : 'Attenzione: rischio cardiovascolare'}
          </div>
        </div>

        {/* Metabolismo Basale BMR */}
        <div className="bia-metric-card" style={{ borderLeft: '4px solid #ec4899' }}>
          <div className="bia-metric-title">BMR Stimato</div>
          <div className="bia-metric-value" style={{ color: '#db2777' }}>
            {latest.basal_metabolic_rate ? `${latest.basal_metabolic_rate} kcal` : '-'}
          </div>
          <div className="bia-metric-sub">Dispendio a riposo</div>
        </div>
      </div>

      {/* Note Vettoriali e Interpretazione Clinica */}
      {latest.bia_vector_notes && (
        <div style={{
          backgroundColor: 'var(--bg-subtle)',
          padding: '16px 20px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '24px',
          border: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ fontSize: '0.88rem', display: 'block', marginBottom: '2px' }}>
              Valutazione Vettoriale & Stato di Idratazione
            </strong>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
              {latest.bia_vector_notes}
            </p>
          </div>
        </div>
      )}

      {/* CARD CONFRONTO: Prima Visita vs Ultima Visita */}
      {hasMultiple && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <TrendingDown size={18} style={{ color: 'var(--success)' }} />
              Confronto Evolutivo: Prima Visita vs Ultima Visita
            </h3>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Periodo dal {new Date(first.measurement_date).toLocaleDateString('it-IT')} al {new Date(latest.measurement_date).toLocaleDateString('it-IT')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            
            {/* Variazione Peso */}
            {deltaWeight !== null && (
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Peso Corporeo</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                  {first.visit_weight} → {latest.visit_weight} kg
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: deltaWeight < 0 ? 'var(--success)' : 'var(--danger)',
                  marginTop: '4px'
                }}>
                  {deltaWeight > 0 ? `+${deltaWeight}` : deltaWeight} kg
                </div>
              </div>
            )}

            {/* Variazione Massa Grassa */}
            {deltaFmKg !== null && (
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Massa Grassa (FM)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                  {first.fat_mass_kg} → {latest.fat_mass_kg} kg
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: deltaFmKg < 0 ? 'var(--success)' : 'var(--danger)',
                  marginTop: '4px'
                }}>
                  {deltaFmKg > 0 ? `+${deltaFmKg}` : deltaFmKg} kg
                </div>
              </div>
            )}

            {/* Variazione Massa Magra */}
            {deltaFfmKg !== null && (
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Massa Magra (FFM)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                  {first.fat_free_mass_kg} → {latest.fat_free_mass_kg} kg
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: deltaFfmKg >= 0 ? 'var(--success)' : '#d97706',
                  marginTop: '4px'
                }}>
                  {deltaFfmKg > 0 ? `+${deltaFfmKg}` : deltaFfmKg} kg
                </div>
              </div>
            )}

            {/* Variazione Angolo di Fase */}
            {deltaPhA !== null && (
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-subtle)', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Angolo di Fase (PhA)</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '2px' }}>
                  {first.phase_angle}° → {latest.phase_angle}°
                </div>
                <div style={{
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: deltaPhA >= 0 ? 'var(--success)' : 'var(--danger)',
                  marginTop: '4px'
                }}>
                  {deltaPhA > 0 ? `+${deltaPhA}` : deltaPhA}°
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* GRAFICI TEMPORALI BIA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '24px' }}>
        
        {/* Grafico 1: Massa Grassa vs Massa Magra */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title" style={{ fontSize: '1rem' }}>
              <Layers size={16} style={{ color: 'var(--primary)' }} />
              Evoluzione Massa Grassa (FM) vs Massa Magra (FFM)
            </h4>
          </div>
          <div style={{ height: '260px' }}>
            <Line data={compositionChartData} options={chartOptions} />
          </div>
        </div>

        {/* Grafico 2: Trend Angolo di Fase */}
        <div className="card">
          <div className="card-header">
            <h4 className="card-title" style={{ fontSize: '1rem' }}>
              <Zap size={16} style={{ color: 'var(--secondary)' }} />
              Trend Angolo di Fase (° PhA - Integrità Cellulare)
            </h4>
          </div>
          <div style={{ height: '260px' }}>
            <Line data={phaseAngleChartData} options={chartOptions} />
          </div>
        </div>

      </div>
    </div>
  );
}
