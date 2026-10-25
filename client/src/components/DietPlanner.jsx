import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Copy,
  Printer,
  Save,
  Check,
  Calendar,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Share2,
  FileText
} from 'lucide-react';
import { api } from '../api';
import DietPrintModal, { initializePlanData } from './DietPrintModal';
import { exportDietToWord } from '../utils/exportWord';

export default function DietPlanner({
  patient,
  patients = [],
  onSelectPatient,
  settings
}) {
  const [selectedPatientId, setSelectedPatientId] = useState(patient?.id || (patients[0]?.id || ''));
  const [diets, setDiets] = useState([]);
  const [activeDiet, setActiveDiet] = useState(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0); // 0 = Lunedì, 6 = Domenica
  const [isEditing, setIsEditing] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [templates, setTemplates] = useState([]);

  // Form stato dieta
  const [dietForm, setDietForm] = useState({
    title: 'Nuovo Piano Alimentare',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    target_calories: 1600,
    macronutrients: { carb: 50, prot: 20, fat: 30 },
    is_active: 1,
    water_intake_recommendation: 'Bere almeno 2.0L di acqua naturale al giorno.',
    general_recommendations: 'Utilizzare 3-4 cucchiai di olio extravergine d\'oliva al giorno. Cotture a vapore o piastra.',
    physical_activity_recommendations: 'Attività aerobica moderata 3-4 volte a settimana.',
    supplements: '',
    notes: '',
    days: [
      { day_of_week: 1, day_name: 'Lunedì', meals: getDefaultMeals() },
      { day_of_week: 2, day_name: 'Martedì', meals: getDefaultMeals() },
      { day_of_week: 3, day_name: 'Mercoledì', meals: getDefaultMeals() },
      { day_of_week: 4, day_name: 'Giovedì', meals: getDefaultMeals() },
      { day_of_week: 5, day_name: 'Venerdì', meals: getDefaultMeals() },
      { day_of_week: 6, day_name: 'Sabato', meals: getDefaultMeals() },
      { day_of_week: 7, day_name: 'Domenica', meals: getDefaultMeals() }
    ]
  });

  function getDefaultMeals() {
    return [
      {
        meal_type: 'Colazione',
        time_suggestion: '07:30',
        items: [{ food: 'Yogurt greco bianco 0%', qty: '150g' }, { food: 'Fiocchi d\'avena integrali', qty: '40g' }],
        notes: 'Caffè o tè non zuccherato a piacere.'
      },
      {
        meal_type: 'Spuntino Mattina',
        time_suggestion: '10:30',
        items: [{ food: 'Frutta fresca di stagione', qty: '1 frutto (150g)' }, { food: 'Mandorle o noci', qty: '15g' }],
        notes: ''
      },
      {
        meal_type: 'Pranzo',
        time_suggestion: '13:00',
        items: [{ food: 'Pasta o Riso integrale', qty: '70g' }, { food: 'Petto di pollo o pesce magro', qty: '130g' }, { food: 'Verdure di stagione a volontà', qty: 'Abbondante' }, { food: 'Olio EVO', qty: '1 cucchiaio' }],
        notes: 'Cottura leggera.'
      },
      {
        meal_type: 'Merenda Pomeriggio',
        time_suggestion: '16:30',
        items: [{ food: 'Frutto fresco o yogurt magro', qty: '1 porzione' }],
        notes: ''
      },
      {
        meal_type: 'Cena',
        time_suggestion: '20:00',
        items: [{ food: 'Secondo proteico (pesce / uova / legumi)', qty: '1 porzione' }, { food: 'Contorno di verdure cotte o insalata', qty: 'Abbondante' }, { food: 'Pane integrale o patate', qty: '50g / 150g' }, { food: 'Olio EVO', qty: '1 cucchiaio' }],
        notes: ''
      }
    ];
  }

  // Carica diete quando cambia il paziente
  useEffect(() => {
    if (selectedPatientId) {
      loadPatientDiets(selectedPatientId);
    }
    loadTemplates();
  }, [selectedPatientId]);

  const loadTemplates = async () => {
    try {
      const t = await api.getTemplates();
      setTemplates(t || []);
    } catch (e) {
      console.error(e);
    }
  };

  const loadPatientDiets = async (pId) => {
    try {
      const data = await api.getPatientDiets(pId);
      setDiets(data);
      if (data.length > 0) {
        // Carica la prima (attiva o più recente)
        loadDietDetails(data[0].id);
      } else {
        setActiveDiet(null);
        setIsEditing(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDietDetails = async (dietId) => {
    try {
      const detail = await api.getDietDetail(dietId);
      setActiveDiet(detail);
      setDietForm({
        ...detail,
        days: detail.days || []
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  // Creazione nuova dieta
  const handleStartNewDiet = () => {
    const today = new Date().toISOString().split('T')[0];
    setDietForm({
      title: 'Nuovo Piano Alimentare Settimanale',
      start_date: today,
      end_date: '',
      target_calories: 1600,
      macronutrients: { carb: 50, prot: 20, fat: 30 },
      is_active: 1,
      water_intake_recommendation: 'Bere almeno 2.0L di acqua naturale al giorno.',
      general_recommendations: 'Utilizzare 3-4 cucchiai di olio extravergine d\'oliva al giorno. Cotture al vapore, piastra o forno.',
      physical_activity_recommendations: 'Attività fisica moderata 3 volte a settimana.',
      supplements: '',
      notes: '',
      days: [
        { day_of_week: 1, day_name: 'Lunedì', meals: getDefaultMeals() },
        { day_of_week: 2, day_name: 'Martedì', meals: getDefaultMeals() },
        { day_of_week: 3, day_name: 'Mercoledì', meals: getDefaultMeals() },
        { day_of_week: 4, day_name: 'Giovedì', meals: getDefaultMeals() },
        { day_of_week: 5, day_name: 'Venerdì', meals: getDefaultMeals() },
        { day_of_week: 6, day_name: 'Sabato', meals: getDefaultMeals() },
        { day_of_week: 7, day_name: 'Domenica', meals: getDefaultMeals() }
      ]
    });
    setActiveDiet(null);
    setIsEditing(true);
  };

  // Carica il modello esatto estratto dal PDF (2200 kcal)
  const handleLoadPdfModelDiet = () => {
    const today = new Date().toISOString().split('T')[0];
    setDietForm({
      title: 'Piano Alimentare Personalizzato (2200 kcal)',
      start_date: today,
      end_date: '',
      target_calories: 2200,
      macronutrients: { carb: 50, prot: 20, fat: 30 },
      is_active: 1,
      water_intake_recommendation: "Non aspettare di avere sete per bere: idratarsi con almeno 2L d'acqua al giorno.",
      general_recommendations: "Ascolta il tuo corpo. Gestisci gli sgarri senza sensi di colpa. Puoi invertire i pasti nella giornata o i giorni della settimana.",
      physical_activity_recommendations: "Durante l'allenamento sciogli in 1L di acqua 2g di magnesio e potassio. Segui il timing pre/post workout.",
      supplements: 'Magnesio e Potassio 2g in borraccia',
      notes: '',
      days: [
        {
          day_of_week: 1,
          day_name: 'Lunedì',
          notes: '150g di petto di pollo/tacchino/maiale: al limone, all’arancia, al latte, panato, infarinato e cotto con olio e rosmarino, tritato e poi panato (come cotolette e nuggets)',
          meals: [
            {
              meal_type: 'Colazione',
              time_suggestion: '07:30',
              items: [
                { food: 'Yogurt Muller con palline di cioccolato', qty: '125g' },
                { food: 'Fette biscottate integrali o 3 biscotti OSWEGO senza zuccheri', qty: '3 fette' },
                { food: 'Nutella (circa 3 cucchiaini da caffè rasi)', qty: '15g' }
              ],
              notes: ''
            },
            {
              meal_type: 'Spuntino Mattina',
              time_suggestion: '10:30',
              items: [
                { food: 'Pane', qty: '60g' },
                { food: 'Bresaola / prosciutto cotto o crudo', qty: '40g' }
              ],
              notes: 'Spuntino a scuola'
            },
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:00',
              items: [
                { food: 'Pasta*¹', qty: '100g' },
                { food: 'Petto di pollo*²', qty: '200g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '2 cucchiaini (10g)' }
              ],
              notes: '*¹ Sostituzioni: 150g pane, 80g pasta+30g pane. *² Sostituzioni: petto di tacchino, coniglio, filetto/arista di maiale'
            },
            {
              meal_type: 'Merenda Pomeriggio',
              time_suggestion: '16:30',
              items: [
                { food: 'Noci o nocciole', qty: '20g' },
                { food: 'Frutto fresco', qty: '1 frutto' }
              ],
              notes: ''
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:00',
              items: [
                { food: 'Piadina all’olio di oliva', qty: '120g circa' },
                { food: 'Bresaola / prosciutto crudo o cotto', qty: '40g' },
                { food: 'Philadelphia light, stracchino o crescenza', qty: '35g' },
                { food: 'Frutta e verdura', qty: 'A volontà' }
              ],
              notes: ''
            }
          ]
        },
        {
          day_of_week: 2,
          day_name: 'Martedì',
          notes: '',
          meals: [
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:00',
              items: [
                { food: 'Gnocchi di patate', qty: '200g' },
                { food: 'Macinato di manzo magro', qty: '150g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '2 cucchiaini (10g)' }
              ],
              notes: ''
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:00',
              items: [
                { food: 'Pane*¹', qty: '150g' },
                { food: 'Mozzarella light (intera)', qty: '125g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '2 cucchiaini (10g)' }
              ],
              notes: '*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane'
            }
          ]
        },
        {
          day_of_week: 3,
          day_name: 'Mercoledì',
          notes: '150g di petto di pollo/tacchino/maiale: al limone, all’arancia, al latte, panato, infarinato e cotto con olio e rosmarino, tritato e poi panato (come cotolette e nuggets)',
          meals: [
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:00',
              items: [
                { food: 'Pasta*¹', qty: '100g' },
                { food: 'Uova intere', qty: '2 uova' },
                { food: 'Guanciale', qty: '30g' },
                { food: 'Parmigiano Reggiano', qty: '1 cucchiaio' },
                { food: 'Frutta e verdura', qty: 'A volontà' }
              ],
              notes: '*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane'
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:00',
              items: [
                { food: 'Pane*¹', qty: '150g' },
                { food: 'Petto di pollo*²', qty: '200g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '2 cucchiaini (10g)' }
              ],
              notes: '*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane. *² Sostituzioni: petto di tacchino, coniglio, filetto/arista di maiale'
            }
          ]
        },
        {
          day_of_week: 4,
          day_name: 'Giovedì',
          notes: '',
          meals: [
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:00',
              items: [
                { food: 'Pasta*¹', qty: '100g' },
                { food: 'Tonno fresco/congelato o in scatola al naturale', qty: '100g (56gx2)' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '3 cucchiaini (15g)' }
              ],
              notes: '*¹ Sostituzioni: 150g pane, 80g pasta+30g pane'
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:00',
              items: [
                { food: 'Pane*¹', qty: '150g' },
                { food: 'Filetto di vitello', qty: '150g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '3 cucchiaini (15g)' }
              ],
              notes: '*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane'
            }
          ]
        },
        {
          day_of_week: 5,
          day_name: 'Venerdì',
          notes: '150g di macinato di manzo: hamburger (fatto in casa), pasta al ragù, macinato con pomodoro da mangiare con il pane',
          meals: [
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:00',
              items: [
                { food: 'Gnocchi di patate', qty: '200g' },
                { food: 'Petto di pollo*¹', qty: '150g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '2 cucchiaini (10g)' }
              ],
              notes: '*¹ Sostituzioni: petto di tacchino, coniglio, filetto/arista di maiale'
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:00',
              items: [
                { food: 'Pane*¹', qty: '150g' },
                { food: 'Macinato di manzo magro', qty: '150g' },
                { food: 'Frutta e verdura', qty: 'A volontà' },
                { food: 'Olio extravergine d\'oliva', qty: '2 cucchiaini (10g)' }
              ],
              notes: '*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane'
            }
          ]
        },
        {
          day_of_week: 6,
          day_name: 'Sabato',
          notes: 'Gusta il pasto conviviale con tranquillità, masticando lentamente.',
          meals: [
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:30',
              items: [
                { food: 'Riso basmati o couscous', qty: '100g' },
                { food: 'Trancio di salmone o pesce spada', qty: '180g' },
                { food: 'Verdure alla griglia', qty: 'A piacere' },
                { food: 'Olio EVO', qty: '2 cucchiaini' }
              ],
              notes: '*¹ Sostituzioni: 120g pasta o 150g pane'
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:30',
              items: [
                { food: 'Pasto libero concordato (es. Pizza margherita o con verdure)', qty: '1 porzione' },
                { food: 'Acqua naturale a volontà', qty: 'Abbondante' },
                { food: 'Frutta fresca o sorbetto al limone', qty: '1 porzione' }
              ],
              notes: ''
            }
          ]
        },
        {
          day_of_week: 7,
          day_name: 'Domenica',
          notes: '',
          meals: [
            {
              meal_type: 'Pranzo',
              time_suggestion: '13:00',
              items: [
                { food: 'Pasta al forno o risotto ai funghi', qty: '100g' },
                { food: 'Arrosto di vitello o tacchino', qty: '150g' },
                { food: 'Insalata mista e carote', qty: 'A piacere' },
                { food: 'Olio EVO', qty: '2 cucchiaini' }
              ],
              notes: ''
            },
            {
              meal_type: 'Cena',
              time_suggestion: '20:00',
              items: [
                { food: 'Vellutata di verdure o minestrone', qty: '1 porzione' },
                { food: 'Ricotta fresca o 2 uova in camicia', qty: '100g' },
                { food: 'Pane integrale tostato', qty: '60g' },
                { food: 'Olio EVO', qty: '1 cucchiaino' }
              ],
              notes: ''
            }
          ]
        }
      ]
    });
    setActiveDiet(null);
    setIsEditing(true);
  };

  // Modifica pasto nel giorno corrente
  const updateMealFood = (dayIdx, mealIdx, foodIdx, field, value) => {
    setDietForm(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIdx].meals];
      const newItems = [...newMeals[mealIdx].items];
      newItems[foodIdx] = { ...newItems[foodIdx], [field]: value };
      newMeals[mealIdx] = { ...newMeals[mealIdx], items: newItems };
      newDays[dayIdx] = { ...newDays[dayIdx], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  const addMealFood = (dayIdx, mealIdx) => {
    setDietForm(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIdx].meals];
      const newItems = [...(newMeals[mealIdx].items || []), { food: '', qty: '' }];
      newMeals[mealIdx] = { ...newMeals[mealIdx], items: newItems };
      newDays[dayIdx] = { ...newDays[dayIdx], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  const removeMealFood = (dayIdx, mealIdx, foodIdx) => {
    setDietForm(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIdx].meals];
      const newItems = newMeals[mealIdx].items.filter((_, idx) => idx !== foodIdx);
      newMeals[mealIdx] = { ...newMeals[mealIdx], items: newItems };
      newDays[dayIdx] = { ...newDays[dayIdx], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  const updateMealNotes = (dayIdx, mealIdx, notes) => {
    setDietForm(prev => {
      const newDays = [...prev.days];
      const newMeals = [...newDays[dayIdx].meals];
      newMeals[mealIdx] = { ...newMeals[mealIdx], notes };
      newDays[dayIdx] = { ...newDays[dayIdx], meals: newMeals };
      return { ...prev, days: newDays };
    });
  };

  // Funzione magica: Copia Lunedì su tutti i giorni feriali (Martedì-Venerdì)
  const copyMondayToWeekdays = () => {
    const mondayMeals = JSON.parse(JSON.stringify(dietForm.days[0].meals));
    setDietForm(prev => {
      const newDays = prev.days.map((day, idx) => {
        // Martedì (1), Mercoledì (2), Giovedì (3), Venerdì (4)
        if (idx >= 1 && idx <= 4) {
          return {
            ...day,
            meals: JSON.parse(JSON.stringify(mondayMeals))
          };
        }
        return day;
      });
      return { ...prev, days: newDays };
    });
    alert('Schema di Lunedì copiato con successo su Martedì, Mercoledì, Giovedì e Venerdì!');
  };

  // Carica da Modello
  const applyTemplate = (template) => {
    if (confirm(`Vuoi applicare il modello "${template.name}"? I pasti correnti verranno sostituiti con quelli del modello.`)) {
      setDietForm(prev => ({
        ...prev,
        title: template.name,
        target_calories: template.target_calories || prev.target_calories,
        days: template.structure.map((d, idx) => ({
          day_of_week: d.num || idx + 1,
          day_name: d.name,
          meals: d.meals.map(m => ({
            ...m,
            items: typeof m.items === 'string' ? JSON.parse(m.items) : m.items
          }))
        }))
      }));
    }
  };

  // Salva Dieta su SQLite
  const handleSaveDiet = async (e) => {
    e.preventDefault();
    if (!dietForm.title || !dietForm.start_date) {
      alert('Titolo e Data inizio sono obbligatori.');
      return;
    }

    try {
      if (activeDiet?.id && isEditing) {
        // Aggiorna esistente
        await api.updateDiet(activeDiet.id, dietForm);
        alert('Piano alimentare aggiornato con successo!');
        loadDietDetails(activeDiet.id);
      } else {
        // Crea nuova
        const res = await api.createDiet(selectedPatientId, dietForm);
        alert('Nuovo piano alimentare creato con successo!');
        loadPatientDiets(selectedPatientId);
      }
      setIsEditing(false);
    } catch (err) {
      alert('Errore durante il salvataggio: ' + err.message);
    }
  };

  // Duplica dieta per fare una revisione
  const handleDuplicate = async () => {
    if (!activeDiet?.id) return;
    try {
      const res = await api.duplicateDiet(activeDiet.id);
      alert('Piano duplicato con successo!');
      loadPatientDiets(selectedPatientId);
      loadDietDetails(res.id);
      setIsEditing(true);
    } catch (err) {
      alert('Errore duplicazione: ' + err.message);
    }
  };

  // Elimina dieta
  const handleDelete = async () => {
    if (!activeDiet?.id) return;
    if (confirm('Sei sicuro di voler eliminare questo piano alimentare?')) {
      await api.deleteDiet(activeDiet.id);
      loadPatientDiets(selectedPatientId);
    }
  };

  // Esporta direttamente in Microsoft Word (.docx)
  const handleExportWordDirect = async () => {
    try {
      const planData = initializePlanData(activeDiet || dietForm, currentPatient);
      const blob = await exportDietToWord(planData, currentPatient, settings);
      const safeName = (planData.patient_name || 'Paziente').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `Piano_Alimentare_${safeName}_${planData.target_calories || 2200}kcal.docx`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Errore esportazione Word:', err);
      alert('Errore esportazione Word: ' + err.message);
    }
  };

  // Salva le modifiche apportate direttamente nella modale anteprima
  const handleDirectDietSave = (updatedPlan) => {
    setDietForm(prev => ({
      ...prev,
      target_calories: updatedPlan.target_calories || prev.target_calories,
      macronutrients: updatedPlan.macronutrients || prev.macronutrients,
      start_date: updatedPlan.start_date || prev.start_date,
      end_date: updatedPlan.end_date || prev.end_date,
      recommendations: updatedPlan.recommendations,
      cooking_tips: updatedPlan.cooking_tips,
      colazione_spuntini: updatedPlan.colazione_spuntini,
      sport_timing: updatedPlan.sport_timing
    }));
    if (activeDiet) {
      setActiveDiet(prev => ({
        ...prev,
        target_calories: updatedPlan.target_calories || prev.target_calories,
        macronutrients: updatedPlan.macronutrients || prev.macronutrients,
        start_date: updatedPlan.start_date || prev.start_date,
        end_date: updatedPlan.end_date || prev.end_date,
        recommendations: updatedPlan.recommendations,
        cooking_tips: updatedPlan.cooking_tips,
        colazione_spuntini: updatedPlan.colazione_spuntini,
        sport_timing: updatedPlan.sport_timing
      }));
    }
  };

  // Paziente selezionato
  const currentPatient = patients.find(p => p.id === Number(selectedPatientId)) || patient;

  return (
    <div className="diet-planner-view">
      {/* Barra selezione paziente se aperto da menu laterale */}
      {!patient && patients.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Paziente:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="form-control"
                style={{ width: 'auto', minWidth: '240px' }}
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.last_name} {p.first_name} {p.has_active_diet ? '(Dieta attiva)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button onClick={handleStartNewDiet} className="btn btn-primary btn-sm">
                <Plus size={15} />
                <span>Nuova Dieta per questo Paziente</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selettore Storico Piani Alimentari del Paziente */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
          {diets.map(d => (
            <button
              key={d.id}
              onClick={() => loadDietDetails(d.id)}
              className={`btn btn-sm ${activeDiet?.id === d.id && !isEditing ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <span>{d.title}</span>
              {d.is_active === 1 && (
                <span className="badge badge-success" style={{ padding: '1px 5px', fontSize: '0.65rem' }}>
                  ATTIVA
                </span>
              )}
            </button>
          ))}

          {diets.length === 0 && (
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Nessuna dieta assegnata al momento.
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="btn btn-outline-primary btn-sm"
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={15} />
            <span>Anteprima & Stampa PDF (A4 Ufficiale)</span>
          </button>

          <button
            type="button"
            onClick={handleExportWordDirect}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', color: '#1d4ed8', borderColor: '#93c5fd', backgroundColor: '#ffffff' }}
            title="Scarica il piano alimentare in formato Microsoft Word (.docx) per modificarlo con Word o LibreOffice"
          >
            <FileText size={15} />
            <span>Scarica Word (.docx)</span>
          </button>

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="btn btn-secondary btn-sm"
            style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Condividi il file PDF del piano alimentare con il paziente (WhatsApp, Email, App)"
          >
            <Share2 size={15} />
            <span>Condividi PDF</span>
          </button>

          <button
            type="button"
            onClick={handleLoadPdfModelDiet}
            className="btn btn-secondary btn-sm"
            title="Carica la dieta 2200 kcal identica al PDF di riferimento"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} style={{ color: 'var(--primary)' }} />
            <span>Carica Modello PDF (2200 kcal)</span>
          </button>

          {activeDiet && !isEditing && (
            <>
              <button
                onClick={handleDuplicate}
                className="btn btn-secondary btn-sm"
                title="Crea una copia modificabile per revisione"
              >
                <Copy size={15} />
                <span>Duplica per Revisione</span>
              </button>

              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary btn-sm"
              >
                Modifica Schema
              </button>

              <button
                onClick={handleDelete}
                className="btn btn-danger btn-sm"
                title="Elimina dieta"
              >
                <Trash2 size={15} />
              </button>
            </>
          )}

          {(!activeDiet || !isEditing) && (
            <button onClick={handleStartNewDiet} className="btn btn-primary btn-sm">
              <Plus size={15} />
              <span>Crea Nuova Dieta</span>
            </button>
          )}
        </div>
      </div>

      {/* EDITOR / VISUALIZZATORE PIANO ALIMENTARE */}
      {(isEditing || activeDiet) ? (
        <form onSubmit={handleSaveDiet}>
          {/* Card Impostazioni Generali della Dieta */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">
                <UtensilsCrossed size={18} style={{ color: 'var(--primary)' }} />
                {isEditing ? 'Configurazione Piano Alimentare' : activeDiet?.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isEditing && (
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={15} />
                    <span>Salva Piano Alimentare</span>
                  </button>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Titolo Piano *</label>
                <input
                  type="text"
                  required
                  disabled={!isEditing}
                  value={dietForm.title}
                  onChange={(e) => setDietForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="es. Piano Ipocalorico Settimanale 1500 kcal"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Data Inizio *</label>
                <input
                  type="date"
                  required
                  disabled={!isEditing}
                  value={dietForm.start_date}
                  onChange={(e) => setDietForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Calorie Obiettivo (kcal)</label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={dietForm.target_calories || ''}
                  onChange={(e) => setDietForm(prev => ({ ...prev, target_calories: e.target.value }))}
                  placeholder="es. 1500"
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Stato Dieta</label>
                <select
                  disabled={!isEditing}
                  value={dietForm.is_active}
                  onChange={(e) => setDietForm(prev => ({ ...prev, is_active: Number(e.target.value) }))}
                  className="form-control"
                >
                  <option value={1}>Attiva (in corso per il paziente)</option>
                  <option value={0}>Archiviata / Storico</option>
                </select>
              </div>
            </div>

            {/* Template rapidi */}
            {isEditing && templates.length > 0 && (
              <div style={{
                backgroundColor: 'var(--primary-light)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                marginTop: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px'
              }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={16} />
                  <span>Carica uno schema predefinito da modello:</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {templates.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TAB DEI 7 GIORNI (Lunedì - Domenica) */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--border-light)',
              paddingBottom: '12px',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '10px'
            }}>
              {/* Tab Lunedì-Domenica */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: 1 }}>
                {dietForm.days.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDayIndex(idx)}
                    className={`btn btn-sm ${selectedDayIndex === idx ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ minWidth: '100px', fontWeight: 600 }}
                  >
                    {day.day_name}
                  </button>
                ))}
              </div>

              {/* Azione rapida: Copia Lunedì sui feriali */}
              {isEditing && selectedDayIndex === 0 && (
                <button
                  type="button"
                  onClick={copyMondayToWeekdays}
                  className="btn btn-outline-primary btn-sm"
                  title="Copia automaticamente la colazione, spuntini, pranzo e cena del Lunedì su Mar-Mer-Gio-Ven"
                >
                  <Copy size={14} />
                  <span>Copia Lunedì su tutti i feriali (Mar-Ven)</span>
                </button>
              )}
            </div>

            {/* PASTI DEL GIORNO SELEZIONATO */}
            {dietForm.days[selectedDayIndex] && (
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: 'var(--primary)' }}>
                  Pasti per {dietForm.days[selectedDayIndex].day_name}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {dietForm.days[selectedDayIndex].meals.map((meal, mealIdx) => (
                    <div
                      key={mealIdx}
                      style={{
                        border: '1px solid var(--border-light)',
                        borderRadius: 'var(--radius-md)',
                        padding: '16px',
                        backgroundColor: 'var(--bg-subtle)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '12px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-surface)',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-light)'
                          }}>
                            {meal.meal_type}
                          </span>
                          {meal.time_suggestion && (
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              Orario: {meal.time_suggestion}
                            </span>
                          )}
                        </div>

                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => addMealFood(selectedDayIndex, mealIdx)}
                            className="btn btn-outline-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            <Plus size={13} />
                            <span>Aggiungi Alimento</span>
                          </button>
                        )}
                      </div>

                      {/* Lista Alimenti del pasto */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {meal.items && meal.items.map((foodItem, foodIdx) => (
                          <div
                            key={foodIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              backgroundColor: 'var(--bg-surface)',
                              padding: '8px 12px',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--border-light)'
                            }}
                          >
                            {isEditing ? (
                              <>
                                <input
                                  type="text"
                                  placeholder="Nome alimento (es. Yogurt greco, Petto di tacchino, Riso basmati...)"
                                  value={foodItem.food}
                                  onChange={(e) => updateMealFood(selectedDayIndex, mealIdx, foodIdx, 'food', e.target.value)}
                                  className="form-control"
                                  style={{ flex: 2, padding: '6px 10px', fontSize: '0.85rem' }}
                                />
                                <input
                                  type="text"
                                  placeholder="Grammatura / Porzione (es. 150g, 2 fette)"
                                  value={foodItem.qty}
                                  onChange={(e) => updateMealFood(selectedDayIndex, mealIdx, foodIdx, 'qty', e.target.value)}
                                  className="form-control"
                                  style={{ flex: 1, padding: '6px 10px', fontSize: '0.85rem' }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeMealFood(selectedDayIndex, mealIdx, foodIdx)}
                                  className="btn btn-danger btn-icon-only btn-sm"
                                  style={{ width: '28px', height: '28px' }}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                <strong style={{ fontSize: '0.9rem' }}>{foodItem.food}</strong>
                                {foodItem.qty && (
                                  <span className="badge badge-primary">{foodItem.qty}</span>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Note o alternative del pasto */}
                      <div style={{ marginTop: '10px' }}>
                        {isEditing ? (
                          <input
                            type="text"
                            placeholder="Note del pasto o alternative (es. Oppure: 2 uova in camicia con 40g pane integrale)"
                            value={meal.notes || ''}
                            onChange={(e) => updateMealNotes(selectedDayIndex, mealIdx, e.target.value)}
                            className="form-control"
                            style={{ fontSize: '0.8rem', padding: '6px 10px' }}
                          />
                        ) : meal.notes ? (
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>
                            💡 {meal.notes}
                          </div>
                        ) : null}
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card Raccomandazioni, Condimenti e Idratazione */}
          <div className="card" style={{ marginBottom: '24px' }}>
            <div className="card-header">
              <h3 className="card-title">Linee Guida, Condimenti & Idratazione</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">💧 Idratazione e Assunzione Acqua</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={dietForm.water_intake_recommendation}
                  onChange={(e) => setDietForm(prev => ({ ...prev, water_intake_recommendation: e.target.value }))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">🥄 Condimenti e Metodi di Cottura</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={dietForm.general_recommendations}
                  onChange={(e) => setDietForm(prev => ({ ...prev, general_recommendations: e.target.value }))}
                  className="form-control"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">🏃 Attività Fisica Consigliata</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={dietForm.physical_activity_recommendations}
                  onChange={(e) => setDietForm(prev => ({ ...prev, physical_activity_recommendations: e.target.value }))}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label className="form-label">💊 Integratori Suggeriti</label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={dietForm.supplements}
                  onChange={(e) => setDietForm(prev => ({ ...prev, supplements: e.target.value }))}
                  placeholder="es. Omega-3 1cps dopo pranzo, Magnesio la sera"
                  className="form-control"
                />
              </div>
            </div>

            {isEditing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary btn-lg">
                  <Check size={18} />
                  <span>Salva Tutte le Modifiche al Piano</span>
                </button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--text-muted)' }}>
          <UtensilsCrossed size={48} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
          <h3>Nessun piano alimentare selezionato</h3>
          <p style={{ marginTop: '6px' }}>Seleziona una dieta dall'elenco o crea un nuovo piano settimanale per questo paziente.</p>
          <button onClick={handleStartNewDiet} className="btn btn-primary" style={{ marginTop: '16px' }}>
            <Plus size={16} />
            <span>Crea Primo Piano Alimentare</span>
          </button>
        </div>
      )}

      {/* Modale Stampa PDF */}
      <DietPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        diet={activeDiet || dietForm}
        patient={currentPatient}
        settings={settings}
        onSaveDiet={handleDirectDietSave}
      />
    </div>
  );
}
