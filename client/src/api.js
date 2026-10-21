const API_BASE = '/api';

export const api = {
  // Impostazioni studio
  getSettings: () => fetch(`${API_BASE}/settings`).then(r => r.json()),
  updateSettings: (data) => fetch(`${API_BASE}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Dashboard
  getDashboard: () => fetch(`${API_BASE}/dashboard`).then(r => r.json()),

  // Pazienti
  getPatients: (search = '', status = 'tutti') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'tutti') params.append('status', status);
    return fetch(`${API_BASE}/patients?${params.toString()}`).then(r => r.json());
  },

  getPatient: (id) => fetch(`${API_BASE}/patients/${id}`).then(r => r.json()),

  createPatient: (data) => fetch(`${API_BASE}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  updatePatient: (id, data) => fetch(`${API_BASE}/patients/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  deletePatient: (id) => fetch(`${API_BASE}/patients/${id}`, {
    method: 'DELETE'
  }).then(r => r.json()),

  // Visite & Pesate
  getVisits: (patientId) => fetch(`${API_BASE}/patients/${patientId}/visits`).then(r => r.json()),

  addVisit: (patientId, data) => fetch(`${API_BASE}/patients/${patientId}/visits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  deleteVisit: (id) => fetch(`${API_BASE}/visits/${id}`, {
    method: 'DELETE'
  }).then(r => r.json()),

  // BIA
  getBiaMeasurements: (patientId) => fetch(`${API_BASE}/patients/${patientId}/bia`).then(r => r.json()),
  getBiaComparison: (patientId) => fetch(`${API_BASE}/patients/${patientId}/bia-comparison`).then(r => r.json()),

  // Diete
  getPatientDiets: (patientId) => fetch(`${API_BASE}/patients/${patientId}/diets`).then(r => r.json()),
  getDietDetail: (id) => fetch(`${API_BASE}/diets/${id}`).then(r => r.json()),

  createDiet: (patientId, data) => fetch(`${API_BASE}/patients/${patientId}/diets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  updateDiet: (id, data) => fetch(`${API_BASE}/diets/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  deleteDiet: (id) => fetch(`${API_BASE}/diets/${id}`, {
    method: 'DELETE'
  }).then(r => r.json()),

  duplicateDiet: (id) => fetch(`${API_BASE}/diets/${id}/duplicate`, {
    method: 'POST'
  }).then(r => r.json()),

  // Template diete
  getTemplates: () => fetch(`${API_BASE}/templates`).then(r => r.json()),
  saveTemplate: (data) => fetch(`${API_BASE}/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(r => r.json()),

  // Backup & Reset
  resetDemoData: () => fetch(`${API_BASE}/backup/reset-demo`, {
    method: 'POST'
  }).then(r => r.json())
};
