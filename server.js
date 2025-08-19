import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint clima (opcional)
app.get("/clima", async (req, res) => {
  try {
    const cidade = "Fortaleza";
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade},BR&appid=${apiKey}&units=metric&lang=pt_br`);
    const data = await r.json();
    res.json({ message: `Em ${cidade} hoje está ${data.weather[0].description} com ${data.main.temp.toFixed(0)}°C.` });
  } catch (err) {
    res.status(500).json({ message: "Erro ao consultar o clima" });
  }
});

// Endpoint HF GPT
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY;

    const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: { 
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: pergunta })
    });

    const data = await response.json();

    if (data.error) {
      res.status(500).json({ message: `Erro HF: ${data.error}` });
      return;
    }

    // A Hugging Face retorna um array de outputs
    const resposta = data[0]?.generated_text || "Não consegui gerar uma resposta.";
    res.json({ message: resposta });
  } catch (err) {
    console.error("Erro ao consultar GPT:", err);
    res.status(500).json({ message: "Erro ao consultar GPT" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("Cadu backend rodando!");
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
