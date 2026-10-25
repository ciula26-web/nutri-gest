import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { exportDietToWord } from '../utils/exportWord';
import {
  X,
  Printer,
  ChevronLeft,
  ChevronRight,
  FileText,
  Share2,
  Check,
  Copy,
  Send,
  Mail,
  MessageCircle,
  Download,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles
} from 'lucide-react';

// Symmetrical Botanical Acanthus Leaf Top Ornament (identical to PDF)
const BotanicalTopOrnament = () => (
  <svg
    width="110"
    height="38"
    viewBox="0 0 110 38"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', margin: '0 auto', color: '#8b9cb5' }}
  >
    <g fill="currentColor">
      {/* Ramo sinistro */}
      <path d="M51 32 C49 23 41 15 31 13 C22 11 13 16 9 23 C7 26 5 24 7 21 C11 13 21 7 33 9 C41 10 48 17 50 24 C48 17 43 11 36 8 C27 5 17 9 12 15 C10 17 8 16 9 14 C15 7 26 3 37 6 C47 9 52 18 53 28 Z" />
      <path d="M37 18 C30 14 24 16 19 20 C18 21 16 20 17 18 C22 13 30 11 37 14 Z" />
      <path d="M44 26 C41 22 35 21 31 23 C29 24 28 23 30 21 C35 18 42 19 45 23 Z" />
      <path d="M25 10 C21 5 14 6 10 9 C8 10 7 9 9 7 C14 3 23 3 27 8 Z" />

      {/* Ramo destro speculare */}
      <path d="M59 32 C61 23 69 15 79 13 C88 11 97 16 101 23 C103 26 105 24 103 21 C99 13 89 7 77 9 C69 10 62 17 60 24 C62 17 67 11 74 8 C83 5 93 9 98 15 C100 17 102 16 101 14 C95 7 84 3 73 6 C63 9 58 18 57 28 Z" />
      <path d="M73 18 C80 14 86 16 91 20 C92 21 94 20 93 18 C88 13 80 11 73 14 Z" />
      <path d="M66 26 C69 22 75 21 79 23 C81 24 82 23 80 21 C75 18 68 19 65 23 Z" />
      <path d="M85 10 C89 5 96 6 100 9 C102 10 103 9 101 7 C96 3 87 3 83 8 Z" />

      {/* Dettagli centro */}
      <circle cx="55" cy="11" r="2.2" />
      <path d="M55 14 C53 19 51 24 50 30 C53 27 57 27 60 30 C59 24 57 19 55 14 Z" />
    </g>
  </svg>
);

// Botanical Fleur-de-lis / Trefoil Leaf Bottom Ornament (identical to PDF)
const BotanicalBottomOrnament = () => (
  <svg
    width="48"
    height="34"
    viewBox="0 0 50 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', margin: '0 auto', color: '#8b9cb5' }}
  >
    <g fill="currentColor">
      <path d="M25 2 C23 9 18 17 8 19 C4 20 3 23 7 23 C15 22 21 16 23 11 C24 17 24 25 25 35 C26 25 26 17 27 11 C29 16 35 22 43 23 C47 23 46 20 42 19 C32 17 27 9 25 2 Z" />
      <path d="M21 27 C23 31 27 31 29 27 C28 32 22 32 21 27 Z" />
      <path d="M17 14 C12 17 9 21 9 23 C10 23 14 20 18 17 Z" />
      <path d="M33 14 C38 17 41 21 41 23 C40 23 36 20 32 17 Z" />
    </g>
  </svg>
);

// Lightbulb Line-art Tip Icon (identical to PDF)
const LightbulbTipIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1e293b"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0, marginTop: '2px' }}
  >
    <line x1="9" y1="18" x2="15" y2="18" />
    <line x1="10" y1="22" x2="14" y2="22" />
    <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5.76.76 1.23 1.52 1.41 2.5" />
    <line x1="12" y1="2" x2="12" y2="3.5" />
    <line x1="4.22" y1="4.22" x2="5.28" y2="5.28" />
    <line x1="19.78" y1="4.22" x2="18.72" y2="5.28" />
    <line x1="2" y1="12" x2="3.5" y2="12" />
    <line x1="20.5" y1="12" x2="22" y2="12" />
  </svg>
);

