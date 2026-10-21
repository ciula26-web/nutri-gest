import React from 'react';
import {
  LayoutDashboard,
  Users,
  Scale,
  Activity,
  UtensilsCrossed,
  Settings,
  Database,
  Moon,
  Sun,
  HeartPulse
} from 'lucide-react';

export default function Sidebar({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  settings,
  patientsCount = 0
}) {
  const navItems = [
    { id: 'dashboard', label: 'Panoramica', icon: LayoutDashboard },
    { id: 'patients', label: 'Pazienti', icon: Users, badge: patientsCount },
    { id: 'weight', label: 'Andamento Peso', icon: Scale },
    { id: 'bia', label: 'Analisi BIA', icon: Activity },
    { id: 'diets', label: 'Piani Alimentari', icon: UtensilsCrossed },
    { id: 'settings', label: 'Studio & Backup', icon: Settings }
  ];

  return (
    <aside className="sidebar">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-icon-box">
          <HeartPulse size={24} />
        </div>
        <div className="brand-text">
          <h1>NutriGest</h1>
          <span>Studio Nutrizionale</span>
        </div>
      </div>

      {/* Navigazione Principale */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={19} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="badge badge-primary" style={{ padding: '2px 7px', fontSize: '0.7rem' }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer con info studio e switch tema */}
      <div className="sidebar-footer">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn btn-secondary btn-sm"
          style={{ width: '100%', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', color: '#cbd5e1' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            {darkMode ? 'Tema Chiaro' : 'Tema Scuro'}
          </span>
          <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>Locale</span>
        </button>

        <div className="doctor-badge">
          <div className="doctor-avatar">
            {settings?.nutritionist_name ? settings.nutritionist_name.charAt(0) : 'N'}
          </div>
          <div className="doctor-info">
            <span className="doctor-name">{settings?.nutritionist_name || 'Dott.ssa Nutrizionista'}</span>
            <span className="doctor-title">{settings?.title || 'Biologa Nutrizionista'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
