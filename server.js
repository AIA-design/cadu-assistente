import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint para DeepAI
app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;
    const apiKey = process.env.DEEP_AI_KEY; // colocar no secrets

    const response = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ text: question })
    });

    const data = await response.json();
    res.json({ answer: data.output_text });
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ answer: "Erro ao consultar Cadu." });
  }
});

app.get("/", (req, res) => {
  res.send("Cadu backend rodando!");
});

app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