// Dati predefiniti completi estratti con precisione dal PDF clinico
export const defaultPlanPdfData = {
  patient_name: 'Riccardo Repiti',
  target_calories: 2200,
  macronutrients: { prot: 20, carb: 50, fat: 30 },
  recommendations: [
    "Non aspettare di avere sete per bere: l'acqua è essenziale per l'energia, la concentrazione e il corretto funzionamento metabolico. Idratarsi adeguatamente durante la giornata (almeno 2L di acqua)",
    "Ascolta il tuo corpo e segnala la fame. Il piano alimentare deve adattarsi a te, non il contrario. Se avverti una fame eccessiva o una stanchezza insolita, non cercare di \"resistere\"",
    "Gestisci gli sgarri senza sensi di colpa. Un pasto fuori dal piano non rovina il percorso.",
    "Non saltare i pasti. Segui la frequenza che abbiamo stabilito, senza tagliare calorie di tua iniziativa per \"accelerare\" i risultati.",
    "Puoi invertire i pasti nella stessa giornata e/o invertire i giorni della settimana.",
    "Durante l’allenamento sciogli in 1L di acqua 2g di magnesio e potassio"
  ],
  cooking_tips: [
    {
      title: "Tutti gli alimenti assegnati in un pasto possono essere assunti in un unico piatto oppure essere separati in un primo ed un secondo. La pasta non deve essere in bianco. Gli ingredienti che ti ho assegnato per il pranzo possono essere combinati come preferisci:",
      options: [
        { label: "Opzione piatto unico:", text: "Puoi cuocere la pasta e saltarla direttamente in padella con le verdure e il pollo a straccetti." },
        { label: "Opzione primo +secondo:", text: "Puoi preparare un primo piatto di pasta condito con le verdure, e mangiare il pollo come secondo. Gestisci gli ingredienti come ti è più comodo, l'importante è consumare le frequenze e le quantità indicate." }
      ]
    },
    {
      title: "Trucco in cucina:",
      text: "è concesso utilizzare farina o di pangrattato per fare le panature (es. per il pollo o il pesce), così da rendere i piatti più sfiziosi senza sbilanciare il piano."
    }
  ],
  colazione_spuntini: {
    colazione: [
      "125g yogurt Muller con palline di cioccolato",
      "3 fette biscottate integrali oppure 3 biscotti OSWEGO senza zuccheri aggiunti",
      "15g di Nutella (circa 3 cucchiaini da caffè rasi)"
    ],
    spuntino_scuola: [
      "60g pane",
      "40g di bresaola/ prosciutto cotto/prosciutto crudo"
    ],
    spuntino_pomeridiano: [
      "20g noci/nocciole",
      "Un frutto"
    ]
  },
  sport_timing: {
    pre_allenamento: "Mangiare 2-2.30h prima dell’allenamento: se le due ore che lo precedono coincidono con il pranzo, non è necessario integrare con ulteriore cibo. Se avverti comunque fame o debolezza, mangia 2 fette biscottate integrali e una mela. Sarebbe bene integrare invece Sali minerali come magnesio e potassio, per bilanciare l’equilibrio elettrolitico.",
    pre_partita: "Mangiare 2-2.30h prima della partita: se le due ore che la precedono coincidono con la colazione o con il pranzo, non è necessario integrare con ulteriore cibo. Se avverti comunque fame o debolezza, mangia 2 fette biscottate integrali e una mela. Sarebbe bene integrare invece Sali minerali come magnesio e potassio, per bilanciare l’equilibrio elettrolitico.",
    post_allenamento: {
      intro: "Mangiare entro 30-60 minuti dal termine (a prescindere che manchi poco all’ora di cena):",
      items: [
        "40g di bresaola+1 banana",
        "1 yogurt da 125g bianco + 1 banana",
        "20g nocciole/noci+ 1 banana",
        "3 fette biscottate integrali+ 1 banana"
      ]
    }
  },
  days: [
    {
      day_name: "LUNEDI'",
      pranzo: [
        "100g pasta*¹",
        "200g petto di pollo*²",
        "Frutta e verdura",
        "2 cucchiaini di olio (10g)"
      ],
      pranzo_substitutions: [
        "*¹ Sostituzioni: 150g pane, 80g pasta+30g pane",
        "*² Sostituzioni: petto di tacchino, coniglio, filetto/arista di maiale"
      ],
      cena: [
        "Piadina all’olio di oliva (120g circa)",
        "40g di bresaola/ prosciutto crudo/prosciutto cotto",
        "35g Philadelphia light, stracchino o crescenza/certosino",
        "Frutta e verdura"
      ],
      cena_substitutions: [],
      tip: "150g di petto di pollo/tacchino/maiale: al limone, all’arancia, al latte, panato, infarinato e cotto con olio e rosmarino, tritato e poi panato (come cotolette e nuggets)"
    },
    {
      day_name: "MARTEDÌ",
      pranzo: [
        "200g gnocchi di patate",
        "150g macinato di manzo magro",
        "Frutta e verdura",
        "2 cucchiaini di olio (10g)"
      ],
      pranzo_substitutions: [],
      cena: [
        "150g pane*¹",
        "125g mozzarella light (intera)",
        "Frutta e verdura",
        "2 cucchiaini di olio (10g)"
      ],
      cena_substitutions: [
        "*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane"
      ],
      tip: null
    },
    {
      day_name: "MERCOLEDI'",
      pranzo: [
        "100g pasta*¹",
        "2 uova intere",
        "30g guanciale",
        "1 cucchiaio di parmigiano",
        "Frutta e verdura"
      ],
      pranzo_substitutions: [
        "*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane"
      ],
      cena: [
        "150g pane*¹",
        "200g petto di pollo*²",
        "Frutta e verdura",
        "2 cucchiaini di olio (10g)"
      ],
      cena_substitutions: [
        "*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane",
        "*² Sostituzioni: petto di tacchino, coniglio, filetto/arista di maiale"
      ],
      tip: "150g di petto di pollo/tacchino/maiale: al limone, all’arancia, al latte, panato, infarinato e cotto con olio e rosmarino, tritato e poi panato (come cotolette e nuggets)"
    },
    {
      day_name: "GIOVEDI'",
      pranzo: [
        "100g pasta*¹",
        "100g tonno fresco/congelato o in scatola (56g x2) al naturale!!",
        "Frutta e verdura",
        "3 cucchiaini di olio (15g)"
      ],
      pranzo_substitutions: [
        "*¹ Sostituzioni: 150g pane, 80g pasta+30g pane"
      ],
      cena: [
        "150g pane*¹",
        "150g filetto di vitello",
        "Frutta e verdura",
        "3 cucchiaini di olio (15g)"
      ],
      cena_substitutions: [
        "*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane"
      ],
      tip: null
    },
    {
      day_name: "VENERDI'",
      pranzo: [
        "200g gnocchi di patate",
        "150g petto di pollo*¹",
        "Frutta e verdura",
        "2 cucchiaini di olio (10g)"
      ],
      pranzo_substitutions: [
        "*¹ Sostituzioni: petto di tacchino, coniglio, filetto/arista di maiale"
      ],
      cena: [
        "150g pane*¹",
        "150g macinato di manzo magro",
        "Frutta e verdura",
        "2 cucchiaini di olio (10g)"
      ],
      cena_substitutions: [
        "*¹ Sostituzioni: 100g pasta, 80g pasta+30g pane"
      ],
      tip: "150g di macinato di manzo: hamburger (fatto in casa), pasta al ragù, macinato con pomodoro da mangiare con il pane"
    },
    {
      day_name: "SABATO",
      pranzo: [
        "100g riso basmati o couscous",
        "180g trancio di salmone o pesce spada",
        "Verdure alla griglia a piacere",
        "2 cucchiaini di olio EVO"
      ],
      pranzo_substitutions: [
        "*¹ Sostituzioni: 120g pasta o 150g pane"
      ],
      cena: [
        "Pasto libero concordato (es. Pizza margherita o con verdure)",
        "Acqua naturale a volontà",
        "Frutta fresca o sorbetto al limone"
      ],
      cena_substitutions: [],
      tip: "Gusta il pasto conviviale con tranquillità, masticando lentamente senza sensi di colpa."
    },
    {
      day_name: "DOMENICA",
      pranzo: [
        "100g pasta al forno o risotto ai funghi",
        "150g arrosto di vitello o tacchino",
        "Insalata mista e carote",
        "2 cucchiaini di olio EVO"
      ],
      pranzo_substitutions: [],
      cena: [
        "Vellutata di verdure o minestrone",
        "100g ricotta fresca o 2 uova in camicia",
        "60g pane integrale tostato",
        "1 cucchiaino di olio EVO"
      ],
      cena_substitutions: [],
      tip: null
    }
  ]
};

export function initializePlanData(diet, patient) {
  const patientFullName = patient
    ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim()
    : (diet?.patient_name || defaultPlanPdfData.patient_name);

  const calories = diet?.target_calories || defaultPlanPdfData.target_calories;
  const rawMacros = diet?.macronutrients || defaultPlanPdfData.macronutrients;
  const macros = typeof rawMacros === 'string' ? JSON.parse(rawMacros) : { ...rawMacros };

  let planDays = defaultPlanPdfData.days;
  if (diet?.days && diet.days.length > 0 && diet.days.some(d => d.meals && d.meals.length > 0)) {
    planDays = diet.days.map((d, index) => {
      const defaultDay = defaultPlanPdfData.days[index % defaultPlanPdfData.days.length];
      const pranzoMeal = d.meals.find(m => m.meal_type?.toLowerCase().includes('pranzo')) || d.meals[0];
      const cenaMeal = d.meals.find(m => m.meal_type?.toLowerCase().includes('cena')) || d.meals[1] || d.meals[0];

      const parseMealItems = (meal) => {
        if (!meal || !meal.items) return [];
        if (Array.isArray(meal.items)) {
          return meal.items.map(it => typeof it === 'string' ? it : `${it.qty ? it.qty + ' ' : ''}${it.food}`);
        }
        return [String(meal.items)];
      };

      return {
        day_name: d.day_name?.toUpperCase() || defaultDay.day_name,
        pranzo: parseMealItems(pranzoMeal).length > 0 ? parseMealItems(pranzoMeal) : [...defaultDay.pranzo],
        pranzo_substitutions: pranzoMeal?.notes ? [pranzoMeal.notes] : [...defaultDay.pranzo_substitutions],
        cena: parseMealItems(cenaMeal).length > 0 ? parseMealItems(cenaMeal) : [...defaultDay.cena],
        cena_substitutions: cenaMeal?.notes ? [cenaMeal.notes] : [...defaultDay.cena_substitutions],
        tip: d.notes || defaultDay.tip
      };
    });
  } else {
    planDays = JSON.parse(JSON.stringify(defaultPlanPdfData.days));
  }

  return {
    patient_name: patientFullName,
    target_calories: calories,
    macronutrients: macros,
    start_date: diet?.start_date || '',
    end_date: diet?.end_date || '',
    recommendations: (diet?.recommendations && Array.isArray(diet.recommendations) && diet.recommendations.length > 0)
      ? [...diet.recommendations]
      : JSON.parse(JSON.stringify(defaultPlanPdfData.recommendations)),
    cooking_tips: diet?.cooking_tips ? JSON.parse(JSON.stringify(diet.cooking_tips)) : JSON.parse(JSON.stringify(defaultPlanPdfData.cooking_tips)),
    colazione_spuntini: diet?.colazione_spuntini ? JSON.parse(JSON.stringify(diet.colazione_spuntini)) : JSON.parse(JSON.stringify(defaultPlanPdfData.colazione_spuntini)),
    sport_timing: diet?.sport_timing ? JSON.parse(JSON.stringify(diet.sport_timing)) : JSON.parse(JSON.stringify(defaultPlanPdfData.sport_timing)),
    days: planDays
  };
}

