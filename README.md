# Training Data Collection App

Un'applicazione React per la raccolta e la gestione di dati di training per modelli di machine learning. Permette di generare, confrontare e valutare diverse risposte per ogni prompt, facilitando la creazione di dataset di alta qualità.

## 🚀 Caratteristiche

- ✍️ Creazione e gestione di prompt/istruzioni
- 🤖 Generazione automatica di risposte multiple
- ⭐ Sistema di rating per le risposte
- 📝 Editor per modificare manualmente le risposte
- 💾 Esportazione dei dati in formato JSON
- 📊 Visualizzazione dello storico delle conversazioni

## 🛠️ Tecnologie Utilizzate

- React + Vite
- Tailwind CSS
- shadcn/ui per i componenti
- Lucide React per le icone

## 📦 Installazione

1. Clona il repository:
```bash
git clone https://github.com/tuousername/Training-Data-Collection-App.git
cd Training-Data-Collection-App
```

2. Installa le dipendenze:
```bash
npm install
```

3. Installa i componenti UI necessari:
```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add card button
```

4. Avvia l'applicazione in modalità sviluppo:
```bash
npm run dev
```

## 🗂️ Struttura del Progetto

```
training-app/
├── src/
│   ├── components/
│   │   ├── ui/           # Componenti shadcn
│   │   │   ├── button.jsx
│   │   │   └── card.jsx
│   │   └── TrainingApp.jsx  # Componente principale
│   ├── lib/
│   │   └── utils.js      # Utility functions
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
```

## 💻 Utilizzo

1. Inserisci un'istruzione o un prompt nel campo di testo
2. Usa il pulsante "Genera Varianti" per ottenere risposte automatiche
3. Modifica manualmente le risposte se necessario
4. Assegna un rating alle varianti migliori
5. Salva la conversazione
6. Esporta il dataset quando hai raccolto abbastanza esempi

## 🔧 Configurazione API

Per configurare le tue API di generazione:

1. Modifica la funzione `generateResponse` in `TrainingApp.jsx`:
```javascript
const generateResponse = async (instruction, model) => {
  // Implementa qui la tua logica di chiamata API
  const response = await tuaFunzioneAPI(instruction, model);
  return response;
};
```

2. Configura i modelli disponibili:
```javascript
const availableModels = [
  { id: 'model1', name: 'Il tuo Modello 1' },
  { id: 'model2', name: 'Il tuo Modello 2' }
];
```

## 📄 Formato del Dataset

Il dataset esportato sarà in questo formato:
```json
[
  {
    "instruction": "Il prompt dell'utente",
    "response": "La migliore risposta selezionata"
  }
]
```

## 🤝 Contribuire

Sei interessato a contribuire? Fantastico! 

1. Fai un fork del progetto
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa i tuoi cambiamenti (`git commit -m 'Add some AmazingFeature'`)
4. Pusha sul branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

## 📝 License

Distribuito sotto la licenza MIT. Vedi `LICENSE` per maggiori informazioni.

