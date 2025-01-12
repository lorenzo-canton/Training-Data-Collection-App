const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Endpoint esempio per la generazione
app.post('/api/generate', async (req, res) => {
  const { instruction, model } = req.body;
  try {
    // Qui implementerai la chiamata al tuo modello
    const response = `Risposta generata per: "${instruction}" usando ${model}`;
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});