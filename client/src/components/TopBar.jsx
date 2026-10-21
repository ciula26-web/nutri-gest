import React from 'react';
import { Plus, UserPlus, FileDown, Calendar, HardDrive } from 'lucide-react';

export default function TopBar({
  title,
  subtitle,
  onNewPatient,
  onNewVisit,
  onNewDiet
}) {
  return (
    <header className="top-bar">
      <div className="top-bar-title">
        <div>
          <h2>{title}</h2>
          {subtitle && <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{subtitle}</p>}
        </div>
      </div>

      <div className="top-bar-actions">
        <a
          href="/api/backup/download-db"
          download
          className="btn btn-secondary btn-sm"
          title="Scarica copia del database SQLite"
        >
          <HardDrive size={15} />
          <span>Backup DB</span>
        </a>

        {onNewPatient && (
          <button onClick={onNewPatient} className="btn btn-outline-primary btn-sm">
            <UserPlus size={15} />
            <span>Nuovo Paziente</span>
          </button>
        )}

        {onNewVisit && (
          <button onClick={onNewVisit} className="btn btn-primary btn-sm">
            <Plus size={15} />
            <span>Nuova Visita / BIA</span>
          </button>
        )}
      </div>
    </header>
  );
}
