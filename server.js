import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve arquivos da pasta public

// ======== ENDPOINTS ========

// Cotação do dólar
app.get("/dolar", async (req, res) => {
  try {
    const r = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL");
    const data = await r.json();
    res.json({ message: `O dólar agora está R$ ${data.rates.BRL.toFixed(2)}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao consultar o dólar" });
  }
});

// Clima
app.get("/clima", async (req, res) => {
  try {
    const cidade = "Fortaleza";
    const apiKey = process.env.OPENWEATHER_API_KEY; // secret
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade},BR&appid=${apiKey}&units=metric&lang=pt_br`
    );
    const data = await r.json();
    res.json({
      message: `Em ${cidade} hoje está ${data.weather[0].description} com ${data.main.temp.toFixed(0)} graus.`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao consultar o clima" });
  }
});

// Perguntas gerais GPT
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.OPENAI_API_KEY; // secret
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: pergunta }],
      }),
    });
    const data = await r.json();
    if (!data.choices || data.choices.length === 0) {
  console.error("Resposta GPT inválida:", data);
  return res.status(500).json({ message: "Erro na resposta do GPT" });
}
res.json({ message: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao consultar o GPT" });
  }
});

// Root → abre frontend
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html"));
});

// Mantém o servidor ativo
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