export default function DietPrintModal({ isOpen, onClose, diet, patient, settings, onSaveDiet }) {
  const [planData, setPlanData] = useState(() => initializePlanData(diet, patient));
  const [isDirectEditing, setIsDirectEditing] = useState(false);
  const [viewMode, setViewMode] = useState('all'); // 'all' | 'single'
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPlanData(initializePlanData(diet, patient));
    }
  }, [diet, isOpen, patient]);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDateShort = (d) => {
    if (!d) return '__/__';
    try {
      const date = new Date(d);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}`;
    } catch {
      return d;
    }
  };

  const dateFrom = planData.start_date ? formatDateShort(planData.start_date) : '__/__';
  const dateTo = planData.end_date ? formatDateShort(planData.end_date) : '__/__';

  const getPdfFileName = () => {
    const safeName = (planData.patient_name || 'Paziente').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
    return `Piano_Alimentare_${safeName}_${planData.target_calories || 2200}kcal.pdf`;
  };

  // Salva modifiche eseguite direttamente nell'app
  const handleSaveDietDirect = () => {
    if (onSaveDiet) {
      onSaveDiet(planData);
    }
    setIsDirectEditing(false);
    showToast('Modifiche salvate con successo nel piano alimentare!');
  };

  // Esporta l'intero piano in Microsoft Word (.docx)
  const handleExportWord = async () => {
    try {
      setShowShareModal(false);
      const blob = await exportDietToWord(planData, patient, settings);
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
      showToast(`File Word (.docx) scaricato con successo nei Download! (${fileName})`);
    } catch (err) {
      console.error('Errore esportazione Word:', err);
      alert('Errore esportazione Word: ' + err.message);
    }
  };

  // Handlers per la modifica diretta nell'app
  const handleUpdateCover = (field, val) => {
    setPlanData(prev => ({ ...prev, [field]: val }));
  };

  const handleUpdateMacro = (macro, val) => {
    setPlanData(prev => ({
      ...prev,
      macronutrients: { ...prev.macronutrients, [macro]: Number(val) }
    }));
  };

  const handleUpdateRec = (idx, text) => {
    setPlanData(prev => {
      const recs = [...prev.recommendations];
      recs[idx] = text;
      return { ...prev, recommendations: recs };
    });
  };

  const handleAddRec = () => {
    setPlanData(prev => ({
      ...prev,
      recommendations: [...prev.recommendations, 'Nuova raccomandazione nutrizionale personalizzata']
    }));
  };

  const handleRemoveRec = (idx) => {
    setPlanData(prev => ({
      ...prev,
      recommendations: prev.recommendations.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateColazioneItem = (category, idx, val) => {
    setPlanData(prev => {
      const catItems = [...prev.colazione_spuntini[category]];
      catItems[idx] = val;
      return {
        ...prev,
        colazione_spuntini: { ...prev.colazione_spuntini, [category]: catItems }
      };
    });
  };

  const handleAddColazioneItem = (category) => {
    setPlanData(prev => ({
      ...prev,
      colazione_spuntini: {
        ...prev.colazione_spuntini,
        [category]: [...prev.colazione_spuntini[category], 'Nuovo alimento o porzione']
      }
    }));
  };

  const handleRemoveColazioneItem = (category, idx) => {
    setPlanData(prev => ({
      ...prev,
      colazione_spuntini: {
        ...prev.colazione_spuntini,
        [category]: prev.colazione_spuntini[category].filter((_, i) => i !== idx)
      }
    }));
  };

  const handleUpdateSportTiming = (field, val) => {
    setPlanData(prev => ({
      ...prev,
      sport_timing: { ...prev.sport_timing, [field]: val }
    }));
  };

  const handleUpdatePostSportItem = (idx, val) => {
    setPlanData(prev => {
      const items = [...prev.sport_timing.post_allenamento.items];
      items[idx] = val;
      return {
        ...prev,
        sport_timing: {
          ...prev.sport_timing,
          post_allenamento: { ...prev.sport_timing.post_allenamento, items }
        }
      };
    });
  };

  const handleAddPostSportItem = () => {
    setPlanData(prev => ({
      ...prev,
      sport_timing: {
        ...prev.sport_timing,
        post_allenamento: {
          ...prev.sport_timing.post_allenamento,
          items: [...prev.sport_timing.post_allenamento.items, 'Nuova opzione post-allenamento']
        }
      }
    }));
  };

  const handleRemovePostSportItem = (idx) => {
    setPlanData(prev => ({
      ...prev,
      sport_timing: {
        ...prev.sport_timing,
        post_allenamento: {
          ...prev.sport_timing.post_allenamento,
          items: prev.sport_timing.post_allenamento.items.filter((_, i) => i !== idx)
        }
      }
    }));
  };

  const handleUpdateDayMealItem = (dayIdx, mealType, itemIdx, val) => {
    setPlanData(prev => {
      const days = [...prev.days];
      const items = [...days[dayIdx][mealType]];
      items[itemIdx] = val;
      days[dayIdx] = { ...days[dayIdx], [mealType]: items };
      return { ...prev, days };
    });
  };

  const handleAddDayMealItem = (dayIdx, mealType) => {
    setPlanData(prev => {
      const days = [...prev.days];
      const items = [...days[dayIdx][mealType], 'Nuovo alimento / porzione'];
      days[dayIdx] = { ...days[dayIdx], [mealType]: items };
      return { ...prev, days };
    });
  };

  const handleRemoveDayMealItem = (dayIdx, mealType, itemIdx) => {
    setPlanData(prev => {
      const days = [...prev.days];
      const items = days[dayIdx][mealType].filter((_, i) => i !== itemIdx);
      days[dayIdx] = { ...days[dayIdx], [mealType]: items };
      return { ...prev, days };
    });
  };

  const handleUpdateDaySub = (dayIdx, mealType, subIdx, val) => {
    setPlanData(prev => {
      const days = [...prev.days];
      const field = `${mealType}_substitutions`;
      const subs = [...(days[dayIdx][field] || [])];
      subs[subIdx] = val;
      days[dayIdx] = { ...days[dayIdx], [field]: subs };
      return { ...prev, days };
    });
  };

  const handleAddDaySub = (dayIdx, mealType) => {
    setPlanData(prev => {
      const days = [...prev.days];
      const field = `${mealType}_substitutions`;
      const subs = [...(days[dayIdx][field] || []), '* Sostituzioni: '];
      days[dayIdx] = { ...days[dayIdx], [field]: subs };
      return { ...prev, days };
    });
  };

  const handleRemoveDaySub = (dayIdx, mealType, subIdx) => {
    setPlanData(prev => {
      const days = [...prev.days];
      const field = `${mealType}_substitutions`;
      const subs = days[dayIdx][field].filter((_, i) => i !== subIdx);
      days[dayIdx] = { ...days[dayIdx], [field]: subs };
      return { ...prev, days };
    });
  };

  const handleUpdateDayTip = (dayIdx, val) => {
    setPlanData(prev => {
      const days = [...prev.days];
      days[dayIdx] = { ...days[dayIdx], tip: val };
      return { ...prev, days };
    });
  };

  // Generatore ad alta fedeltà di file PDF A4 da tutti i fogli della dieta
  const generatePdfBlob = async () => {
    setIsGeneratingPdf(true);

    const prevViewMode = viewMode;
    if (viewMode !== 'all') {
      setViewMode('all');
      await new Promise(r => setTimeout(r, 250));
    } else {
      await new Promise(r => setTimeout(r, 100));
    }

    try {
      const container = document.querySelector('.pdf-sheet-container');
      const pageElements = container ? container.querySelectorAll('.pdf-a4-page') : document.querySelectorAll('.pdf-a4-page');

      if (!pageElements || pageElements.length === 0) {
        throw new Error('Nessuna pagina trovata da stampare.');
      }

      const total = pageElements.length;
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
      });

      for (let i = 0; i < total; i++) {
        // Aggiorna indicatori di progresso visivi direttamente sul DOM per massima fluidità
        const progressFill = document.getElementById('pdf-progress-bar-fill');
        const progressText = document.getElementById('pdf-progress-text');
        if (progressFill) progressFill.style.width = `${((i + 1) / total) * 100}%`;
        if (progressText) progressText.innerText = `Elaborazione pagina ${i + 1} di ${total} (Alta fedeltà A4)...`;

        const originalPage = pageElements[i];

        // Clona la pagina direttamente in document.body per eliminare qualsiasi problema
        // di "Unable to find element in cloned iframe" dovuto al React Portal
        const clone = originalPage.cloneNode(true);
        clone.id = 'temp-pdf-render-clone';
        clone.style.position = 'fixed';
        clone.style.top = '0';
        clone.style.left = '0';
        clone.style.width = '794px';
        clone.style.minHeight = '1123px';
        clone.style.maxHeight = '1123px';
        clone.style.backgroundColor = '#ffffff';
        clone.style.zIndex = '99998'; // Sotto all'overlay di caricamento
        clone.style.boxSizing = 'border-box';
        document.body.appendChild(clone);

        try {
          const canvas = await html2canvas(clone, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: 1200,
            windowHeight: 1200,
            scrollX: 0,
            scrollY: 0
          });

          const imgData = canvas.toDataURL('image/jpeg', 0.92);
          if (i > 0) {
            doc.addPage('a4', 'portrait');
          }
          // Coordinate e dimensioni A4 esatte (210mm x 297mm)
          doc.addImage(imgData, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        } finally {
          if (clone.parentNode) {
            clone.parentNode.removeChild(clone);
          }
        }
      }

      const blob = doc.output('blob');
      return blob;
    } catch (err) {
      console.error('Errore creazione PDF:', err);
      alert('Si è verificato un errore durante la compilazione del PDF: ' + err.message);
      return null;
    } finally {
      setIsGeneratingPdf(false);
      if (prevViewMode !== 'all') {
        setViewMode(prevViewMode);
      }
    }
  };

  // 1. Scarica direttamente il file PDF (.pdf)
  const handleDownloadPdf = async () => {
    setShowShareModal(false);
    const blob = await generatePdfBlob();
    if (!blob) return;

    const fileName = getPdfFileName();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`File PDF salvato con successo nei Download! (${fileName})`);
  };

  // 2. Condividi il file PDF nativamente (WhatsApp, AirDrop, App o Fallback Download)
  const handleSharePdfNative = async () => {
    setShowShareModal(false);
    const blob = await generatePdfBlob();
    if (!blob) return;

    const fileName = getPdfFileName();
    const file = new File([blob], fileName, { type: 'application/pdf' });

    // Se il browser supporta la condivisione nativa di file (es. smartphone, tablet, Windows compatibile)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Piano Alimentare - ${patientFullName}`,
          text: `In allegato il piano alimentare personalizzato (${calories} kcal) per ${patientFullName}.`
        });
        showToast('PDF inviato e condiviso con successo!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.log('Share error:', err);
      }
    }

    // Fallback: scarica il file PDF e notifica l'utente
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`PDF scaricato nei tuoi Download! Puoi ora allegarlo comodamente su WhatsApp o via Email.`);
  };

  // 3. Condividi il file PDF su WhatsApp
  const handleWhatsAppSharePdf = async () => {
    setShowShareModal(false);
    const blob = await generatePdfBlob();
    if (!blob) return;

    const fileName = getPdfFileName();
    const file = new File([blob], fileName, { type: 'application/pdf' });

    // Su dispositivi che supportano invio nativo di file verso WhatsApp
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Piano Alimentare - ${patientFullName}`,
          text: `Gentile ${patient?.first_name || patientFullName}, Le invio in allegato il Suo Piano Alimentare personalizzato (${calories} kcal).`
        });
        showToast('PDF inviato su WhatsApp!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Su PC desktop: scarica il PDF e apre WhatsApp Web
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const text = encodeURIComponent(
      `Gentile ${patient?.first_name || patientFullName},\n` +
      `Le invio in allegato il Suo Piano Alimentare personalizzato (${calories} kcal).\n\n` +
      `Studio Nutrizionale: ${settings?.studio_name || 'NutriGest'}`
    );
    const phone = patient?.phone ? patient.phone.replace(/[^0-9]/g, '') : '';
    const waUrl = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${text}` : `https://web.whatsapp.com`;
    window.open(waUrl, '_blank');

    showToast(`PDF salvato nei Download! Abbiamo aperto WhatsApp: trascina o allega ${fileName} alla chat.`);
  };

  // 4. Invia PDF via Email
  const handleEmailSharePdf = async () => {
    setShowShareModal(false);
    const blob = await generatePdfBlob();
    if (!blob) return;

    const fileName = getPdfFileName();
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: `Piano Alimentare - ${patientFullName}`,
          text: `Gentile ${patientFullName},\n\nin allegato trova il Suo Piano Alimentare personalizzato (${calories} kcal).\n\nCordiali saluti.`
        });
        showToast('PDF condiviso via Email!');
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    // Scarica e apre client di posta
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    const subject = encodeURIComponent(`Piano Alimentare Personalizzato - ${patientFullName}`);
    const body = encodeURIComponent(
      `Gentile ${patientFullName},\n\n` +
      `in allegato trova il Suo Piano Alimentare personalizzato (${calories} kcal) redatto dallo Studio Nutrizionale.\n\n` +
      `Cordiali saluti,\n${settings?.nutritionist_name || 'Dott.ssa Nutrizionista'}`
    );
    const email = patient?.email || '';
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;

    showToast(`PDF salvato nei Download! Allega ${fileName} all'email aperta.`);
  };

  // Genera testo riassuntivo per la copia negli appunti
  const generateShareText = () => {
    return `🥗 *PIANO ALIMENTARE PERSONALIZZATO*\nPaziente: ${patientFullName}\nTarget: ${calories} kcal (${macros.prot}% proteine, ${macros.carb}% carboidrati, ${macros.fat}% grassi)\nPeriodo: Dal ${dateFrom} al ${dateTo}\n\n*Raccomandazioni principali:*\n- Idratarsi con almeno 2L d'acqua al giorno\n- Ascolta il tuo corpo e segnala la fame\n- Durante l'allenamento integra magnesio e potassio\n\nStudio Nutrizionale: ${settings?.studio_name || 'NutriGest'}`;
  };

  const handleCopyClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generateShareText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      showToast('Riepilogo testuale copiato negli appunti!');
    } catch {
      alert('Testo copiato!');
    }
  };

  const patientFullName = planData.patient_name || (patient ? `${patient.first_name || ''} ${patient.last_name || ''}`.trim() : 'Paziente');
  const calories = planData.target_calories || 2200;
  const macros = planData.macronutrients || { prot: 20, carb: 50, fat: 30 };
  const planDays = planData.days || [];

  // Lista di tutte le pagine da stampare
  const pages = [
    // 1. COPERTINA
    { id: 'cover', title: 'Copertina', render: () => <CoverPage key="page-cover" /> },
    // 2. RACCOMANDAZIONI
    { id: 'recs', title: 'Raccomandazioni', render: () => <RecommendationsPage key="page-recs" /> },
    // 3. CONSIGLI UTILI
    { id: 'tips', title: 'Consigli Utili', render: () => <CookingTipsPage key="page-tips" /> },
    // 4. COLAZIONE & SPUNTINI
    { id: 'breakfast', title: 'Colazione & Spuntini', render: () => <BreakfastSnacksPage key="page-breakfast" /> },
    // 5. PRE/POST ALLENAMENTO
    { id: 'sport', title: 'Nutrizione Sportiva', render: () => <SportTimingPage key="page-sport" /> },
    // 6+. GIORNI DELLA SETTIMANA
    ...planDays.map((day, idx) => ({
      id: `day-${idx}`,
      title: day.day_name,
      render: () => <DayPage key={`page-day-${idx}`} day={day} dayIdx={idx} />
    }))
  ];

  // ==========================================
  // PAGINA 1: COPERTINA PIANO ALIMENTARE
  // ==========================================
  function CoverPage() {
    return (
      <div className="pdf-a4-page" style={{ justifyContent: 'space-between', padding: '90px 75px 80px' }}>
        <div>
          {/* Motivo floreale superiore */}
          <div style={{ marginBottom: '55px' }}>
            <BotanicalTopOrnament />
          </div>

          {/* Linea superiore */}
          <div style={{ width: '100%', height: '1.5px', backgroundColor: '#1e3a5f', marginBottom: '18px' }} />

          {/* Titolo principale */}
          <h1
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: '2.85rem',
              fontWeight: 500,
              letterSpacing: '0.14em',
              color: '#1e3a5f',
              textAlign: 'center',
              margin: '0',
              lineHeight: 1.15
            }}
          >
            PIANO ALIMENTARE
          </h1>

          {/* Linea inferiore */}
          <div style={{ width: '100%', height: '1.5px', backgroundColor: '#1e3a5f', marginTop: '18px', marginBottom: '45px' }} />

          {/* Nome Paziente */}
          {isDirectEditing ? (
            <div style={{ textAlign: 'center', marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
                Nome e Cognome Paziente:
              </label>
              <input
                type="text"
                value={planData.patient_name || ''}
                onChange={(e) => handleUpdateCover('patient_name', e.target.value)}
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: '1.85rem',
                  color: '#1e3a5f',
                  textAlign: 'center',
                  border: '1.5px dashed #3b82f6',
                  borderRadius: '6px',
                  padding: '4px 12px',
                  backgroundColor: '#f8fafc',
                  width: '80%',
                  maxWidth: '500px'
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.85rem',
                color: '#1e3a5f',
                textAlign: 'center',
                marginBottom: '10px'
              }}
            >
              {patientFullName}
            </div>
          )}

          {/* Range Temporale */}
          {isDirectEditing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: '#1e3a5f' }}>Dal</span>
              <input
                type="date"
                value={planData.start_date || ''}
                onChange={(e) => handleUpdateCover('start_date', e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1.5px dashed #3b82f6',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.9rem',
                  color: '#1e3a5f'
                }}
              />
              <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.1rem', color: '#1e3a5f' }}>al</span>
              <input
                type="date"
                value={planData.end_date || ''}
                onChange={(e) => handleUpdateCover('end_date', e.target.value)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1.5px dashed #3b82f6',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.9rem',
                  color: '#1e3a5f'
                }}
              />
            </div>
          ) : (
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.35rem',
                color: '#1e3a5f',
                textAlign: 'center'
              }}
            >
              Dal {dateFrom} al {dateTo}
            </div>
          )}

          {/* Motivo floreale intermedio */}
          <div style={{ marginTop: '55px' }}>
            <BotanicalBottomOrnament />
          </div>
        </div>

        {/* Box Calorie & Ripartizione Macronutrienti in basso a sinistra */}
        <div style={{ paddingLeft: '8px', fontSize: '0.98rem', color: '#1e293b', lineHeight: 1.6 }}>
          {isDirectEditing ? (
            <div style={{ backgroundColor: '#f8fafc', border: '1.5px dashed #3b82f6', borderRadius: '8px', padding: '12px 16px', maxWidth: '320px' }}>
              <div style={{ fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Piano teorico:</span>
                <input
                  type="number"
                  step="50"
                  value={planData.target_calories || 2200}
                  onChange={(e) => handleUpdateCover('target_calories', e.target.value)}
                  style={{
                    width: '90px',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: 600
                  }}
                />
                <span>kcal</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>• Proteine:</span>
                  <input
                    type="number"
                    value={macros.prot || 20}
                    onChange={(e) => handleUpdateMacro('prot', e.target.value)}
                    style={{ width: '55px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <span>%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>• Carboidrati:</span>
                  <input
                    type="number"
                    value={macros.carb || 50}
                    onChange={(e) => handleUpdateMacro('carb', e.target.value)}
                    style={{ width: '55px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <span>%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>• Grassi:</span>
                  <input
                    type="number"
                    value={macros.fat || 30}
                    onChange={(e) => handleUpdateMacro('fat', e.target.value)}
                    style={{ width: '55px', padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                  />
                  <span>%</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontWeight: 500, marginBottom: '6px' }}>
                Piano teorico {calories} kcal:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', paddingLeft: '4px' }}>
                <div>• {macros.prot || 20}% proteine</div>
                <div>• {macros.carb || 50}% carboidrati</div>
                <div>• {macros.fat || 30}% grassi</div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGINA 2: RACCOMANDAZIONI
  // ==========================================
  function RecommendationsPage() {
    return (
      <div className="pdf-a4-page" style={{ padding: '80px 75px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '2.2rem',
            fontWeight: 400,
            color: '#1e293b',
            letterSpacing: '0.04em',
            margin: '0 0 10px 0'
          }}
        >
          RACCOMANDAZIONI
        </h2>

        {/* Riga continua sotto il titolo */}
        <div style={{ width: '100%', height: '1.5px', backgroundColor: '#1e293b', marginBottom: '38px' }} />

        {/* Elenco raccomandazioni con quadratino nero */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isDirectEditing ? '16px' : '26px' }}>
          {(planData.recommendations || []).map((text, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                fontSize: '1.02rem',
                lineHeight: 1.68,
                color: '#1e293b'
              }}
            >
              <span style={{ fontSize: '1rem', lineHeight: '1.68', color: '#000000', flexShrink: 0 }}>▪</span>
              {isDirectEditing ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <textarea
                    rows={2}
                    value={text}
                    onChange={(e) => handleUpdateRec(idx, e.target.value)}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      fontSize: '0.98rem',
                      lineHeight: 1.5,
                      borderRadius: '6px',
                      border: '1.5px dashed #3b82f6',
                      backgroundColor: '#f8fafc',
                      color: '#1e293b',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveRec(idx)}
                    title="Rimuovi raccomandazione"
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '6px'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <span>{text}</span>
              )}
            </div>
          ))}

          {isDirectEditing && (
            <button
              type="button"
              onClick={handleAddRec}
              style={{
                alignSelf: 'flex-start',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1.5px dashed #059669',
                backgroundColor: '#ecfdf5',
                color: '#065f46',
                fontSize: '0.88rem',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '10px'
              }}
            >
              <Plus size={15} />
              <span>Aggiungi Raccomandazione</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGINA 3: CONSIGLI UTILI
  // ==========================================
  function CookingTipsPage() {
    return (
      <div className="pdf-a4-page" style={{ padding: '80px 75px' }}>
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: '2.2rem',
            fontWeight: 400,
            color: '#1e293b',
            letterSpacing: '0.04em',
            margin: '0 0 10px 0'
          }}
        >
          CONSIGLI UTILI
        </h2>

        <div style={{ width: '100%', height: '1.5px', backgroundColor: '#1e293b', marginBottom: '38px' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', fontSize: '1.02rem', lineHeight: 1.68, color: '#1e293b' }}>
          {/* Sezione 1: Piatto unico vs Primo/Secondo */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '1rem', color: '#000000', flexShrink: 0 }}>▪</span>
            <div>
              <div style={{ marginBottom: '14px' }}>
                Tutti gli alimenti assegnati in un pasto possono essere assunti in un unico piatto
                oppure essere separati in un primo ed un secondo. La pasta non deve essere in
                bianco. Gli ingredienti che ti ho assegnato per il pranzo possono essere
                combinati come preferisci:
              </div>
              <div style={{ marginBottom: '12px', paddingLeft: '4px' }}>
                <em>Opzione piatto unico:</em> Puoi cuocere la pasta e saltarla direttamente in padella
                con le verdure e il pollo a straccetti.
              </div>
              <div style={{ paddingLeft: '4px' }}>
                <em>Opzione primo +secondo:</em> Puoi preparare un primo piatto di pasta condito con le
                verdure, e mangiare il pollo come secondo. Gestisci gli ingredienti come ti è più
                comodo, l'importante è consumare le frequenze e le quantità indicate.
              </div>
            </div>
          </div>

          {/* Sezione 2: Trucco in cucina */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <span style={{ fontSize: '1rem', color: '#000000', flexShrink: 0 }}>▪</span>
            <div>
              <strong>Trucco in cucina:</strong> è concesso utilizzare farina o di pangrattato per fare le
              panature (es. per il pollo o il pesce), così da rendere i piatti più sfiziosi senza
              sbilanciare il piano.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGINA 4: COLAZIONE & SPUNTINI
  // ==========================================
  function BreakfastSnacksPage() {
    const colazioneItems = planData.colazione_spuntini?.colazione || [];
    const scuolaItems = planData.colazione_spuntini?.spuntino_scuola || [];
    const pomItems = planData.colazione_spuntini?.spuntino_pomeridiano || [];

    return (
      <div className="pdf-a4-page" style={{ justifyContent: 'space-between', padding: '80px 75px' }}>
        <div>
          <div style={{ marginBottom: '40px' }}>
            <BotanicalTopOrnament />
          </div>

          {/* Colazione */}
          <div style={{ marginBottom: '45px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '2.1rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 20px 0'
              }}
            >
              COLAZIONE
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
              {colazioneItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#1e293b' }}>•</span>
                  {isDirectEditing ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateColazioneItem('colazione', idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1.5px dashed #3b82f6',
                          backgroundColor: '#f8fafc',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColazioneItem('colazione', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.02rem', lineHeight: 1.6, color: '#1e293b' }}>{item}</div>
                  )}
                </div>
              ))}
              {isDirectEditing && (
                <button
                  type="button"
                  onClick={() => handleAddColazioneItem('colazione')}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  <Plus size={13} />
                  <span>Aggiungi Alimento Colazione</span>
                </button>
              )}
            </div>
          </div>

          {/* Spuntino a Scuola */}
          <div style={{ marginBottom: '45px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.95rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 20px 0'
              }}
            >
              SPUNTINO A SCUOLA
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
              {scuolaItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#1e293b' }}>•</span>
                  {isDirectEditing ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateColazioneItem('spuntino_scuola', idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1.5px dashed #3b82f6',
                          backgroundColor: '#f8fafc',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColazioneItem('spuntino_scuola', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.02rem', lineHeight: 1.6, color: '#1e293b' }}>{item}</div>
                  )}
                </div>
              ))}
              {isDirectEditing && (
                <button
                  type="button"
                  onClick={() => handleAddColazioneItem('spuntino_scuola')}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  <Plus size={13} />
                  <span>Aggiungi Alimento Spuntino Scuola</span>
                </button>
              )}
            </div>
          </div>

          {/* Spuntino Pomeridiano */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.85rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 20px 0',
                lineHeight: 1.25
              }}
            >
              SPUNTINO POMERIDIANO LUNEDÌ E<br />VENERDÌ
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
              {pomItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#1e293b' }}>•</span>
                  {isDirectEditing ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateColazioneItem('spuntino_pomeridiano', idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1.5px dashed #3b82f6',
                          backgroundColor: '#f8fafc',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColazioneItem('spuntino_pomeridiano', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.02rem', lineHeight: 1.6, color: '#1e293b' }}>{item}</div>
                  )}
                </div>
              ))}
              {isDirectEditing && (
                <button
                  type="button"
                  onClick={() => handleAddColazioneItem('spuntino_pomeridiano')}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  <Plus size={13} />
                  <span>Aggiungi Alimento Spuntino Pomeridiano</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Ornamento inferiore */}
        <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
          <BotanicalBottomOrnament />
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGINA 5: PRE / POST ALLENAMENTO E PARTITA
  // ==========================================
  function SportTimingPage() {
    const postItems = planData.sport_timing?.post_allenamento?.items || [];

    return (
      <div className="pdf-a4-page" style={{ justifyContent: 'space-between', padding: '80px 75px' }}>
        <div>
          <div style={{ marginBottom: '36px' }}>
            <BotanicalTopOrnament />
          </div>

          {/* Pre-allenamento */}
          <div style={{ marginBottom: '36px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.95rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 16px 0'
              }}
            >
              PRE- ALLENAMENTO
            </h2>
            {isDirectEditing ? (
              <textarea
                rows={4}
                value={planData.sport_timing?.pre_allenamento || ''}
                onChange={(e) => handleUpdateSportTiming('pre_allenamento', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px dashed #3b82f6',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{ fontSize: '0.98rem', lineHeight: 1.65, color: '#1e293b' }}>
                {planData.sport_timing?.pre_allenamento}
              </div>
            )}
          </div>

          {/* Pre-partita */}
          <div style={{ marginBottom: '36px' }}>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.95rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 16px 0'
              }}
            >
              PRE- PARTITA
            </h2>
            {isDirectEditing ? (
              <textarea
                rows={4}
                value={planData.sport_timing?.pre_partita || ''}
                onChange={(e) => handleUpdateSportTiming('pre_partita', e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1.5px dashed #3b82f6',
                  backgroundColor: '#f8fafc',
                  fontSize: '0.95rem',
                  lineHeight: 1.5,
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            ) : (
              <div style={{ fontSize: '0.98rem', lineHeight: 1.65, color: '#1e293b' }}>
                {planData.sport_timing?.pre_partita}
              </div>
            )}
          </div>

          {/* Post-allenamento / Post-partita */}
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.85rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 6px 0',
                lineHeight: 1.2
              }}
            >
              POST- ALLENAMENTO
            </h2>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                fontSize: '1.85rem',
                fontWeight: 400,
                color: '#1e293b',
                textAlign: 'center',
                letterSpacing: '0.04em',
                margin: '0 0 16px 0',
                lineHeight: 1.2
              }}
            >
              POST-PARTITA
            </h2>
            <div style={{ fontSize: '0.98rem', lineHeight: 1.65, color: '#1e293b', marginBottom: '12px' }}>
              {planData.sport_timing?.post_allenamento?.intro}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '18px' }}>
              {postItems.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#1e293b' }}>•</span>
                  {isDirectEditing ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdatePostSportItem(idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1.5px dashed #3b82f6',
                          backgroundColor: '#f8fafc',
                          fontSize: '0.95rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePostSportItem(idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.98rem', color: '#1e293b' }}>{item}</div>
                  )}
                </div>
              ))}
              {isDirectEditing && (
                <button
                  type="button"
                  onClick={handleAddPostSportItem}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '6px'
                  }}
                >
                  <Plus size={13} />
                  <span>Aggiungi Alimento Post-Allenamento</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '30px' }}>
          <BotanicalBottomOrnament />
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGINE GIORNALIERE: LUNEDÌ..DOMENICA
  // ==========================================
  function DayPage({ day, dayIdx }) {
    return (
      <div className="pdf-a4-page" style={{ justifyContent: 'space-between', padding: '80px 75px' }}>
        <div>
          {/* Motivo floreale superiore */}
          <div style={{ marginBottom: '32px' }}>
            <BotanicalTopOrnament />
          </div>

          {/* Titolo Giorno */}
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '2.25rem',
              fontWeight: 400,
              color: '#1e293b',
              textAlign: 'center',
              letterSpacing: '0.05em',
              margin: '0 0 42px 0'
            }}
          >
            {day.day_name}
          </h2>

          {/* Pasto 1: Pranzo */}
          <div style={{ marginBottom: '38px', paddingLeft: '14px' }}>
            {isDirectEditing && (
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e3a5f', textTransform: 'uppercase', marginBottom: '8px' }}>
                Pranzo:
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {(day.pranzo || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#1e293b' }}>•</span>
                  {isDirectEditing ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateDayMealItem(dayIdx, 'pranzo', idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1.5px dashed #3b82f6',
                          backgroundColor: '#f8fafc',
                          fontSize: '0.98rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDayMealItem(dayIdx, 'pranzo', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.04rem', lineHeight: 1.6, color: '#1e293b' }}>
                      {item}
                    </div>
                  )}
                </div>
              ))}
              {isDirectEditing && (
                <button
                  type="button"
                  onClick={() => handleAddDayMealItem(dayIdx, 'pranzo')}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  <span>Aggiungi Alimento Pranzo</span>
                </button>
              )}
            </div>

            {/* Sostituzioni Pranzo */}
            {isDirectEditing ? (
              <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Note e Sostituzioni Pranzo:
                </div>
                {(day.pranzo_substitutions || []).map((sub, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => handleUpdateDaySub(dayIdx, 'pranzo', sIdx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1px dashed #94a3b8',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.84rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDaySub(dayIdx, 'pranzo', sIdx)}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddDaySub(dayIdx, 'pranzo')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px dashed #64748b',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  <Plus size={12} />
                  <span>Aggiungi Sostituzione Pranzo</span>
                </button>
              </div>
            ) : (
              day.pranzo_substitutions && day.pranzo_substitutions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.88rem', color: '#334155', paddingLeft: '4px' }}>
                  {day.pranzo_substitutions.map((sub, sIdx) => (
                    <div key={sIdx}>{sub}</div>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Pasto 2: Cena */}
          <div style={{ marginBottom: '35px', paddingLeft: '14px' }}>
            {isDirectEditing && (
              <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#1e3a5f', textTransform: 'uppercase', marginBottom: '8px' }}>
                Cena:
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
              {(day.cena || []).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#1e293b' }}>•</span>
                  {isDirectEditing ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateDayMealItem(dayIdx, 'cena', idx, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1.5px dashed #3b82f6',
                          backgroundColor: '#f8fafc',
                          fontSize: '0.98rem'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveDayMealItem(dayIdx, 'cena', idx)}
                        style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ fontSize: '1.04rem', lineHeight: 1.6, color: '#1e293b' }}>
                      {item}
                    </div>
                  )}
                </div>
              ))}
              {isDirectEditing && (
                <button
                  type="button"
                  onClick={() => handleAddDayMealItem(dayIdx, 'cena')}
                  style={{
                    alignSelf: 'flex-start',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '4px',
                    border: '1px dashed #059669',
                    backgroundColor: '#ecfdf5',
                    color: '#065f46',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  <span>Aggiungi Alimento Cena</span>
                </button>
              )}
            </div>

            {/* Sostituzioni Cena */}
            {isDirectEditing ? (
              <div style={{ marginTop: '8px', paddingLeft: '4px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                  Note e Sostituzioni Cena:
                </div>
                {(day.cena_substitutions || []).map((sub, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <input
                      type="text"
                      value={sub}
                      onChange={(e) => handleUpdateDaySub(dayIdx, 'cena', sIdx, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '3px 8px',
                        borderRadius: '4px',
                        border: '1.5px dashed #94a3b8',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.84rem'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveDaySub(dayIdx, 'cena', sIdx)}
                      style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddDaySub(dayIdx, 'cena')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px dashed #64748b',
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginTop: '2px'
                  }}
                >
                  <Plus size={12} />
                  <span>Aggiungi Sostituzione Cena</span>
                </button>
              </div>
            ) : (
              day.cena_substitutions && day.cena_substitutions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.88rem', color: '#334155', paddingLeft: '4px' }}>
                  {day.cena_substitutions.map((sub, sIdx) => (
                    <div key={sIdx}>{sub}</div>
                  ))}
                </div>
              )
            )}
          </div>
        </div>

        {/* Box Consiglio Culinario in basso (con icona lampadina e linea) */}
        <div>
          {isDirectEditing ? (
            <div style={{ marginBottom: '26px' }}>
              <div style={{ width: '100%', height: '1.2px', backgroundColor: '#1e293b', marginBottom: '12px' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <LightbulbTipIcon />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '4px' }}>
                    Consiglio Culinario / Variante (Opzionale):
                  </div>
                  <textarea
                    rows={2}
                    value={day.tip || ''}
                    placeholder="Es. 150g di petto di pollo: al limone, all'arancia, panato, tritato..."
                    onChange={(e) => handleUpdateDayTip(dayIdx, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      border: '1.5px dashed #3b82f6',
                      backgroundColor: '#f8fafc',
                      fontSize: '0.9rem',
                      fontStyle: 'italic',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            day.tip && (
              <div style={{ marginBottom: '26px' }}>
                <div style={{ width: '100%', height: '1.2px', backgroundColor: '#1e293b', marginBottom: '16px' }} />
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <LightbulbTipIcon />
                  <div
                    style={{
                      fontSize: '0.98rem',
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      color: '#1e293b',
                      paddingTop: '2px'
                    }}
                  >
                    {day.tip}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Motivo floreale inferiore */}
          <div style={{ paddingTop: '15px' }}>
            <BotanicalBottomOrnament />
          </div>
        </div>
      </div>
    );
  }

  const modalJSX = (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '1080px',
          width: '95vw',
          maxHeight: '96vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          color: '#1e293b',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Barra superiore di controllo (esclusa dalla stampa) - SFONDO BIANCO */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 24px',
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            position: 'relative'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', background: '#f0f4fa', color: '#1e3a5f', borderRadius: '8px' }}>
              <FileText size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e3a5f', fontWeight: 700 }}>
                Anteprima e Stampa Piano Alimentare A4
              </h3>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                Paziente: <strong style={{ color: '#1e293b' }}>{patientFullName}</strong> • {pages.length} pagine A4 pronte
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Toggle visualizzazione: Tutte le pagine vs Pagina per Pagina */}
            <div style={{ display: 'flex', background: '#f8fafc', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <button
                onClick={() => setViewMode('all')}
                style={{
                  background: viewMode === 'all' ? '#1e3a5f' : 'transparent',
                  color: viewMode === 'all' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Tutte le {pages.length} Pagine
              </button>
              <button
                onClick={() => setViewMode('single')}
                style={{
                  background: viewMode === 'single' ? '#1e3a5f' : 'transparent',
                  color: viewMode === 'single' ? '#ffffff' : '#64748b',
                  border: 'none',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Pagina Singola
              </button>
            </div>

            {viewMode === 'single' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  disabled={currentPageIndex === 0}
                  onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))}
                  className="btn btn-secondary btn-icon-only btn-sm"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.8rem', color: '#475569', minWidth: '70px', textAlign: 'center', fontWeight: 600 }}>
                  {currentPageIndex + 1} / {pages.length}
                </span>
                <button
                  disabled={currentPageIndex === pages.length - 1}
                  onClick={() => setCurrentPageIndex(p => Math.min(pages.length - 1, p + 1))}
                  className="btn btn-secondary btn-icon-only btn-sm"
                  style={{ borderColor: '#cbd5e1' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* PULSANTE MODIFICA DIRETTA DALL'APP */}
            <button
              onClick={() => setIsDirectEditing(!isDirectEditing)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: isDirectEditing ? '#059669' : '#ffffff',
                color: isDirectEditing ? '#ffffff' : '#059669',
                border: isDirectEditing ? '1px solid #059669' : '1px solid #10b981',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isDirectEditing ? '0 2px 6px rgba(5, 150, 105, 0.3)' : 'none'
              }}
              title="Attiva la modifica diretta dei testi, grammature, alimenti e raccomandazioni nell'app"
            >
              <Pencil size={15} />
              <span>{isDirectEditing ? 'Modalità Modifica Attiva' : "Modifica dall'App"}</span>
            </button>

            {/* PULSANTE SALVA MODIFICHE (visibile quando in modifica diretta) */}
            {isDirectEditing && (
              <button
                onClick={handleSaveDietDirect}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#1e3a5f',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(30, 58, 95, 0.25)'
                }}
                title="Salva tutte le modifiche apportate direttamente nel piano alimentare"
              >
                <Save size={15} />
                <span>Salva Modifiche</span>
              </button>
            )}

            {/* PULSANTE SCARICA WORD (.DOCX) */}
            <button
              onClick={handleExportWord}
              disabled={isGeneratingPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                color: '#1d4ed8',
                border: '1px solid #93c5fd',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Scarica il file completo in formato Word (.docx) per modificarlo con Microsoft Word o LibreOffice"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#eff6ff')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <FileText size={15} />
              <span>Scarica Word (.docx)</span>
            </button>

            {/* PULSANTE SCARICA PDF */}
            <button
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: '#ffffff',
                color: '#1e3a5f',
                border: '1px solid #cbd5e1',
                padding: '8px 14px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.86rem',
                cursor: isGeneratingPdf ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
              title="Compila e scarica direttamente il file PDF completo in formato A4"
              onMouseEnter={(e) => !isGeneratingPdf && (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => !isGeneratingPdf && (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <Download size={15} />
              <span>Scarica PDF</span>
            </button>

            {/* PULSANTE CONDIVIDI PDF */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowShareModal(!showShareModal)}
                disabled={isGeneratingPdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#f0f4fa',
                  color: '#1e3a5f',
                  border: '1px solid #b9cce0',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.86rem',
                  cursor: isGeneratingPdf ? 'not-allowed' : 'pointer'
                }}
              >
                <Share2 size={15} />
                <span>Condividi</span>
              </button>

              {/* Menu a discesa di condivisione del file PDF e Word */}
              {showShareModal && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    width: '300px',
                    backgroundColor: '#ffffff',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
                    border: '1px solid #e2e8f0',
                    zIndex: 100,
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ padding: '6px 10px', fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Condivisione & Esportazione
                  </div>

                  <button
                    onClick={handleExportWord}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#1d4ed8',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <FileText size={16} />
                    <span>Scarica File Word (.docx modificabile)</span>
                  </button>

                  <button
                    onClick={handleWhatsAppSharePdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#16a34a',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <MessageCircle size={16} />
                    <span>Invia PDF su WhatsApp</span>
                  </button>

                  <button
                    onClick={handleEmailSharePdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#1e3a5f',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5fa'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Mail size={16} />
                    <span>Invia PDF via Email</span>
                  </button>

                  <button
                    onClick={handleSharePdfNative}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#2563eb',
                      fontWeight: 600,
                      fontSize: '0.86rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#eff6ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Send size={16} />
                    <span>Condividi File PDF (App / Dispositivo)</span>
                  </button>

                  <div style={{ height: '1px', backgroundColor: '#f1f5f9', margin: '4px 0' }} />

                  <button
                    onClick={handleDownloadPdf}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#334155',
                      fontWeight: 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Download size={15} />
                    <span>Salva File PDF (.pdf)</span>
                  </button>

                  <button
                    onClick={handleCopyClipboard}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '9px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: '#64748b',
                      fontWeight: 500,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {copied ? <Check size={15} color="#16a34a" /> : <Copy size={15} />}
                    <span>{copied ? 'Copiato!' : 'Copia Riepilogo Testo'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* PULSANTE STAMPA */}
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#1e3a5f',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(30, 58, 95, 0.25)'
              }}
            >
              <Printer size={16} />
              <span>Stampa / PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                padding: '6px'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* BANNER NOTIFICA MODALITÀ MODIFICA DIRETTA */}
        {isDirectEditing && (
          <div
            className="no-print"
            style={{
              backgroundColor: '#ecfdf5',
              borderBottom: '1px solid #a7f3d0',
              padding: '10px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.86rem',
              color: '#065f46'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Pencil size={16} color="#059669" />
              <span>
                <strong>Modalità Modifica Diretta Attiva:</strong> Puoi modificare direttamente nomi, porzioni, alimenti, raccomandazioni e note su ciascuna pagina sottostante.
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleExportWord}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#ffffff',
                  color: '#1d4ed8',
                  border: '1px solid #93c5fd',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <FileText size={14} />
                <span>Scarica in Word (.docx)</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDietDirect}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.25)'
                }}
              >
                <Check size={14} />
                <span>Salva Modifiche</span>
              </button>
            </div>
          </div>
        )}

        {/* NOTIFICA TOAST ELEGANTE */}
        {toastMessage && (
          <div
            style={{
              position: 'absolute',
              top: '70px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: '#1e3a5f',
              color: '#ffffff',
              padding: '10px 22px',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.25)',
              fontSize: '0.88rem',
              fontWeight: 500,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <Check size={16} color="#4ade80" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* OVERLAY DI CARICAMENTO DURANTE LA COMPILAZIONE DEL PDF */}
        {isGeneratingPdf && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.92)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999
            }}
          >
            <div
              style={{
                backgroundColor: '#ffffff',
                padding: '30px 38px',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(15, 23, 42, 0.16)',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                maxWidth: '380px'
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  backgroundColor: '#f0f4fa',
                  color: '#1e3a5f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}
              >
                <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
              </div>
              <h3 style={{ fontSize: '1.15rem', color: '#1e3a5f', fontWeight: 700, margin: '0 0 6px' }}>
                Generazione PDF in corso...
              </h3>
              <p id="pdf-progress-text" style={{ fontSize: '0.86rem', color: '#64748b', margin: '0 0 16px' }}>
                Preparazione delle pagine (Alta fedeltà A4)...
              </p>
              <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  id="pdf-progress-bar-fill"
                  style={{
                    width: '0%',
                    height: '100%',
                    backgroundColor: '#1e3a5f',
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CONTENITORE FOGLI A4 (Visualizzazione pulita) */}
        <div className="pdf-sheet-container" style={{ flex: 1, backgroundColor: '#e2e8f0' }}>
          {viewMode === 'all' ? (
            pages.map(page => page.render())
          ) : (
            pages[currentPageIndex].render()
          )}
        </div>
      </div>
    </div>
  );

  // Renderizza tramite Portale per isolare al 100% la stampa da qualsiasi elemento di input sottostante
  const portalNode = document.getElementById('diet-print-portal') || document.body;
  return createPortal(modalJSX, portalNode);
}
