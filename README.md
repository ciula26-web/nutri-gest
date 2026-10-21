# 🥗 NutriGest - Gestionale per Studio Nutrizionale

**NutriGest** è un'applicazione web moderna per la gestione completa dei pazienti di uno studio di nutrizione e dietologia, progettata per funzionare **interamente in locale sul tuo computer**.

---

## 🌟 Caratteristiche Principali

### 1. 👥 Anagrafica & Cartella Clinica Paziente
- Dati personali completi (Nome, Cognome, Sesso, Data di nascita con calcolo automatico età, Codice Fiscale, Telefono, Email, Professione, Indirizzo).
- **Anamnesi medica e nutrizionale**:
  - Box dedicato per **Allergie Alimentari** e **Intolleranze** con allarmi visivi.
  - Patologie diagnosticate e farmaci/terapie in uso.
  - Stile di vita, orari dei pasti, preferenze e avversioni alimentari.
  - Livello di attività fisica (Sedentario, Leggera, Moderata, Intensa, Atleta).
- Monitoraggio stato del paziente (Attivo, In Pausa, Concluso).

### 2. ⚖️ Monitoraggio Peso & Misure Antropometriche
- Calcolo automatico istantaneo del **BMI (Indice di Massa Corporea)** con classificazione OMS a colori.
- **Curva ponderale temporale interattiva** con tracciamento della linea obiettivo (target weight) e percentuale di completamento percorso.
- Variazione peso calcolata automaticamente:
  - $\Delta$ rispetto alla visita precedente.
  - $\Delta$ totale rispetto al peso iniziale della prima visita.
- Misure delle circonferenze corporee (Vita, Fianchi, Addome, Braccio, Coscia) con calcolo automatico del rapporto **WHR (Waist-to-Hip Ratio)** per la valutazione del rischio cardiovascolare.

### 3. ⚡ Analisi BIA (Bioimpedenziometria Avanzata)
- Inserimento rapido delle misurazioni bioimpedenziometriche durante la visita:
  - **Angolo di Fase (PhA °)**: indicatore biologico dello stato nutrizionale e integrità delle membrane cellulari.
  - **Massa Grassa (FM)** in kg e percentuale.
  - **Massa Magra (FFM)** in kg e percentuale.
  - **Acqua Corporea Totale (TBW)** in litri e percentuale.
  - Distribuzione idrica: **Acqua Extracellulare (ECW)** vs **Acqua Intracellulare (ICW)**.
  - **Massa Cellulare Corporea (BCM)** in kg e percentuale.
  - **Livello Grasso Viscerale** con soglia di sicurezza.
  - **Metabolismo Basale stimato (BMR kcal)**.
  - Resistenza (Rz) e Reattanza (Xc) in Ohm.
  - Note vettoriali BIVA per l'interpretazione clinica dell'idratazione.
- **Card Comparativa Dinamica**: confronto analitico *"Prima Visita vs Ultima Visita"* con delta assoluti e percentuali.
- Grafici temporali dell'evoluzione della massa grassa vs magra e del trend dell'angolo di fase.

### 4. 🥗 Piani Alimentari Settimanali & Stampa PDF Professionale
- Struttura settimanale completa: **da Lunedì a Domenica**.
- Pasti giornalieri suddivisi in: *Colazione, Spuntino Mattina, Pranzo, Merenda Pomeriggio, Cena, Spuntino Serale*.
- Grammatura, porzioni, alternative e note per ogni pasto.
- **Funzione rapida "Copia Lunedì su tutti i giorni feriali (Mar-Ven)"** per velocizzare la redazione del piano.
- Calorie target e distribuzione macronutrienti (Carboidrati %, Proteine %, Grassi %).
- Raccomandazioni generali su idratazione (litri/giorno), metodi di cottura, uso dell'olio EVO a crudo, attività fisica e integratori.
- **Esportazione & Stampa PDF A4**: layout grafico pulito con intestazione dello studio, dati del paziente, tabella settimanale leggibile, note e spazio per timbro e firma del nutrizionista.

### 5. 🔒 Privacy Totale & Backup Locale (GDPR Medical Compliant)
- I dati sono salvati in un file **SQLite locale** (`data/nutrigest.sqlite`) all'interno della cartella dell'app.
- Nessun dato sensibile o sanitario viene trasmesso a server cloud terzi.
- **Download backup immediato**: pulsante rapido per scaricare il file `.sqlite` o esportare tutti i dati in formato JSON aperto.
- Supporto per **Tema Scuro (Dark Mode)** e **Tema Chiaro**.

---

## 🚀 Come Avviare l'Applicazione

### Metodo 1: Avvio con un Click (Windows)
Fai doppio click sul file:
```
Avvia_NutriGest.bat
```
Si aprirà automaticamente il browser su **`http://localhost:3001`**.

---

### Metodo 2: Da Terminale (PowerShell o CMD)
1. Apri il terminale nella cartella `nutri-gest`:
   ```bash
   cd C:\Users\ciula\.gemini\antigravity-ide\scratch\nutri-gest
   ```
2. Avvia l'applicazione:
   ```bash
   npm start
   ```
3. Apri il browser all'indirizzo:
   ```
   http://localhost:3001
   ```

*(Per la modalità sviluppo con ricaricamento in tempo reale, puoi usare `npm run dev`)*.

---

## 📂 Struttura del Progetto

```
nutri-gest/
├── Avvia_NutriGest.bat     # Launcher con doppio click per Windows
├── package.json            # Script di avvio e configurazione
├── data/
│   └── nutrigest.sqlite    # Database SQLite locale con tutti i dati
├── server/
│   ├── server.js           # Server Express REST API & static server
│   └── database.js         # Schema tabelle SQLite e seed dati clinici demo
└── client/
    ├── index.html          # Template HTML con font Inter e Outfit
    ├── src/
    │   ├── api.js          # Client REST API
    │   ├── index.css       # Design system completo con variabili e stili stampa
    │   ├── App.jsx         # Componente principale e navigazione
    │   └── components/
    │       ├── Sidebar.jsx         # Menu laterale con badge e tema
    │       ├── TopBar.jsx          # Intestazione con pulsanti rapidi
    │       ├── Dashboard.jsx       # Panoramica studio, appuntamenti e statistiche
    │       ├── PatientsList.jsx    # Tabella pazienti con ricerca e filtri
    │       ├── PatientDetail.jsx   # Cartella clinica completa con grafici
    │       ├── PatientModal.jsx    # Modale anagrafica e anamnesi
    │       ├── NewVisitModal.jsx   # Modale pesate, misure e BIA
    │       ├── BiaView.jsx         # Modulo bioimpedenziometria vettoriale
    │       ├── DietPlanner.jsx     # Editor settimanale diete
    │       ├── DietPrintModal.jsx  # Anteprima e stampa PDF formato A4
    │       └── SettingsView.jsx    # Dati studio, timbro e backup SQLite
    └── dist/               # Bundle di produzione compilato
```
