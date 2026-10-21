import React from 'react';
import { X, Printer, Download, Sparkles, Check } from 'lucide-react';

export default function DietPrintModal({ isOpen, onClose, diet, patient, settings }) {
  if (!isOpen || !diet) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '960px', maxHeight: '95vh', overflow: 'hidden' }}
      >
        <div className="modal-header no-print">
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>Anteprima e Stampa Piano Alimentare</h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Layout professionale ottimizzato per la consegna e stampa PDF al paziente
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={handlePrint} className="btn btn-primary btn-sm">
              <Printer size={16} />
              <span>Stampa / Salva in PDF</span>
            </button>
            <button onClick={onClose} className="btn btn-secondary btn-icon-only">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* CONTENUTO FOGLIO A4 STAMPABILE */}
        <div className="modal-body" style={{ padding: '36px 40px', backgroundColor: '#ffffff', color: '#1e293b' }}>
          
          {/* Intestazione Medico / Studio */}
          <div className="diet-print-header" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid #0d9488',
            paddingBottom: '16px',
            marginBottom: '22px'
          }}>
            <div>
              <h2 style={{ fontSize: '1.45rem', color: '#0d9488', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                {settings?.studio_name || 'Studio di Nutrizione e Dietologia'}
              </h2>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {settings?.nutritionist_name || 'Dott.ssa Nutrizionista'}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569' }}>
                {settings?.title || 'Biologa Nutrizionista - Spec. in Scienze dell\'Alimentazione'}
              </div>
              {settings?.orders_code && (
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  {settings.orders_code}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#475569', lineHeight: 1.5 }}>
              <div>{settings?.address || 'Studio Medico'}</div>
              <div>Tel: {settings?.phone || '-'}</div>
              <div>Email: {settings?.email || '-'}</div>
              {settings?.vat_piva && <div>{settings.vat_piva}</div>}
            </div>
          </div>

          {/* Dati Paziente & Dati Piano */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.3fr 1fr',
            gap: '16px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '14px 18px',
            marginBottom: '22px'
          }}>
            <div>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Paziente
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a' }}>
                {patient?.first_name} {patient?.last_name}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                {patient?.birth_date ? `Nato/a il ${formatDate(patient.birth_date)}` : ''} 
                {patient?.fiscal_code ? ` - CF: ${patient.fiscal_code}` : ''}
              </div>
              {patient?.allergies && (
                <div style={{ fontSize: '0.8rem', color: '#b91c1c', fontWeight: 600, marginTop: '4px' }}>
                  Allergie segnalate: {patient.allergies}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                Piano Nutrizionale Personalizzato
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0d9488' }}>
                {diet.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: '2px' }}>
                Data emissione: {formatDate(diet.start_date)}
                {diet.target_calories ? ` • Target: ${diet.target_calories} kcal` : ''}
              </div>
            </div>
          </div>

          {/* Schema Settimanale Giorno per Giorno */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#0f172a', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
              Schema Alimentare Settimanale
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {diet.days && diet.days.map((day) => (
                <div
                  key={day.id || day.day_of_week}
                  className="diet-day-print-card"
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 800,
                    color: '#0d9488',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <span>{day.day_name}</span>
                    {day.notes && <span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>{day.notes}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                    {day.meals && day.meals.map((meal, mIdx) => (
                      <div
                        key={mIdx}
                        style={{
                          backgroundColor: '#f8fafc',
                          border: '1px solid #f1f5f9',
                          borderRadius: '6px',
                          padding: '8px 10px'
                        }}
                      >
                        <div style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: '#475569',
                          marginBottom: '4px',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: '2px'
                        }}>
                          {meal.meal_type}
                        </div>

                        <div style={{ fontSize: '0.8rem', color: '#1e293b', lineHeight: 1.4 }}>
                          {meal.items && Array.isArray(meal.items) ? (
                            meal.items.map((it, itIdx) => (
                              <div key={itIdx} style={{ marginBottom: '2px' }}>
                                <strong>{it.food}</strong> {it.qty && <span style={{ color: '#0d9488' }}>({it.qty})</span>}
                              </div>
                            ))
                          ) : (
                            <div>{meal.items}</div>
                          )}

                          {meal.notes && (
                            <div style={{ fontSize: '0.72rem', color: '#64748b', fontStyle: 'italic', marginTop: '3px' }}>
                              {meal.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raccomandazioni Generali & Idratazione */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '16px',
            marginBottom: '20px',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', color: '#0d9488', marginBottom: '4px' }}>
                💧 Idratazione & Liquidi
              </strong>
              <p style={{ margin: 0 }}>
                {diet.water_intake_recommendation || 'Bere almeno 2.0L di acqua naturale durante la giornata.'}
              </p>
            </div>

            <div style={{ fontSize: '0.8rem', color: '#334155', lineHeight: 1.5 }}>
              <strong style={{ display: 'block', color: '#0d9488', marginBottom: '4px' }}>
                🥄 Condimenti e Cotture
              </strong>
              <p style={{ margin: 0 }}>
                {diet.general_recommendations || 'Utilizzare olio EVO a crudo (misurato col cucchiaio). Cottura a vapore, forno o piastra.'}
              </p>
            </div>
          </div>

          {/* Attività Fisica & Integratori */}
          {(diet.physical_activity_recommendations || diet.supplements || diet.notes) && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '0.8rem',
              color: '#334155',
              lineHeight: 1.5,
              marginBottom: '24px',
              pageBreakInside: 'avoid'
            }}>
              {diet.physical_activity_recommendations && (
                <div style={{ marginBottom: '6px' }}>
                  <strong>Attività Fisica Consigliata:</strong> {diet.physical_activity_recommendations}
                </div>
              )}
              {diet.supplements && (
                <div style={{ marginBottom: '6px' }}>
                  <strong>Integrazione Nutrizionale:</strong> {diet.supplements}
                </div>
              )}
              {diet.notes && (
                <div>
                  <strong>Note Aggiuntive:</strong> {diet.notes}
                </div>
              )}
            </div>
          )}

          {/* Firma e Timbro Nutrizionista */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingTop: '20px',
            pageBreakInside: 'avoid'
          }}>
            <div style={{ fontSize: '0.72rem', color: '#94a3b8', maxWidth: '350px' }}>
              {settings?.disclaimer_notes || 'Piano alimentare redatto ai sensi delle normative vigenti.'}
            </div>

            <div style={{ textAlign: 'center', width: '220px' }}>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '40px' }}>
                Firma e Timbro del Professionista
              </div>
              <div style={{ borderBottom: '1px solid #94a3b8', width: '100%', margin: '0 auto' }}></div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginTop: '4px' }}>
                {settings?.nutritionist_name}
              </div>
            </div>
          </div>

        </div>

        {/* Footer modale con pulsante stampa */}
        <div className="modal-footer no-print">
          <button onClick={onClose} className="btn btn-secondary">
            Chiudi
          </button>
          <button onClick={handlePrint} className="btn btn-primary">
            <Printer size={16} />
            <span>Stampa / Esporta PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
