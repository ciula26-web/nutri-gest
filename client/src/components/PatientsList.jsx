import React, { useState } from 'react';
import {
  Search,
  UserPlus,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  FileText,
  Calendar,
  Phone,
  Mail,
  Edit2,
  Trash2
} from 'lucide-react';

export default function PatientsList({
  patients = [],
  onSelectPatient,
  onNewPatient,
  onEditPatient,
  onDeletePatient,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus
}) {
  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const getBmiBadge = (bmi) => {
    if (!bmi) return <span className="badge badge-muted">N/D</span>;
    if (bmi < 18.5) return <span className="badge bmi-underweight">Sottopeso ({bmi})</span>;
    if (bmi < 25) return <span className="badge bmi-normal">Normopeso ({bmi})</span>;
    if (bmi < 30) return <span className="badge bmi-overweight">Sovrappeso ({bmi})</span>;
    return <span className="badge bmi-obese">Obesità ({bmi})</span>;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="patients-list-view">
      {/* Barra Ricerca e Filtri */}
      <div className="card" style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 320px', position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Cerca per nome, cognome, codice fiscale o telefono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-control"
              style={{ width: 'auto', minWidth: '150px' }}
            >
              <option value="tutti">Tutti gli stati</option>
              <option value="attivo">Attivi</option>
              <option value="in_pausa">In Pausa</option>
              <option value="concluso">Conclusi</option>
            </select>

            <button onClick={onNewPatient} className="btn btn-primary">
              <UserPlus size={16} />
              <span>Nuovo Paziente</span>
            </button>
          </div>

        </div>
      </div>

      {/* Tabella Pazienti */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Elenco Pazienti ({patients.length})
          </h3>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Clicca su una riga per aprire la cartella clinica completa
          </span>
        </div>

        {patients.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nessun paziente trovato</p>
            <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>
              Modifica i filtri di ricerca oppure registra un nuovo paziente.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Paziente</th>
                  <th>Età / CF</th>
                  <th>Contatti</th>
                  <th>Peso Iniziale → Attuale</th>
                  <th>BMI</th>
                  <th>Dieta Assegnata</th>
                  <th>Ultima Visita</th>
                  <th style={{ textAlign: 'right' }}>Azioni</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const age = calculateAge(p.birth_date);
                  const weightDiff = (p.latest_weight && p.initial_weight)
                    ? Number((p.latest_weight - p.initial_weight).toFixed(1))
                    : 0;

                  return (
                    <tr
                      key={p.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectPatient(p.id)}
                    >
                      {/* Paziente */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '50%',
                            backgroundColor: p.gender === 'M' ? '#0284c7' : '#0d9488',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: '700',
                            fontSize: '0.85rem'
                          }}>
                            {p.first_name[0]}{p.last_name[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>
                              {p.last_name} {p.first_name}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {p.profession || (p.gender === 'M' ? 'Uomo' : 'Donna')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Età & CF */}
                      <td>
                        <div style={{ fontSize: '0.88rem', fontWeight: '500' }}>
                          {age ? `${age} anni` : '-'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                          {p.fiscal_code || '-'}
                        </div>
                      </td>

                      {/* Contatti */}
                      <td>
                        <div style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Phone size={13} style={{ color: 'var(--text-muted)' }} />
                          {p.phone || '-'}
                        </div>
                        {p.email && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                            <Mail size={12} />
                            {p.email}
                          </div>
                        )}
                      </td>

                      {/* Variazione Peso */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                            {p.initial_weight ? `${p.initial_weight}` : '-'} →
                          </span>
                          <strong style={{ fontSize: '0.95rem' }}>
                            {p.latest_weight ? `${p.latest_weight} kg` : '-'}
                          </strong>
                        </div>
                        {p.initial_weight && p.latest_weight && p.initial_weight !== p.latest_weight && (
                          <div style={{
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            color: weightDiff < 0 ? 'var(--success)' : 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                            marginTop: '2px'
                          }}>
                            {weightDiff < 0 ? <TrendingDown size={13} /> : <TrendingUp size={13} />}
                            {weightDiff > 0 ? `+${weightDiff}` : weightDiff} kg
                          </div>
                        )}
                      </td>

                      {/* BMI */}
                      <td>
                        {getBmiBadge(p.latest_bmi)}
                      </td>

                      {/* Dieta */}
                      <td>
                        {p.has_active_diet ? (
                          <span className="badge badge-success" title={p.active_diet_title}>
                            {p.active_diet_title.length > 20 ? p.active_diet_title.substring(0, 18) + '...' : p.active_diet_title}
                          </span>
                        ) : (
                          <span className="badge badge-muted">Nessuna</span>
                        )}
                      </td>

                      {/* Ultima Visita */}
                      <td>
                        <div style={{ fontSize: '0.85rem' }}>
                          {formatDate(p.latest_visit_date)}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {p.visits_count} {p.visits_count === 1 ? 'visita' : 'visite'}
                        </div>
                      </td>

                      {/* Azioni */}
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            onClick={() => onEditPatient(p)}
                            className="btn btn-secondary btn-icon-only"
                            title="Modifica Anagrafica"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDeletePatient(p.id, `${p.first_name} ${p.last_name}`)}
                            className="btn btn-danger btn-icon-only"
                            title="Elimina Paziente"
                          >
                            <Trash2 size={14} />
                          </button>
                          <button
                            onClick={() => onSelectPatient(p.id)}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '6px 10px' }}
                            title="Apri Cartella Clinica"
                          >
                            <span>Cartella</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
