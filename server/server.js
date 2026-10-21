const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const {
  db,
  runQuery,
  getRow,
  getAll,
  initDatabase,
  seedDemoData,
  dbPath
} = require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '20mb' }));

// Helper calcolo BMI
const calculateBMI = (weight, heightCm) => {
  if (!weight || !heightCm) return null;
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(2));
};

// Helper calcolo WHR (Waist-to-Hip Ratio)
const calculateWHR = (waist, hip) => {
  if (!waist || !hip) return null;
  return Number((waist / hip).toFixed(2));
};

// ==========================================
// 1. IMPOSTAZIONI STUDIO & CLINICA
// ==========================================
app.get('/api/settings', async (req, res) => {
  try {
    const settings = await getRow('SELECT * FROM clinic_settings ORDER BY id ASC LIMIT 1');
    res.json(settings || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/settings', async (req, res) => {
  try {
    const {
      nutritionist_name, title, studio_name, address,
      phone, email, vat_piva, orders_code, disclaimer_notes
    } = req.body;

    await runQuery(`
      UPDATE clinic_settings SET
        nutritionist_name = ?, title = ?, studio_name = ?,
        address = ?, phone = ?, email = ?, vat_piva = ?,
        orders_code = ?, disclaimer_notes = ?
      WHERE id = 1
    `, [
      nutritionist_name, title, studio_name, address,
      phone, email, vat_piva, orders_code, disclaimer_notes
    ]);

    const updated = await getRow('SELECT * FROM clinic_settings WHERE id = 1');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 2. DASHBOARD PANORAMICA
// ==========================================
app.get('/api/dashboard', async (req, res) => {
  try {
    const totalPatients = await getRow('SELECT COUNT(*) as count FROM patients');
    const activePatients = await getRow("SELECT COUNT(*) as count FROM patients WHERE status = 'attivo'");
    const totalVisits = await getRow('SELECT COUNT(*) as count FROM visits');
    const totalDiets = await getRow('SELECT COUNT(*) as count FROM diet_plans WHERE is_active = 1');

    // Ultime 5 visite effettuate
    const recentVisits = await getAll(`
      SELECT v.*, p.first_name, p.last_name, p.gender
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      ORDER BY v.visit_date DESC, v.id DESC
      LIMIT 6
    `);

    // Prossimi appuntamenti
    const today = new Date().toISOString().split('T')[0];
    const upcomingAppointments = await getAll(`
      SELECT v.next_appointment, v.patient_id, p.first_name, p.last_name, p.phone, p.email
      FROM visits v
      JOIN patients p ON v.patient_id = p.id
      WHERE v.next_appointment >= ?
      ORDER BY v.next_appointment ASC
      LIMIT 5
    `, [today]);

    // Ultimi pazienti registrati o modificati
    const recentPatients = await getAll(`
      SELECT * FROM patients
      ORDER BY updated_at DESC, id DESC
      LIMIT 5
    `);

    res.json({
      metrics: {
        totalPatients: totalPatients.count,
        activePatients: activePatients.count,
        totalVisits: totalVisits.count,
        activeDiets: totalDiets.count
      },
      recentVisits,
      upcomingAppointments,
      recentPatients
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 3. PAZIENTI
// ==========================================
app.get('/api/patients', async (req, res) => {
  try {
    const { search, status } = req.query;
    let sql = 'SELECT * FROM patients WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR fiscal_code LIKE ? OR phone LIKE ? OR email LIKE ?)';
      const queryStr = `%${search}%`;
      params.push(queryStr, queryStr, queryStr, queryStr, queryStr);
    }

    if (status && status !== 'tutti') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY last_name ASC, first_name ASC';
    const patients = await getAll(sql, params);

    // Per ogni paziente aggiungi l'ultimo peso registrato e data ultima visita
    const patientsWithStats = await Promise.all(patients.map(async (p) => {
      const lastVisit = await getRow(`
        SELECT visit_date, weight, bmi FROM visits
        WHERE patient_id = ?
        ORDER BY visit_date DESC, id DESC
        LIMIT 1
      `, [p.id]);

      const visitsCount = await getRow(`
        SELECT COUNT(*) as count FROM visits WHERE patient_id = ?
      `, [p.id]);

      const activeDiet = await getRow(`
        SELECT id, title, start_date FROM diet_plans
        WHERE patient_id = ? AND is_active = 1
        ORDER BY id DESC LIMIT 1
      `, [p.id]);

      return {
        ...p,
        latest_weight: lastVisit ? lastVisit.weight : p.initial_weight,
        latest_bmi: lastVisit ? lastVisit.bmi : calculateBMI(p.initial_weight, p.height),
        latest_visit_date: lastVisit ? lastVisit.visit_date : null,
        visits_count: visitsCount.count,
        has_active_diet: !!activeDiet,
        active_diet_title: activeDiet ? activeDiet.title : null
      };
    }));

    res.json(patientsWithStats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:id', async (req, res) => {
  try {
    const patient = await getRow('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    if (!patient) return res.status(404).json({ error: 'Paziente non trovato' });

    // Visite
    const visits = await getAll(`
      SELECT * FROM visits
      WHERE patient_id = ?
      ORDER BY visit_date ASC, id ASC
    `, [patient.id]);

    // BIA measurements
    const biaList = await getAll(`
      SELECT b.*, v.visit_date, v.weight as visit_weight
      FROM bia_measurements b
      JOIN visits v ON b.visit_id = v.id
      WHERE b.patient_id = ?
      ORDER BY b.measurement_date ASC, b.id ASC
    `, [patient.id]);

    // Diete
    const diets = await getAll(`
      SELECT * FROM diet_plans
      WHERE patient_id = ?
      ORDER BY is_active DESC, start_date DESC, id DESC
    `, [patient.id]);

    // Calcolo variazione totale peso
    let weightDiffTotal = 0;
    let weightDiffLast = 0;
    let latestWeight = patient.initial_weight;

    if (visits.length > 0) {
      latestWeight = visits[visits.length - 1].weight;
      weightDiffTotal = Number((latestWeight - patient.initial_weight).toFixed(1));
      if (visits.length > 1) {
        weightDiffLast = Number((latestWeight - visits[visits.length - 2].weight).toFixed(1));
      } else {
        weightDiffLast = weightDiffTotal;
      }
    }

    res.json({
      ...patient,
      latest_weight: latestWeight,
      weight_diff_total: weightDiffTotal,
      weight_diff_last: weightDiffLast,
      visits,
      bia_measurements: biaList,
      diets
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const {
      first_name, last_name, gender, birth_date, fiscal_code,
      phone, email, profession, address, height, initial_weight,
      target_weight, goal_description, activity_level, allergies,
      intolerances, pathologies, medications, lifestyle_notes,
      food_preferences, status
    } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Nome e Cognome sono obbligatori' });
    }

    const result = await runQuery(`
      INSERT INTO patients (
        first_name, last_name, gender, birth_date, fiscal_code,
        phone, email, profession, address, height, initial_weight,
        target_weight, goal_description, activity_level, allergies,
        intolerances, pathologies, medications, lifestyle_notes,
        food_preferences, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      first_name, last_name, gender || 'F', birth_date || null, fiscal_code ? fiscal_code.toUpperCase() : '',
      phone || '', email || '', profession || '', address || '', height ? Number(height) : null,
      initial_weight ? Number(initial_weight) : null, target_weight ? Number(target_weight) : null,
      goal_description || '', activity_level || 'moderata', allergies || '',
      intolerances || '', pathologies || '', medications || '', lifestyle_notes || '',
      food_preferences || '', status || 'attivo'
    ]);

    // Se fornito il peso iniziale, crea automaticamente la prima visita
    if (initial_weight && Number(initial_weight) > 0) {
      const today = new Date().toISOString().split('T')[0];
      const bmi = calculateBMI(Number(initial_weight), Number(height));
      await runQuery(`
        INSERT INTO visits (
          patient_id, visit_date, visit_type, weight, height, bmi, clinical_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        result.id, today, 'Prima Visita', Number(initial_weight), Number(height) || null, bmi,
        'Registrazione iniziale paziente e prima pesata.'
      ]);
    }

    const newPatient = await getRow('SELECT * FROM patients WHERE id = ?', [result.id]);
    res.status(201).json(newPatient);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/patients/:id', async (req, res) => {
  try {
    const {
      first_name, last_name, gender, birth_date, fiscal_code,
      phone, email, profession, address, height, initial_weight,
      target_weight, goal_description, activity_level, allergies,
      intolerances, pathologies, medications, lifestyle_notes,
      food_preferences, status
    } = req.body;

    await runQuery(`
      UPDATE patients SET
        first_name = ?, last_name = ?, gender = ?, birth_date = ?,
        fiscal_code = ?, phone = ?, email = ?, profession = ?,
        address = ?, height = ?, initial_weight = ?, target_weight = ?,
        goal_description = ?, activity_level = ?, allergies = ?,
        intolerances = ?, pathologies = ?, medications = ?,
        lifestyle_notes = ?, food_preferences = ?, status = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      first_name, last_name, gender, birth_date,
      fiscal_code ? fiscal_code.toUpperCase() : '', phone, email, profession,
      address, height ? Number(height) : null, initial_weight ? Number(initial_weight) : null,
      target_weight ? Number(target_weight) : null, goal_description, activity_level, allergies,
      intolerances, pathologies, medications, lifestyle_notes,
      food_preferences, status, req.params.id
    ]);

    const updated = await getRow('SELECT * FROM patients WHERE id = ?', [req.params.id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/patients/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM patients WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Paziente eliminato con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 4. VISITE & PESATE ANTROPOMETRICHE
// ==========================================
app.get('/api/patients/:patientId/visits', async (req, res) => {
  try {
    const visits = await getAll(`
      SELECT v.*, b.id as bia_id, b.phase_angle, b.fat_mass_percent, b.fat_free_mass_percent, b.total_body_water_lt
      FROM visits v
      LEFT JOIN bia_measurements b ON b.visit_id = v.id
      WHERE v.patient_id = ?
      ORDER BY v.visit_date DESC, v.id DESC
    `, [req.params.patientId]);
    res.json(visits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients/:patientId/visits', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const {
      visit_date, visit_type, weight, height,
      waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ,
      clinical_notes, next_appointment, bia_data
    } = req.body;

    if (!weight || !visit_date) {
      return res.status(400).json({ error: 'Data visita e Peso sono obbligatori' });
    }

    // Se l'altezza non è fornita, prendi quella del paziente
    let patientHeight = height;
    if (!patientHeight) {
      const p = await getRow('SELECT height FROM patients WHERE id = ?', [patientId]);
      if (p) patientHeight = p.height;
    }

    const bmi = calculateBMI(Number(weight), Number(patientHeight));
    const whr = calculateWHR(Number(waist_circ), Number(hip_circ));

    const visitResult = await runQuery(`
      INSERT INTO visits (
        patient_id, visit_date, visit_type, weight, height, bmi,
        waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ, whr,
        clinical_notes, next_appointment
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientId, visit_date, visit_type || 'Controllo', Number(weight),
      patientHeight ? Number(patientHeight) : null, bmi,
      waist_circ ? Number(waist_circ) : null, hip_circ ? Number(hip_circ) : null,
      abdomen_circ ? Number(abdomen_circ) : null, arm_circ ? Number(arm_circ) : null,
      thigh_circ ? Number(thigh_circ) : null, whr, clinical_notes || '',
      next_appointment || null
    ]);

    // Se sono presenti dati BIA collegati a questa visita
    if (bia_data && (bia_data.phase_angle || bia_data.fat_mass_percent || bia_data.total_body_water_lt || bia_data.resistance_rz)) {
      await runQuery(`
        INSERT INTO bia_measurements (
          visit_id, patient_id, measurement_date, device_model,
          resistance_rz, reactance_xc, phase_angle, fat_mass_kg, fat_mass_percent,
          fat_free_mass_kg, fat_free_mass_percent, total_body_water_lt, total_body_water_percent,
          extracellular_water_lt, extracellular_water_percent, intracellular_water_lt, intracellular_water_percent,
          body_cell_mass_kg, body_cell_mass_percent, visceral_fat_level, basal_metabolic_rate, bia_vector_notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        visitResult.id, patientId, visit_date, bia_data.device_model || 'Analizzatore BIA',
        bia_data.resistance_rz ? Number(bia_data.resistance_rz) : null,
        bia_data.reactance_xc ? Number(bia_data.reactance_xc) : null,
        bia_data.phase_angle ? Number(bia_data.phase_angle) : null,
        bia_data.fat_mass_kg ? Number(bia_data.fat_mass_kg) : null,
        bia_data.fat_mass_percent ? Number(bia_data.fat_mass_percent) : null,
        bia_data.fat_free_mass_kg ? Number(bia_data.fat_free_mass_kg) : null,
        bia_data.fat_free_mass_percent ? Number(bia_data.fat_free_mass_percent) : null,
        bia_data.total_body_water_lt ? Number(bia_data.total_body_water_lt) : null,
        bia_data.total_body_water_percent ? Number(bia_data.total_body_water_percent) : null,
        bia_data.extracellular_water_lt ? Number(bia_data.extracellular_water_lt) : null,
        bia_data.extracellular_water_percent ? Number(bia_data.extracellular_water_percent) : null,
        bia_data.intracellular_water_lt ? Number(bia_data.intracellular_water_lt) : null,
        bia_data.intracellular_water_percent ? Number(bia_data.intracellular_water_percent) : null,
        bia_data.body_cell_mass_kg ? Number(bia_data.body_cell_mass_kg) : null,
        bia_data.body_cell_mass_percent ? Number(bia_data.body_cell_mass_percent) : null,
        bia_data.visceral_fat_level ? Number(bia_data.visceral_fat_level) : null,
        bia_data.basal_metabolic_rate ? Number(bia_data.basal_metabolic_rate) : null,
        bia_data.bia_vector_notes || ''
      ]);
    }

    // Aggiorna data ultima modifica del paziente
    await runQuery('UPDATE patients SET updated_at = CURRENT_TIMESTAMP WHERE id = ?', [patientId]);

    const createdVisit = await getRow('SELECT * FROM visits WHERE id = ?', [visitResult.id]);
    res.status(201).json(createdVisit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/visits/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM visits WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Visita eliminata' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 5. BIOIMPEDENZIOMETRIA (BIA)
// ==========================================
app.get('/api/patients/:patientId/bia', async (req, res) => {
  try {
    const list = await getAll(`
      SELECT b.*, v.weight, v.height, v.bmi, v.visit_type
      FROM bia_measurements b
      JOIN visits v ON b.visit_id = v.id
      WHERE b.patient_id = ?
      ORDER BY b.measurement_date ASC, b.id ASC
    `, [req.params.patientId]);
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/patients/:patientId/bia-comparison', async (req, res) => {
  try {
    const measurements = await getAll(`
      SELECT b.*, v.weight, v.bmi, v.visit_type
      FROM bia_measurements b
      JOIN visits v ON b.visit_id = v.id
      WHERE b.patient_id = ?
      ORDER BY b.measurement_date ASC, b.id ASC
    `, [req.params.patientId]);

    if (measurements.length === 0) {
      return res.json({ hasData: false });
    }

    const first = measurements[0];
    const latest = measurements[measurements.length - 1];

    const deltas = {
      weight: Number((latest.weight - first.weight).toFixed(1)),
      fat_mass_kg: (latest.fat_mass_kg && first.fat_mass_kg) ? Number((latest.fat_mass_kg - first.fat_mass_kg).toFixed(1)) : null,
      fat_mass_percent: (latest.fat_mass_percent && first.fat_mass_percent) ? Number((latest.fat_mass_percent - first.fat_mass_percent).toFixed(1)) : null,
      fat_free_mass_kg: (latest.fat_free_mass_kg && first.fat_free_mass_kg) ? Number((latest.fat_free_mass_kg - first.fat_free_mass_kg).toFixed(1)) : null,
      fat_free_mass_percent: (latest.fat_free_mass_percent && first.fat_free_mass_percent) ? Number((latest.fat_free_mass_percent - first.fat_free_mass_percent).toFixed(1)) : null,
      total_body_water_lt: (latest.total_body_water_lt && first.total_body_water_lt) ? Number((latest.total_body_water_lt - first.total_body_water_lt).toFixed(1)) : null,
      phase_angle: (latest.phase_angle && first.phase_angle) ? Number((latest.phase_angle - first.phase_angle).toFixed(2)) : null,
      body_cell_mass_kg: (latest.body_cell_mass_kg && first.body_cell_mass_kg) ? Number((latest.body_cell_mass_kg - first.body_cell_mass_kg).toFixed(1)) : null,
      visceral_fat_level: (latest.visceral_fat_level && first.visceral_fat_level) ? Number((latest.visceral_fat_level - first.visceral_fat_level).toFixed(1)) : null
    };

    res.json({
      hasData: true,
      count: measurements.length,
      first,
      latest,
      deltas,
      all: measurements
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. PIANI ALIMENTARI (DIETE ASSEGNATE)
// ==========================================
app.get('/api/patients/:patientId/diets', async (req, res) => {
  try {
    const diets = await getAll(`
      SELECT * FROM diet_plans
      WHERE patient_id = ?
      ORDER BY is_active DESC, start_date DESC, id DESC
    `, [req.params.patientId]);
    res.json(diets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dettaglio completo dieta con 7 giorni e tutti i pasti
app.get('/api/diets/:id', async (req, res) => {
  try {
    const diet = await getRow('SELECT * FROM diet_plans WHERE id = ?', [req.params.id]);
    if (!diet) return res.status(404).json({ error: 'Dieta non trovata' });

    const patient = await getRow('SELECT * FROM patients WHERE id = ?', [diet.patient_id]);
    const settings = await getRow('SELECT * FROM clinic_settings WHERE id = 1');

    const days = await getAll(`
      SELECT * FROM diet_days
      WHERE diet_id = ?
      ORDER BY day_of_week ASC
    `, [diet.id]);

    const daysWithMeals = await Promise.all(days.map(async (d) => {
      const meals = await getAll(`
        SELECT * FROM diet_meals
        WHERE diet_day_id = ?
        ORDER BY sort_order ASC, id ASC
      `, [d.id]);

      return {
        ...d,
        meals: meals.map(m => {
          let parsedItems = [];
          try {
            parsedItems = JSON.parse(m.items);
          } catch (e) {
            parsedItems = [{ food: m.items, qty: '' }];
          }
          return {
            ...m,
            items: parsedItems
          };
        })
      };
    }));

    res.json({
      ...diet,
      macronutrients: diet.macronutrients ? JSON.parse(diet.macronutrients) : { carb: 50, prot: 20, fat: 30 },
      patient,
      settings,
      days: daysWithMeals
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/patients/:patientId/diets', async (req, res) => {
  try {
    const patientId = req.params.patientId;
    const {
      title, start_date, end_date, target_calories, macronutrients,
      is_active, water_intake_recommendation, general_recommendations,
      physical_activity_recommendations, supplements, notes, days
    } = req.body;

    if (!title || !start_date) {
      return res.status(400).json({ error: 'Titolo e Data Inizio sono obbligatori' });
    }

    // Se la nuova dieta è attiva, disattiva le altre di questo paziente
    if (is_active) {
      await runQuery('UPDATE diet_plans SET is_active = 0 WHERE patient_id = ?', [patientId]);
    }

    const dietResult = await runQuery(`
      INSERT INTO diet_plans (
        patient_id, title, start_date, end_date, target_calories,
        macronutrients, is_active, water_intake_recommendation,
        general_recommendations, physical_activity_recommendations,
        supplements, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      patientId, title, start_date, end_date || null,
      target_calories ? Number(target_calories) : null,
      macronutrients ? JSON.stringify(macronutrients) : null,
      is_active ? 1 : 0,
      water_intake_recommendation || 'Bere almeno 2 litri di acqua al giorno.',
      general_recommendations || '',
      physical_activity_recommendations || '',
      supplements || '',
      notes || ''
    ]);

    const dietId = dietResult.id;

    // Default 7 giorni se non forniti
    const defaultDays = [
      { num: 1, name: 'Lunedì' },
      { num: 2, name: 'Martedì' },
      { num: 3, name: 'Mercoledì' },
      { num: 4, name: 'Giovedì' },
      { num: 5, name: 'Venerdì' },
      { num: 6, name: 'Sabato' },
      { num: 7, name: 'Domenica' }
    ];

    const inputDays = (days && days.length > 0) ? days : defaultDays;

    for (const d of inputDays) {
      const dayResult = await runQuery(`
        INSERT INTO diet_days (diet_id, day_of_week, day_name, notes)
        VALUES (?, ?, ?, ?)
      `, [dietId, d.day_of_week || d.num, d.day_name || d.name, d.notes || '']);

      const meals = d.meals || [
        { type: 'Colazione', time: '07:30', items: [{ food: 'Yogurt o Latte con cereali integrali', qty: '1 porzione' }], notes: '' },
        { type: 'Spuntino Mattina', time: '10:30', items: [{ food: 'Frutta fresca di stagione o frutta secca', qty: '1 frutto / 15g' }], notes: '' },
        { type: 'Pranzo', time: '13:00', items: [{ food: 'Carboidrati complessi (riso/pasta int.) + Secondo proteico + Verdure', qty: 'Secondo piano' }], notes: '' },
        { type: 'Merenda Pomeriggio', time: '16:30', items: [{ food: 'Yogurt magro o frutto', qty: '1 porzione' }], notes: '' },
        { type: 'Cena', time: '20:00', items: [{ food: 'Secondo leggero (pesce/uova/legumi) + Abbondante verdura + Pane integrale', qty: 'Secondo piano' }], notes: '' }
      ];

      for (let i = 0; i < meals.length; i++) {
        const m = meals[i];
        await runQuery(`
          INSERT INTO diet_meals (diet_day_id, meal_type, time_suggestion, items, notes, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [
          dayResult.id,
          m.meal_type || m.type,
          m.time_suggestion || m.time || '',
          typeof m.items === 'string' ? m.items : JSON.stringify(m.items || []),
          m.notes || '',
          i
        ]);
      }
    }

    res.status(201).json({ id: dietId, message: 'Dieta creata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/diets/:id', async (req, res) => {
  try {
    const dietId = req.params.id;
    const {
      title, start_date, end_date, target_calories, macronutrients,
      is_active, water_intake_recommendation, general_recommendations,
      physical_activity_recommendations, supplements, notes, days
    } = req.body;

    const currentDiet = await getRow('SELECT patient_id FROM diet_plans WHERE id = ?', [dietId]);
    if (!currentDiet) return res.status(404).json({ error: 'Dieta non trovata' });

    if (is_active) {
      await runQuery('UPDATE diet_plans SET is_active = 0 WHERE patient_id = ? AND id != ?', [currentDiet.patient_id, dietId]);
    }

    await runQuery(`
      UPDATE diet_plans SET
        title = ?, start_date = ?, end_date = ?, target_calories = ?,
        macronutrients = ?, is_active = ?, water_intake_recommendation = ?,
        general_recommendations = ?, physical_activity_recommendations = ?,
        supplements = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, start_date, end_date || null,
      target_calories ? Number(target_calories) : null,
      macronutrients ? JSON.stringify(macronutrients) : null,
      is_active ? 1 : 0,
      water_intake_recommendation,
      general_recommendations,
      physical_activity_recommendations,
      supplements,
      notes,
      dietId
    ]);

    // Se sono stati inviati i giorni aggiornati, rimpiazza i pasti
    if (days && Array.isArray(days)) {
      // Elimina vecchi giorni e pasti a cascata
      await runQuery('DELETE FROM diet_days WHERE diet_id = ?', [dietId]);

      for (const d of days) {
        const dayResult = await runQuery(`
          INSERT INTO diet_days (diet_id, day_of_week, day_name, notes)
          VALUES (?, ?, ?, ?)
        `, [dietId, d.day_of_week || 1, d.day_name, d.notes || '']);

        if (d.meals && Array.isArray(d.meals)) {
          for (let i = 0; i < d.meals.length; i++) {
            const m = d.meals[i];
            await runQuery(`
              INSERT INTO diet_meals (diet_day_id, meal_type, time_suggestion, items, notes, sort_order)
              VALUES (?, ?, ?, ?, ?, ?)
            `, [
              dayResult.id,
              m.meal_type,
              m.time_suggestion || '',
              typeof m.items === 'string' ? m.items : JSON.stringify(m.items || []),
              m.notes || '',
              i
            ]);
          }
        }
      }
    }

    res.json({ success: true, message: 'Dieta aggiornata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/diets/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM diet_plans WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Dieta eliminata' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Duplica una dieta
app.post('/api/diets/:id/duplicate', async (req, res) => {
  try {
    const sourceDiet = await getRow('SELECT * FROM diet_plans WHERE id = ?', [req.params.id]);
    if (!sourceDiet) return res.status(404).json({ error: 'Dieta non trovata' });

    const today = new Date().toISOString().split('T')[0];
    const newDietResult = await runQuery(`
      INSERT INTO diet_plans (
        patient_id, title, start_date, end_date, target_calories,
        macronutrients, is_active, water_intake_recommendation,
        general_recommendations, physical_activity_recommendations,
        supplements, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      sourceDiet.patient_id,
      `${sourceDiet.title} (Revisione)`,
      today,
      null,
      sourceDiet.target_calories,
      sourceDiet.macronutrients,
      0, // parte non attiva
      sourceDiet.water_intake_recommendation,
      sourceDiet.general_recommendations,
      sourceDiet.physical_activity_recommendations,
      sourceDiet.supplements,
      sourceDiet.notes
    ]);

    const newDietId = newDietResult.id;
    const sourceDays = await getAll('SELECT * FROM diet_days WHERE diet_id = ? ORDER BY day_of_week ASC', [sourceDiet.id]);

    for (const d of sourceDays) {
      const newDayResult = await runQuery(`
        INSERT INTO diet_days (diet_id, day_of_week, day_name, notes)
        VALUES (?, ?, ?, ?)
      `, [newDietId, d.day_of_week, d.day_name, d.notes]);

      const sourceMeals = await getAll('SELECT * FROM diet_meals WHERE diet_day_id = ? ORDER BY sort_order ASC', [d.id]);
      for (const m of sourceMeals) {
        await runQuery(`
          INSERT INTO diet_meals (diet_day_id, meal_type, time_suggestion, items, notes, sort_order)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [newDayResult.id, m.meal_type, m.time_suggestion, m.items, m.notes, m.sort_order]);
      }
    }

    res.json({ id: newDietId, message: 'Dieta duplicata con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 7. TEMPLATE DIETE
// ==========================================
app.get('/api/templates', async (req, res) => {
  try {
    const templates = await getAll('SELECT * FROM diet_templates ORDER BY category ASC, name ASC');
    res.json(templates.map(t => ({
      ...t,
      structure: JSON.parse(t.structure_json)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/templates', async (req, res) => {
  try {
    const { name, category, description, target_calories, structure } = req.body;
    if (!name || !structure) {
      return res.status(400).json({ error: 'Nome e Struttura template sono obbligatori' });
    }

    const result = await runQuery(`
      INSERT INTO diet_templates (name, category, description, target_calories, structure_json)
      VALUES (?, ?, ?, ?, ?)
    `, [
      name,
      category || 'Personalizzato',
      description || '',
      target_calories ? Number(target_calories) : null,
      typeof structure === 'string' ? structure : JSON.stringify(structure)
    ]);

    res.status(201).json({ id: result.id, message: 'Template salvato con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 8. BACKUP & GESTIONE DATI LOCALI
// ==========================================
// Download del file SQLite
app.get('/api/backup/download-db', (req, res) => {
  if (fs.existsSync(dbPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.download(dbPath, `nutrigest-backup-${timestamp}.sqlite`);
  } else {
    res.status(404).json({ error: 'File database non trovato' });
  }
});

// Esportazione completa in JSON
app.get('/api/backup/export-json', async (req, res) => {
  try {
    const settings = await getAll('SELECT * FROM clinic_settings');
    const patients = await getAll('SELECT * FROM patients');
    const visits = await getAll('SELECT * FROM visits');
    const bia = await getAll('SELECT * FROM bia_measurements');
    const diet_plans = await getAll('SELECT * FROM diet_plans');
    const diet_days = await getAll('SELECT * FROM diet_days');
    const diet_meals = await getAll('SELECT * FROM diet_meals');
    const templates = await getAll('SELECT * FROM diet_templates');

    const fullBackup = {
      export_version: '1.0',
      exported_at: new Date().toISOString(),
      settings,
      patients,
      visits,
      bia,
      diet_plans,
      diet_days,
      diet_meals,
      templates
    };

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    res.setHeader('Content-disposition', `attachment; filename=nutrigest-export-${timestamp}.json`);
    res.setHeader('Content-type', 'application/json');
    res.write(JSON.stringify(fullBackup, null, 2));
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Ripristina dati demo
app.post('/api/backup/reset-demo', async (req, res) => {
  try {
    await runQuery('DELETE FROM bia_measurements');
    await runQuery('DELETE FROM visits');
    await runQuery('DELETE FROM diet_meals');
    await runQuery('DELETE FROM diet_days');
    await runQuery('DELETE FROM diet_plans');
    await runQuery('DELETE FROM patients');
    await runQuery('DELETE FROM diet_templates');
    await seedDemoData();
    res.json({ success: true, message: 'Dati dimostrativi ripristinati con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend statico in produzione se compilato
const clientDist = path.resolve(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Avvio del server
const startServer = async () => {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(` NutriGest API Server attivo su http://localhost:${PORT}`);
      console.log(` Database SQLite: ${dbPath}`);
      console.log(`===============================================`);
    });
  } catch (err) {
    console.error('Errore durante l\'inizializzazione del server:', err);
  }
};

startServer();
