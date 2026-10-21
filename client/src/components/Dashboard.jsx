import React from 'react';
import {
  Users,
  Calendar,
  Scale,
  Activity,
  UtensilsCrossed,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function Dashboard({
  dashboardData,
  onSelectPatient,
  onNewPatient,
  onNewVisit,
  setCurrentView
}) {
  const { metrics, recentVisits = [], upcomingAppointments = [], recentPatients = [] } = dashboardData || {};

  const getBmiBadge = (bmi) => {
    if (!bmi) return null;
    if (bmi < 18.5) return <span className="badge bmi-underweight">Sottopeso ({bmi})</span>;
    if (bmi < 25) return <span className="badge bmi-normal">Normopeso ({bmi})</span>;
    if (bmi < 30) return <span className="badge bmi-overweight">Sovrappeso ({bmi})</span>;
    return <span className="badge bmi-obese">Obesità ({bmi})</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-view">
      {/* 4 Card Statistiche Principali */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon primary">
            <Users size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Pazienti Totali</span>
            <span className="stat-value">{metrics?.totalPatients || 0}</span>
            <span className="stat-subtext">{metrics?.activePatients || 0} in trattamento attivo</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cyan">
            <Scale size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Visite & Pesate</span>
            <span className="stat-value">{metrics?.totalVisits || 0}</span>
            <span className="stat-subtext">Storico consultazioni registrate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon success">
            <UtensilsCrossed size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Diete Attive</span>
            <span className="stat-value">{metrics?.activeDiets || 0}</span>
            <span className="stat-subtext">Piani alimentari settimanali in corso</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon secondary">
            <Activity size={26} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Analisi BIA</span>
            <span className="stat-value">{recentVisits.filter(v => v.weight).length || 0}</span>
            <span className="stat-subtext">Composizione corporea & idratazione</span>
          </div>
        </div>
      </div>

      {/* Grid 2 Colonne: Prossimi Appuntamenti e Ultime Visite */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        
        {/* Card Prossimi Appuntamenti */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={18} style={{ color: 'var(--primary)' }} />
              Prossimi Controlli Programmati
            </h3>
            <span className="badge badge-primary">{upcomingAppointments.length} in programma</span>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Clock size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>Nessun controllo programmato nei prossimi giorni.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingAppointments.map((app, idx) => (
                <div
                  key={idx}
                  onClick={() => onSelectPatient(app.patient_id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    backgroundColor: 'var(--bg-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-light)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: '700',
                      fontSize: '0.82rem',
                      textAlign: 'center'
                    }}>
                      {formatDate(app.next_appointment)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.92rem' }}>
                        {app.last_name} {app.first_name}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        Tel: {app.phone || 'Non specificato'}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Ultime Visite Effettuate */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Activity size={18} style={{ color: 'var(--secondary)' }} />
              Ultime Visite & Valutazioni
            </h3>
            <button
              onClick={() => setCurrentView('patients')}
              className="btn btn-secondary btn-sm"
            >
              Vedi Tutti
            </button>
          </div>

          {recentVisits.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Scale size={36} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p>Nessuna visita registrata di recente.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="modern-table">
                <thead>
                  <tr>
                    <th>Paziente</th>
                    <th>Data</th>
                    <th>Peso</th>
                    <th>BMI</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {recentVisits.map((v) => (
                    <tr
                      key={v.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectPatient(v.patient_id)}
                    >
                      <td style={{ fontWeight: '600' }}>
                        {v.last_name} {v.first_name}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        {formatDate(v.visit_date)}
                      </td>
                      <td style={{ fontWeight: '700' }}>
                        {v.weight} kg
                      </td>
                      <td>
                        {getBmiBadge(v.bmi)}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <ArrowRight size={15} style={{ color: 'var(--text-muted)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sezione Azioni Rapide */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Accesso Rapido e Operazioni Studio</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <button
            onClick={onNewPatient}
            className="btn btn-secondary"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: 'var(--primary)' }}>
              <UserPlus size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem' }}>Nuovo Paziente</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Registra anagrafica, anamnesi e obiettivi</span>
          </button>

          <button
            onClick={onNewVisit}
            className="btn btn-secondary"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--accent-cyan-light)', color: 'var(--accent-cyan)' }}>
              <Scale size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem' }}>Registra Visita / BIA</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Inserisci pesata, misure e bioimpedenziometria</span>
          </button>

          <button
            onClick={() => setCurrentView('diets')}
            className="btn btn-secondary"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--success-light)', color: 'var(--success)' }}>
              <UtensilsCrossed size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem' }}>Piani Alimentari</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gestione diete settimanali e stampa PDF</span>
          </button>

          <button
            onClick={() => setCurrentView('bia')}
            className="btn btn-secondary"
            style={{
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '8px',
              textAlign: 'left'
            }}
          >
            <div style={{ padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--secondary-light)', color: 'var(--secondary)' }}>
              <Activity size={22} />
            </div>
            <strong style={{ fontSize: '0.95rem' }}>Analisi BIA & Trend</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Monitoraggio massa grassa, magra e idratazione</span>
          </button>
        </div>
      </div>
    </div>
  );
}
