const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'nutrigest.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore di connessione a SQLite:', err.message);
  } else {
    console.log(`Connesso al database SQLite in: ${dbPath}`);
  }
});

// Helper promises per query
const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

const getRow = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const initDatabase = async () => {
  await runQuery(`PRAGMA foreign_keys = ON;`);

  // Tabella impostazioni studio
  await runQuery(`
    CREATE TABLE IF NOT EXISTS clinic_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nutritionist_name TEXT DEFAULT 'Dott.ssa Laura Gentile',
      title TEXT DEFAULT 'Biologa Nutrizionista - Spec. in Scienze dell''Alimentazione',
      studio_name TEXT DEFAULT 'NutriDesk Studio Nutrizionale',
      address TEXT DEFAULT 'Via Garibaldi 42, 20121 Milano (MI)',
      phone TEXT DEFAULT '+39 02 87654321',
      email TEXT DEFAULT 'info@studionutrizione.it',
      vat_piva TEXT DEFAULT 'P.IVA 09876543210',
      orders_code TEXT DEFAULT 'Iscrizione ONB n. AA_012345',
      disclaimer_notes TEXT DEFAULT 'I piani alimentari sono personalizzati e redatti a seguito di anamnesi e valutazione dello stato nutrizionale.'
    )
  `);

  // Tabella Pazienti
  await runQuery(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      gender TEXT DEFAULT 'F',
      birth_date TEXT,
      fiscal_code TEXT,
      phone TEXT,
      email TEXT,
      profession TEXT,
      address TEXT,
      height REAL,
      initial_weight REAL,
      target_weight REAL,
      goal_description TEXT,
      activity_level TEXT DEFAULT 'moderata',
      allergies TEXT DEFAULT '',
      intolerances TEXT DEFAULT '',
      pathologies TEXT DEFAULT '',
      medications TEXT DEFAULT '',
      lifestyle_notes TEXT DEFAULT '',
      food_preferences TEXT DEFAULT '',
      status TEXT DEFAULT 'attivo',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabella Visite & Misure antropometriche
  await runQuery(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      visit_date TEXT NOT NULL,
      visit_type TEXT DEFAULT 'Controllo',
      weight REAL NOT NULL,
      height REAL,
      bmi REAL,
      waist_circ REAL,
      hip_circ REAL,
      abdomen_circ REAL,
      arm_circ REAL,
      thigh_circ REAL,
      neck_circ REAL,
      whr REAL,
      clinical_notes TEXT DEFAULT '',
      next_appointment TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Tabella Misure BIA (Bioimpedenziometria)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS bia_measurements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL,
      patient_id INTEGER NOT NULL,
      measurement_date TEXT NOT NULL,
      device_model TEXT DEFAULT 'Analizzatore BIA Vettoriale',
      resistance_rz REAL,
      reactance_xc REAL,
      phase_angle REAL,
      fat_mass_kg REAL,
      fat_mass_percent REAL,
      fat_free_mass_kg REAL,
      fat_free_mass_percent REAL,
      total_body_water_lt REAL,
      total_body_water_percent REAL,
      extracellular_water_lt REAL,
      extracellular_water_percent REAL,
      intracellular_water_lt REAL,
      intracellular_water_percent REAL,
      body_cell_mass_kg REAL,
      body_cell_mass_percent REAL,
      visceral_fat_level REAL,
      basal_metabolic_rate REAL,
      bia_vector_notes TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(visit_id) REFERENCES visits(id) ON DELETE CASCADE,
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Tabella Piani Alimentari (Diete)
  await runQuery(`
    CREATE TABLE IF NOT EXISTS diet_plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      target_calories INTEGER,
      macronutrients TEXT DEFAULT '{"carb": 50, "prot": 20, "fat": 30}',
      is_active INTEGER DEFAULT 1,
      water_intake_recommendation TEXT DEFAULT 'Bere almeno 2.0L di acqua naturale al giorno.',
      general_recommendations TEXT DEFAULT 'Condimento: utilizzare 3-4 cucchiai di olio extravergine d''oliva a crudo al giorno. Preferire cotture a vapore, forno, griglia. Limitare il sale aggiunto.',
      physical_activity_recommendations TEXT DEFAULT 'Attività aerobica moderata 3-4 volte a settimana per almeno 45 minuti.',
      supplements TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(patient_id) REFERENCES patients(id) ON DELETE CASCADE
    )
  `);

  // Tabella Giorni della Dieta
  await runQuery(`
    CREATE TABLE IF NOT EXISTS diet_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diet_id INTEGER NOT NULL,
      day_of_week INTEGER NOT NULL,
      day_name TEXT NOT NULL,
      notes TEXT DEFAULT '',
      FOREIGN KEY(diet_id) REFERENCES diet_plans(id) ON DELETE CASCADE
    )
  `);

  // Tabella Pasti del Giorno
  await runQuery(`
    CREATE TABLE IF NOT EXISTS diet_meals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      diet_day_id INTEGER NOT NULL,
      meal_type TEXT NOT NULL,
      time_suggestion TEXT DEFAULT '',
      items TEXT NOT NULL,
      notes TEXT DEFAULT '',
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY(diet_day_id) REFERENCES diet_days(id) ON DELETE CASCADE
    )
  `);

  // Tabella Template diete predefinite
  await runQuery(`
    CREATE TABLE IF NOT EXISTS diet_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT DEFAULT 'Generale',
      description TEXT DEFAULT '',
      target_calories INTEGER,
      structure_json TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Inserisci impostazioni predefinite se non presenti
  const settingsCount = await getRow(`SELECT COUNT(*) as count FROM clinic_settings`);
  if (settingsCount.count === 0) {
    await runQuery(`
      INSERT INTO clinic_settings (nutritionist_name, title, studio_name, address, phone, email, vat_piva, orders_code)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Dott.ssa Laura Gentile',
      'Biologa Nutrizionista - Spec. in Scienze dell\'Alimentazione',
      'NutriDesk Studio Nutrizionale',
      'Via Garibaldi 42, 20121 Milano (MI)',
      '+39 02 87654321',
      'info@studionutrizione.it',
      'P.IVA 09876543210',
      'Iscrizione ONB n. AA_012345'
    ]);
  }

  // Migrazione automatica: aggiungi colonna neck_circ se tabella visits già esiste
  try {
    const visitsCols = await getAll(`PRAGMA table_info(visits)`);
    if (visitsCols && visitsCols.length > 0 && !visitsCols.some(col => col.name === 'neck_circ')) {
      await runQuery(`ALTER TABLE visits ADD COLUMN neck_circ REAL;`);
      console.log('Migrazione completata: colonna neck_circ aggiunta alla tabella visits.');
    }
  } catch (err) {
    console.error('Info migrazione neck_circ:', err.message);
  }

  // Verifica se è necessario inserire i dati demo
  const patientsCount = await getRow(`SELECT COUNT(*) as count FROM patients`);
  if (patientsCount.count === 0) {
    await seedDemoData();
  }
};

