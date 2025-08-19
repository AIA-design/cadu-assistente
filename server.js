import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint para interagir com o modelo
app.post('/cadu', async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY; // Token da Hugging Face configurado nos Secrets
    const modelo = 'meta-llama/Llama-2-13b-chat'; // Modelo escolhido

    const response = await fetch(`https://api-inference.huggingface.co/models/${modelo}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ inputs: pergunta }),
    });

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ message: 'Erro ao consultar HF', data });
    }

    res.json({ message: data[0]?.generated_text || 'Sem resposta do modelo' });
  } catch (err) {
    console.error('Erro ao consultar HF:', err);
    res.status(500).json({ message: 'Erro ao consultar HF' });
  }
});

// Endpoint raiz
app.get('/', (req, res) => {
  res.send('Cadu backend rodando!');
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
