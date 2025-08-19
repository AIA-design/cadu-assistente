import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3000; // Render define automaticamente

app.use(cors());
app.use(express.json());

// Endpoint dólar
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

// Endpoint clima
app.get("/clima", async (req, res) => {
  try {
    const cidade = "Fortaleza"; // ou qualquer outra cidade dinâmica
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cidade},BR&appid=${apiKey}&units=metric&lang=pt_br`
    );
    const data = await r.json();
    res.json({ message: `Em ${cidade} hoje está ${data.weather[0].description} com ${data.main.temp.toFixed(0)} graus.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao consultar o clima" });
  }
});

// Endpoint GPT / perguntas gerais
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.OPENAI_API_KEY;
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
    res.json({ message: data.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erro ao consultar o GPT" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("Cadu backend rodando!");
});

// Mantém o servidor ativo
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