// Funzione per generare dati demo realistici
const seedDemoData = async () => {
  console.log('Inizializzazione dati demo in corso...');

  // Paziente 1: Elena Colombo
  const p1 = await runQuery(`
    INSERT INTO patients (
      first_name, last_name, gender, birth_date, fiscal_code, phone, email,
      profession, address, height, initial_weight, target_weight, goal_description,
      activity_level, allergies, intolerances, pathologies, medications, lifestyle_notes,
      food_preferences, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Elena', 'Colombo', 'F', '1991-04-12', 'CLMELN91D52F205Z', '+39 347 1234567', 'elena.colombo@example.com',
    'Responsabile Marketing', 'Corso Buenos Aires 55, Milano', 165, 72.5, 62.0,
    'Perdita massa grassa, miglioramento energia e tono muscolare.',
    'moderata', 'Noci / Frutta a guscio', 'Lattosio (lieve)', 'Ipotiroidismo subclinico controllato',
    'Eutirox 50mcg al mattino a digiuno', 'Lavoro sedentario al computer, frequenta palestra 3 volte a settimana (pilates e pesi).',
    'Ama verdure grigliate, pesce e legumi. Non gradisce il fegato e i formaggi caprini.', 'attivo'
  ]);

  // Visite Paziente 1
  // Visita 1 (Iniziale)
  const v1_1 = await runQuery(`
    INSERT INTO visits (
      patient_id, visit_date, visit_type, weight, height, bmi,
      waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ, whr,
      clinical_notes, next_appointment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p1.id, '2026-07-05', 'Prima Visita', 72.5, 165, 26.63,
    78, 104, 85, 28, 59, 0.75,
    'Prima consulenza. Lieve ritenzione idrica arti inferiori. Motivazione alta. Si imposta piano da 1500 kcal.',
    '2026-08-08'
  ]);

  // BIA 1
  await runQuery(`
    INSERT INTO bia_measurements (
      visit_id, patient_id, measurement_date, device_model,
      resistance_rz, reactance_xc, phase_angle, fat_mass_kg, fat_mass_percent,
      fat_free_mass_kg, fat_free_mass_percent, total_body_water_lt, total_body_water_percent,
      extracellular_water_lt, extracellular_water_percent, intracellular_water_lt, intracellular_water_percent,
      body_cell_mass_kg, body_cell_mass_percent, visceral_fat_level, basal_metabolic_rate, bia_vector_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    v1_1.id, p1.id, '2026-07-05', 'Akern BIA 101 BIVA',
    590, 52, 5.04, 23.9, 33.0,
    48.6, 67.0, 35.6, 49.1,
    18.5, 52.0, 17.1, 48.0,
    21.8, 30.1, 6.5, 1380,
    'Vettore bioimpedenziometrico spostato verso il quadrante inferiore destro (idratazione abbondante con componente extracellulare aumentata). Tono muscolare medio.'
  ]);

  // Visita 2 (Controllo 1 mese)
  const v1_2 = await runQuery(`
    INSERT INTO visits (
      patient_id, visit_date, visit_type, weight, height, bmi,
      waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ, whr,
      clinical_notes, next_appointment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p1.id, '2026-08-08', 'Controllo', 69.8, 165, 25.64,
    75, 101, 81, 27.5, 57.5, 0.74,
    'Ottima aderenza alla dieta. Gonfiore addominale sparito, più energia durante gli allenamenti. -2.7 kg.',
    '2026-09-12'
  ]);

  // BIA 2
  await runQuery(`
    INSERT INTO bia_measurements (
      visit_id, patient_id, measurement_date, device_model,
      resistance_rz, reactance_xc, phase_angle, fat_mass_kg, fat_mass_percent,
      fat_free_mass_kg, fat_free_mass_percent, total_body_water_lt, total_body_water_percent,
      extracellular_water_lt, extracellular_water_percent, intracellular_water_lt, intracellular_water_percent,
      body_cell_mass_kg, body_cell_mass_percent, visceral_fat_level, basal_metabolic_rate, bia_vector_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    v1_2.id, p1.id, '2026-08-08', 'Akern BIA 101 BIVA',
    615, 60, 5.58, 21.6, 31.0,
    48.2, 69.0, 35.3, 50.6,
    17.6, 49.8, 17.7, 50.2,
    22.4, 32.1, 5.5, 1375,
    'Miglioramento notevole: riequilibrio dei fluidi ECW/ICW, calo mirato su massa grassa (-2.3 kg FM). Massa magra preservata.'
  ]);

  // Visita 3 (Controllo 2 mesi)
  const v1_3 = await runQuery(`
    INSERT INTO visits (
      patient_id, visit_date, visit_type, weight, height, bmi,
      waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ, whr,
      clinical_notes, next_appointment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p1.id, '2026-09-15', 'Controllo', 66.8, 165, 24.54,
    72, 98, 77, 26.5, 55.5, 0.73,
    'Obiettivo normopeso raggiunto! BMI a 24.5. Il vestiario è sceso di una taglia. Si prosegue verso il target 62 kg.',
    '2026-10-25'
  ]);

  // BIA 3
  await runQuery(`
    INSERT INTO bia_measurements (
      visit_id, patient_id, measurement_date, device_model,
      resistance_rz, reactance_xc, phase_angle, fat_mass_kg, fat_mass_percent,
      fat_free_mass_kg, fat_free_mass_percent, total_body_water_lt, total_body_water_percent,
      extracellular_water_lt, extracellular_water_percent, intracellular_water_lt, intracellular_water_percent,
      body_cell_mass_kg, body_cell_mass_percent, visceral_fat_level, basal_metabolic_rate, bia_vector_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    v1_3.id, p1.id, '2026-09-15', 'Akern BIA 101 BIVA',
    640, 68, 6.07, 18.7, 28.0,
    48.1, 72.0, 35.2, 52.7,
    16.8, 47.7, 18.4, 52.3,
    23.1, 34.6, 4.5, 1370,
    'Angolo di fase salito a 6.07°: eccellente vitalità e integrità cellulare. Distribuzione idrica ottimale.'
  ]);

  // Dieta Paziente 1
  const d1 = await runQuery(`
    INSERT INTO diet_plans (
      patient_id, title, start_date, end_date, target_calories, macronutrients,
      is_active, water_intake_recommendation, general_recommendations, physical_activity_recommendations,
      supplements, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p1.id, 'Piano Alimentare Dimagrimento & Tonificazione', '2026-09-16', '2026-11-15', 1550,
    JSON.stringify({ carb: 48, prot: 24, fat: 28 }), 1,
    'Bere 2.0 - 2.5 litri di acqua a basso residuo fisso durante tutto l\'arco della giornata.',
    'Usare 3 cucchiai di olio EVO al giorno (misurati con cucchiaio). Cottura preferibilmente a vapore, forno o piastra antiaderente. Spezie ed erbe aromatiche libere.',
    '3 sedute settimanali di fitness combinato (cardio moderato + sovraccarichi). 8.000-10.000 passi al giorno.',
    'Omega-3 (1 capsula a pranzo), Vitamina D3 (2000 UI)',
    'Concesso 1 pasto libero a settimana (es. pizza margherita con verdure grigliate).'
  ]);

  // Giorni Dieta 1 (Lunedì - Domenica)
  const daysData = [
    {
      num: 1, name: 'Lunedì',
      meals: [
        { type: 'Colazione', time: '07:30', items: JSON.stringify([{ food: 'Yogurt greco 0% o vegetale', qty: '150g' }, { food: 'Fiocchi d\'avena integrali', qty: '40g' }, { food: 'Frutti di bosco freschi', qty: '100g' }, { food: 'Semi di chia', qty: '10g' }]), notes: 'Opzione bevanda: Caffè amaro o tè verde.' },
        { type: 'Spuntino Mattina', time: '10:30', items: JSON.stringify([{ food: 'Mela o Pera con buccia', qty: '150g' }, { food: 'Mandorle pelate', qty: '15g' }]), notes: '' },
        { type: 'Pranzo', time: '13:00', items: JSON.stringify([{ food: 'Riso basmati o venere', qty: '70g' }, { food: 'Petto di pollo o tacchino ai ferri', qty: '130g' }, { food: 'Zucchine e carote al vapore', qty: '200g' }, { food: 'Olio extravergine d\'oliva', qty: '10g (1 cucchiaio)' }]), notes: 'Insaporire con curcuma e pepe nero.' },
        { type: 'Merenda Pomeriggio', time: '16:30', items: JSON.stringify([{ food: 'Yogurt magro bianco o kefir', qty: '125g' }, { food: 'Gallette di riso integrale o farro', qty: '2 pezzi' }]), notes: '' },
        { type: 'Cena', time: '20:00', items: JSON.stringify([{ food: 'Filetto di orata o branzino al forno', qty: '180g' }, { food: 'Finocchi e insalata mista', qty: 'A volontà' }, { food: 'Pane integrale o di segale', qty: '50g' }, { food: 'Olio extravergine d\'oliva', qty: '10g (1 cucchiaio)' }]), notes: '' }
      ]
    },
    {
      num: 2, name: 'Martedì',
      meals: [
        { type: 'Colazione', time: '07:30', items: JSON.stringify([{ food: 'Latte delattosato o di soia', qty: '200ml' }, { food: 'Pane di segale tostato', qty: '50g' }, { food: 'Marmellata 100% frutta senza zuccheri', qty: '25g' }]), notes: '' },
        { type: 'Spuntino Mattina', time: '10:30', items: JSON.stringify([{ food: 'Kiwi o Arancia', qty: '150g' }, { food: 'Noci dell\'Amazzonia o nocciole', qty: '15g' }]), notes: '' },
        { type: 'Pranzo', time: '13:00', items: JSON.stringify([{ food: 'Pasta integrale o farro perlato', qty: '70g' }, { food: 'Lenticchie o ceci lessati', qty: '120g' }, { food: 'Broccoli o cime di rapa', qty: '150g' }, { food: 'Olio extravergine d\'oliva', qty: '10g (1 cucchiaio)' }]), notes: 'Piatto unico proteico.' },
        { type: 'Merenda Pomeriggio', time: '16:30', items: JSON.stringify([{ food: 'Frutto fresco di stagione', qty: '150g' }, { food: 'Parmigiano Reggiano 24 mesi', qty: '20g' }]), notes: '' },
        { type: 'Cena', time: '20:00', items: JSON.stringify([{ food: 'Uova biologiche in camicia o sode', qty: '2 pezzi' }, { food: 'Spinaci saltati con limone', qty: '200g' }, { food: 'Patate lesse o al cartoccio', qty: '150g' }, { food: 'Olio extravergine d\'oliva', qty: '10g (1 cucchiaio)' }]), notes: '' }
      ]
    },
    {
      num: 3, name: 'Mercoledì',
      meals: [
        { type: 'Colazione', time: '07:30', items: JSON.stringify([{ food: 'Pancake d\'avena (albume 100ml + farina d\'avena 40g)', qty: '1 porzione' }, { food: 'Mirtilli freschi', qty: '80g' }, { food: 'Crema di mandorle 100%', qty: '10g' }]), notes: '' },
        { type: 'Spuntino Mattina', time: '10:30', items: JSON.stringify([{ food: 'Frutta fresca', qty: '150g' }]), notes: '' },
        { type: 'Pranzo', time: '13:00', items: JSON.stringify([{ food: 'Quinoa tricolore', qty: '70g' }, { food: 'Salmone fresco al cartoccio', qty: '130g' }, { food: 'Asparagi o fagiolini verdi', qty: '180g' }, { food: 'Olio EVO', qty: '5g' }]), notes: '' },
        { type: 'Merenda Pomeriggio', time: '16:30', items: JSON.stringify([{ food: 'Yogurt greco 0%', qty: '125g' }, { food: 'Cannella in polvere', qty: 'A piacere' }]), notes: '' },
        { type: 'Cena', time: '20:00', items: JSON.stringify([{ food: 'Ricotta fresca delattosata o primo sale', qty: '100g' }, { food: 'Vellutata di zucca e carote', qty: '250g' }, { food: 'Crostoni di pane integrale', qty: '40g' }, { food: 'Olio extravergine d\'oliva', qty: '10g' }]), notes: '' }
      ]
    },
    {
      num: 4, name: 'Giovedì',
      meals: [
        { type: 'Colazione', time: '07:30', items: JSON.stringify([{ food: 'Porridge d\'avena con latte di soia', qty: '1 tazza' }, { food: 'Semi di lino tritati', qty: '10g' }, { food: 'Banana matura a rondelle', qty: '80g' }]), notes: '' },
        { type: 'Spuntino Mattina', time: '10:30', items: JSON.stringify([{ food: 'Pompelmo o frutti rossi', qty: '150g' }, { food: 'Anacardi al naturale', qty: '15g' }]), notes: '' },
        { type: 'Pranzo', time: '13:00', items: JSON.stringify([{ food: 'Grano saraceno con cubetti di tofu o pollo', qty: '70g grano + 100g pollo' }, { food: 'Peperoni e melanzane alla piastra', qty: '200g' }, { food: 'Olio EVO', qty: '10g' }]), notes: '' },
        { type: 'Merenda Pomeriggio', time: '16:30', items: JSON.stringify([{ food: 'Spremuta d\'arancia fresca', qty: '150ml' }, { food: 'Crackers integrali', qty: '25g' }]), notes: '' },
        { type: 'Cena', time: '20:00', items: JSON.stringify([{ food: 'Trancio di merluzzo o nasello al pomodoro', qty: '180g' }, { food: 'Insalata di rucola e pomodorini', qty: '150g' }, { food: 'Patate novelle al rosmarino', qty: '150g' }, { food: 'Olio EVO', qty: '10g' }]), notes: '' }
      ]
    },
    {
      num: 5, name: 'Venerdì',
      meals: [
        { type: 'Colazione', time: '07:30', items: JSON.stringify([{ food: 'Yogurt greco 0%', qty: '150g' }, { food: 'Fiocchi di farro integrali', qty: '40g' }, { food: 'Fragole o lamponi', qty: '100g' }]), notes: '' },
        { type: 'Spuntino Mattina', time: '10:30', items: JSON.stringify([{ food: 'Mela annurca', qty: '1 frutto' }, { food: 'Noci nostrane', qty: '15g' }]), notes: '' },
        { type: 'Pranzo', time: '13:00', items: JSON.stringify([{ food: 'Couscous integrale con verdure saltate', qty: '70g' }, { food: 'Bocconcini di tacchino al curry', qty: '130g' }, { food: 'Olio EVO', qty: '10g' }]), notes: '' },
        { type: 'Merenda Pomeriggio', time: '16:30', items: JSON.stringify([{ food: 'Kefir da bere', qty: '150ml' }]), notes: '' },
        { type: 'Cena', time: '20:00', items: JSON.stringify([{ food: 'Tagliata di manzo magro o scamone', qty: '150g' }, { food: 'Funghi trifolati e radicchio alla piastra', qty: '200g' }, { food: 'Pane multicereali', qty: '40g' }, { food: 'Olio EVO', qty: '10g' }]), notes: '' }
      ]
    },
    {
      num: 6, name: 'Sabato',
      meals: [
        { type: 'Colazione', time: '08:30', items: JSON.stringify([{ food: 'Toast integrale con 40g fesa di tacchino o bresaola', qty: '1 pezzo' }, { food: 'Spremuta di melagrana o arancia', qty: '150ml' }]), notes: 'Colazione salata del weekend.' },
        { type: 'Spuntino Mattina', time: '11:00', items: JSON.stringify([{ food: 'Macedonia mista di frutta fresca al limone', qty: '150g' }]), notes: '' },
        { type: 'Pranzo', time: '13:30', items: JSON.stringify([{ food: 'Insalata di riso nero con gamberetti e zucchine', qty: '70g riso + 120g gamberi' }, { food: 'Misticanza fresca', qty: 'A piacere' }, { food: 'Olio EVO', qty: '10g' }]), notes: '' },
        { type: 'Merenda Pomeriggio', time: '17:00', items: JSON.stringify([{ food: 'Frutto a scelta', qty: '1 pezzo' }, { food: 'Cioccolato fondente 85%+', qty: '15g' }]), notes: '' },
        { type: 'Cena', time: '20:30', items: JSON.stringify([{ food: 'Pasto libero concordato (es. Pizza napoletana alle verdure)', qty: '1 porzione' }, { food: 'Acqua minerale', qty: 'A volontà' }]), notes: 'Cena conviviale. Mangiare con calma gustando ogni boccone senza eccessi.' }
      ]
    },
    {
      num: 7, name: 'Domenica',
      meals: [
        { type: 'Colazione', time: '09:00', items: JSON.stringify([{ food: 'Crostata integrale fatta in casa con marmellata senza zuccheri', qty: '60g' }, { food: 'Caffellatte scremato o bevanda vegetale', qty: '200ml' }]), notes: '' },
        { type: 'Spuntino Mattina', time: '11:30', items: JSON.stringify([{ food: 'Infuso ai frutti rossi o tè bianco', qty: '1 tazza' }]), notes: '' },
        { type: 'Pranzo', time: '13:30', items: JSON.stringify([{ food: 'Gnocchi di patate al pomodoro fresco e basilico', qty: '120g' }, { food: 'Pollo ruspante al forno alle erbe aromatiche', qty: '130g' }, { food: 'Insalata mista di carote e finocchi', qty: '200g' }, { food: 'Olio EVO', qty: '10g' }]), notes: 'Pranzo domenicale bilanciato.' },
        { type: 'Merenda Pomeriggio', time: '17:00', items: JSON.stringify([{ food: 'Yogurt magro', qty: '125g' }, { food: 'Gherigli di noce', qty: '10g' }]), notes: '' },
        { type: 'Cena', time: '20:00', items: JSON.stringify([{ food: 'Passato di verdure depurativo', qty: '300g' }, { food: 'Uovo sodo o 80g tonno al naturale', qty: '1 porzione' }, { food: 'Crostini di segale integrali', qty: '30g' }, { food: 'Olio EVO a crudo', qty: '10g' }]), notes: 'Cena leggera post-weekend.' }
      ]
    }
  ];

  for (const day of daysData) {
    const dayRow = await runQuery(`
      INSERT INTO diet_days (diet_id, day_of_week, day_name)
      VALUES (?, ?, ?)
    `, [d1.id, day.num, day.name]);

    for (let i = 0; i < day.meals.length; i++) {
      const m = day.meals[i];
      await runQuery(`
        INSERT INTO diet_meals (diet_day_id, meal_type, time_suggestion, items, notes, sort_order)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [dayRow.id, m.type, m.time, m.items, m.notes, i]);
    }
  }

  // Paziente 2: Roberto Moretti (Uomo, 44 anni, sovrappeso con accumulo addominale / grasso viscerale)
  const p2 = await runQuery(`
    INSERT INTO patients (
      first_name, last_name, gender, birth_date, fiscal_code, phone, email,
      profession, address, height, initial_weight, target_weight, goal_description,
      activity_level, allergies, intolerances, pathologies, medications, lifestyle_notes,
      food_preferences, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Roberto', 'Moretti', 'M', '1982-11-23', 'MRTRRT82S23F205W', '+39 335 9876543', 'roberto.moretti@studiolegale.it',
    'Avvocato penalista', 'Via Montenapoleone 18, Milano', 178, 89.2, 79.0,
    'Riduzione circonferenza addominale, controllo colesterolemia, miglioramento parametri epatici.',
    'leggera', 'Crostacei', '', 'Ipercolesterolemia lieve, fegato steatosico (grado I)',
    'Nessuno al momento. Integratore riso rosso fermentato consigliato dal medico curante.',
    'Pranzi spesso fuori casa per lavoro (ristorante / bar). Cene tardive. Scarso consumo di verdure prima della visita.',
    'Preferisce primi piatti e carni bianche. Poco amante dei legumi se non frullati.', 'attivo'
  ]);

  const v2_1 = await runQuery(`
    INSERT INTO visits (
      patient_id, visit_date, visit_type, weight, height, bmi,
      waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ, whr,
      clinical_notes, next_appointment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p2.id, '2026-08-14', 'Prima Visita', 89.2, 178, 28.15,
    98, 105, 102, 32, 60, 0.93,
    'Visita iniziale. Conformazione androide con adiposità viscerale marcata. Si imposta piano alimentare mediterraneo ipoglucidico da 1800 kcal con opzioni pratiche per pranzi di lavoro.',
    '2026-09-20'
  ]);

  await runQuery(`
    INSERT INTO bia_measurements (
      visit_id, patient_id, measurement_date, device_model,
      resistance_rz, reactance_xc, phase_angle, fat_mass_kg, fat_mass_percent,
      fat_free_mass_kg, fat_free_mass_percent, total_body_water_lt, total_body_water_percent,
      extracellular_water_lt, extracellular_water_percent, intracellular_water_lt, intracellular_water_percent,
      body_cell_mass_kg, body_cell_mass_percent, visceral_fat_level, basal_metabolic_rate, bia_vector_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    v2_1.id, p2.id, '2026-08-14', 'Akern BIA 101 BIVA',
    490, 48, 5.60, 26.8, 30.0,
    62.4, 70.0, 45.7, 51.2,
    22.8, 49.9, 22.9, 50.1,
    30.5, 34.2, 11.0, 1750,
    'Livello di grasso viscerale elevato (livello 11). Angolo di fase 5.6°. Massa muscolare discreta ma mascherata da adiposità tronculare.'
  ]);

  const v2_2 = await runQuery(`
    INSERT INTO visits (
      patient_id, visit_date, visit_type, weight, height, bmi,
      waist_circ, hip_circ, abdomen_circ, arm_circ, thigh_circ, whr,
      clinical_notes, next_appointment
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    p2.id, '2026-09-22', 'Controllo', 86.4, 178, 27.27,
    94, 104, 97, 31.5, 59, 0.90,
    'Primo controllo molto positivo: -2.8 kg e soprattutto -5 cm di circonferenza addominale! Pressione arteriosa ottimizzata.',
    '2026-11-05'
  ]);

  await runQuery(`
    INSERT INTO bia_measurements (
      visit_id, patient_id, measurement_date, device_model,
      resistance_rz, reactance_xc, phase_angle, fat_mass_kg, fat_mass_percent,
      fat_free_mass_kg, fat_free_mass_percent, total_body_water_lt, total_body_water_percent,
      extracellular_water_lt, extracellular_water_percent, intracellular_water_lt, intracellular_water_percent,
      body_cell_mass_kg, body_cell_mass_percent, visceral_fat_level, basal_metabolic_rate, bia_vector_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    v2_2.id, p2.id, '2026-09-22', 'Akern BIA 101 BIVA',
    515, 54, 5.99, 24.2, 28.0,
    62.2, 72.0, 45.5, 52.7,
    22.0, 48.4, 23.5, 51.6,
    31.2, 36.1, 9.5, 1740,
    'Grasso viscerale sceso sotto la soglia di guardia a livello 9.5. Angolo di fase in ascesa a quasi 6.0°.'
  ]);

  // Paziente 3: Martina Ferri (Sportiva, 26 anni, normopeso, ricomposizione corporea)
  await runQuery(`
    INSERT INTO patients (
      first_name, last_name, gender, birth_date, fiscal_code, phone, email,
      profession, address, height, initial_weight, target_weight, goal_description,
      activity_level, allergies, intolerances, pathologies, medications, lifestyle_notes,
      food_preferences, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    'Martina', 'Ferri', 'F', '2000-01-18', 'FRRMTN00A58F205K', '+39 328 5551234', 'martina.ferri@fitmail.com',
    'Personal Trainer & Studentessa', 'Viale Monza 110, Milano', 170, 61.5, 60.0,
    'Definizione muscolare pre-gara, ottimizzazione idratazione cellulare e recupero post-workout.',
    'atleta', '', 'Nessuna', 'Nessuna', 'Nessuno',
    'Si allena 5 volte a settimana con pesi intensi e interval training. Molto metodica.',
    'Alimentazione sana e bilanciata, predilige avena, riso, salmone, uova, verdure di stagione.', 'attivo'
  ]);

  // Template diete salvati
  await runQuery(`
    INSERT INTO diet_templates (name, category, description, target_calories, structure_json)
    VALUES (?, ?, ?, ?, ?)
  `, [
    'Dieta Mediterranea Ipocalorica Standard 1500 kcal',
    'Dimagrimento',
    'Schema settimanale bilanciato con carboidrati a basso indice glicemico, proteine nobili e verdure di stagione.',
    1500,
    JSON.stringify(daysData)
  ]);

  await runQuery(`
    INSERT INTO diet_templates (name, category, description, target_calories, structure_json)
    VALUES (?, ?, ?, ?, ?)
  `, [
    'Piano Nutrizionale Iperproteico Sport & Ricomposizione 1800 kcal',
    'Sport & Fitness',
    'Adatto ad atleti e soggetti sportivi con quota proteica al 28-30% e distribuzione pasti pre/post workout.',
    1800,
    JSON.stringify(daysData)
  ]);

  console.log('Dati demo inseriti con successo!');
};

module.exports = {
  db,
  runQuery,
  getRow,
  getAll,
  initDatabase,
  seedDemoData,
  dbPath
};
