import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import PatientsList from './components/PatientsList';
import PatientDetail from './components/PatientDetail';
import PatientModal from './components/PatientModal';
import NewVisitModal from './components/NewVisitModal';
import BiaView from './components/BiaView';
import DietPlanner from './components/DietPlanner';
import SettingsView from './components/SettingsView';
import PopupOverlay from './components/PopupOverlay';
import { showPopup, showConfirm } from './utils/popup';
import { api } from './api';
import confetti from 'canvas-confetti';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Dati principali
  const [patients, setPatients] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [settings, setSettings] = useState(null);

  // Ricerca e filtri
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('tutti');

  // Modali
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState(null);
  const [patientRefreshKey, setPatientRefreshKey] = useState(0);
  const [isGlobalVisitModalOpen, setIsGlobalVisitModalOpen] = useState(false);
  const [visitModalPatient, setVisitModalPatient] = useState(null);

  // Inizializzazione dati
  useEffect(() => {
    loadAllData();
  }, [searchQuery, filterStatus]);

  // Gestione tema dark
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [darkMode]);

  const loadAllData = async () => {
    try {
      const [pts, dash, stg] = await Promise.all([
        api.getPatients(searchQuery, filterStatus),
        api.getDashboard(),
        api.getSettings()
      ]);
      setPatients(pts || []);
      setDashboardData(dash || null);
      setSettings(stg || null);
    } catch (e) {
      console.error('Errore nel caricamento dati:', e);
    }
  };

  // Navigazione cartella paziente
  const handleSelectPatient = (id) => {
    setSelectedPatientId(id);
    setCurrentView('patient-detail');
  };

  // Apertura modale nuovo paziente
  const handleOpenNewPatient = () => {
    setPatientToEdit(null);
    setIsPatientModalOpen(true);
  };

  // Apertura modale modifica paziente
  const handleOpenEditPatient = async (p) => {
    try {
      const freshPatient = await api.getPatient(p.id);
      setPatientToEdit(freshPatient && !freshPatient.error ? freshPatient : p);
    } catch {
      setPatientToEdit(p);
    }
    setIsPatientModalOpen(true);
  };

  // Salvataggio paziente (creazione o aggiornamento)
  const handleSavePatient = async (formData) => {
    try {
      setIsPatientModalOpen(false);
      if (patientToEdit) {
        await api.updatePatient(patientToEdit.id, formData);
        showPopup('Scheda paziente aggiornata con successo!', 'success', 'Modifiche Salvate');
      } else {
        await api.createPatient(formData);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
        showPopup('Nuovo paziente registrato con successo!', 'success', 'Paziente Registrato');
      }
      setPatientToEdit(null);
      setPatientRefreshKey(prev => prev + 1);
      await loadAllData();
    } catch (e) {
      showPopup('Errore salvataggio paziente: ' + e.message, 'error');
    }
  };

  // Eliminazione paziente
  const handleDeletePatient = async (id, name) => {
    const confirmed = await showConfirm(
      `Sei sicuro di voler eliminare la cartella del paziente "${name}" e tutte le sue visite, BIA e diete?`,
      { title: 'Elimina Paziente', confirmText: 'Elimina', danger: true }
    );
    if (confirmed) {
      try {
        await api.deletePatient(id);
        if (selectedPatientId === id) {
          setSelectedPatientId(null);
          setCurrentView('patients');
        }
        await loadAllData();
        showPopup('Cartella paziente eliminata con successo.', 'success', 'Paziente Eliminato');
      } catch (e) {
        showPopup('Errore eliminazione: ' + e.message, 'error');
      }
    }
  };

  // Apertura modale nuova visita globale
  const handleOpenGlobalVisit = () => {
    if (patients.length === 0) {
      showPopup('Registra prima almeno un paziente per poter inserire una visita.', 'warning');
      handleOpenNewPatient();
      return;
    }
    const targetPatient = selectedPatientId
      ? patients.find(p => p.id === selectedPatientId)
      : patients[0];
    setVisitModalPatient(targetPatient);
    setIsGlobalVisitModalOpen(true);
  };

  const handleSaveGlobalVisit = async (visitPayload) => {
    if (!visitModalPatient) return;
    try {
      await api.addVisit(visitModalPatient.id, visitPayload);
      setIsGlobalVisitModalOpen(false);
      await loadAllData();
      showPopup('Visita e parametri registrati con successo!', 'success', 'Visita Salvata');
      handleSelectPatient(visitModalPatient.id);
    } catch (e) {
      showPopup('Errore salvataggio: ' + e.message, 'error');
    }
  };

  // Titolo della schermata corrente
  const getHeaderTitle = () => {
    switch (currentView) {
      case 'dashboard':
        return { title: 'Panoramica Studio', subtitle: 'Riepilogo attività clinica, prossimi controlli e pazienti' };
      case 'patients':
        return { title: 'Gestione Pazienti', subtitle: 'Cartelle cliniche, anagrafiche e monitoraggio' };
      case 'patient-detail':
        return { title: 'Cartella Clinica Paziente', subtitle: 'Scheda completa, andamento peso, analisi BIA e diete' };
      case 'weight':
        return { title: 'Monitoraggio Peso & Circonferenze', subtitle: 'Curve ponderali, evoluzione temporale e calcolo BMI' };
      case 'bia':
        return { title: 'Bioimpedenziometria (BIA)', subtitle: 'Composizione corporea, angolo di fase e idratazione cellulare' };
      case 'diets':
        return { title: 'Piani Alimentari Settimanali', subtitle: 'Elaborazione schemi dietetici, copie feriali e stampa PDF' };
      case 'settings':
        return { title: 'Dati del Professionista & Studio', subtitle: 'Configurazione dati anagrafici, recapiti studio e intestazione referti/diete' };
      case 'backup':
        return { title: 'Backup & Gestione Database', subtitle: 'Salvataggio database SQLite locale, esportazione JSON e gestione dati' };
      default:
        return { title: 'NutriGest Studio', subtitle: '' };
    }
  };

  const headerInfo = getHeaderTitle();

  return (
    <div className="app-container">
      {/* Barra Laterale di Navigazione */}
      <Sidebar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view !== 'patient-detail') {
            setSelectedPatientId(null);
          }
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        settings={settings}
        patientsCount={patients.length}
      />

      {/* Area Principale */}
      <div className="main-wrapper">
        <TopBar
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onNewPatient={handleOpenNewPatient}
          onNewVisit={handleOpenGlobalVisit}
        />

        <main className="content-body">
          {/* VISTA 1: DASHBOARD */}
          {currentView === 'dashboard' && dashboardData && (
            <Dashboard
              dashboardData={dashboardData}
              onSelectPatient={handleSelectPatient}
              onNewPatient={handleOpenNewPatient}
              onNewVisit={handleOpenGlobalVisit}
              setCurrentView={setCurrentView}
            />
          )}

          {/* VISTA 2: LISTA PAZIENTI */}
          {currentView === 'patients' && (
            <PatientsList
              patients={patients}
              onSelectPatient={handleSelectPatient}
              onNewPatient={handleOpenNewPatient}
              onEditPatient={handleOpenEditPatient}
              onDeletePatient={handleDeletePatient}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          )}

          {/* VISTA 3: CARTELLA CLINICA SINGOLO PAZIENTE */}
          {currentView === 'patient-detail' && selectedPatientId && (
            <PatientDetail
              patientId={selectedPatientId}
              refreshKey={patientRefreshKey}
              onBack={() => {
                setSelectedPatientId(null);
                setCurrentView('patients');
              }}
              onEditPatient={handleOpenEditPatient}
              settings={settings}
            />
          )}

          {/* VISTA 4: MONITORAGGIO PESO GLOBALE / PER PAZIENTE */}
          {currentView === 'weight' && (
            <div>
              {patients.length > 0 ? (
                <PatientDetail
                  patientId={selectedPatientId || patients[0].id}
                  refreshKey={patientRefreshKey}
                  onBack={() => setCurrentView('dashboard')}
                  onEditPatient={handleOpenEditPatient}
                  settings={settings}
                />
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <h3>Nessun paziente disponibile</h3>
                  <button onClick={handleOpenNewPatient} className="btn btn-primary" style={{ marginTop: '16px' }}>
                    Registra Primo Paziente
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VISTA 5: ANALISI BIA */}
          {currentView === 'bia' && (
            <div>
              <div className="card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Seleziona Paziente per Analisi BIA:</span>
                  <select
                    value={selectedPatientId || (patients[0]?.id || '')}
                    onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                    className="form-control"
                    style={{ width: 'auto', minWidth: '240px' }}
                  >
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.last_name} {p.first_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedPatientId || (patients.length > 0 && patients[0].id) ? (
                <PatientDetail
                  patientId={selectedPatientId || patients[0].id}
                  refreshKey={patientRefreshKey}
                  onBack={() => setCurrentView('dashboard')}
                  onEditPatient={handleOpenEditPatient}
                  settings={settings}
                />
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                  <h3>Nessun dato BIA</h3>
                </div>
              )}
            </div>
          )}

          {/* VISTA 6: PIANI ALIMENTARI (DIETE) */}
          {currentView === 'diets' && (
            <DietPlanner
              patient={selectedPatientId ? patients.find(p => p.id === selectedPatientId) : null}
              patients={patients}
              onSelectPatient={handleSelectPatient}
              settings={settings}
            />
          )}

          {/* VISTA 7: DATI PROFESSIONISTA & BACKUP DB */}
          {(currentView === 'settings' || currentView === 'backup') && (
            <SettingsView
              activeSection={currentView === 'backup' ? 'backup' : 'profile'}
              onChangeSection={(sec) => setCurrentView(sec === 'backup' ? 'backup' : 'settings')}
              settings={settings}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
              onReloadData={loadAllData}
            />
          )}
        </main>
      </div>

      {/* Modale Nuovo / Modifica Paziente */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={handleSavePatient}
        patientToEdit={patientToEdit}
      />

      {/* Modale Visita / BIA Globale da TopBar */}
      <NewVisitModal
        isOpen={isGlobalVisitModalOpen}
        onClose={() => setIsGlobalVisitModalOpen(false)}
        onSave={handleSaveGlobalVisit}
        patient={visitModalPatient}
      />

      {/* Popup Globale Notifiche & Conferme */}
      <PopupOverlay />
    </div>
  );
}
