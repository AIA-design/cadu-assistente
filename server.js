import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // versão compatível: 3.3.1

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serve o index.html na pasta public

// Endpoint clima
app.get("/clima", async (req, res) => {
  try {
    const cidade = "Fortaleza";
    const apiKey = process.env.WEATHER_API_KEY;
    const r = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cidade},BR&appid=${apiKey}&units=metric&lang=pt_br`);
    const data = await r.json();
    res.json({ message: `Em ${cidade} hoje está ${data.weather[0].description} com ${data.main.temp.toFixed(0)} graus.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao consultar o clima" });
  }
});

// Endpoint HF GPT
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY;

    const r = await fetch("https://api-inference.huggingface.co/models/llama-2-7b-chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: pergunta })
    });

    const data = await r.json();

    if (data.error) {
      console.error("Erro HF:", data.error);
      return res.status(500).json({ message: "Erro ao consultar HF" });
    }

    // HF retorna array com generated_text
    const resposta = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : "Não foi possível gerar resposta.";
    res.json({ message: resposta });

  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar HF" });
  }
});

// Root
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Mantém servidor rodando
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
