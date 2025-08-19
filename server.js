import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001; // Já evita conflito com 3000

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Para servir index.html

// Rota para processar a pergunta
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) {
    return res.status(400).json({ error: "Pergunta não fornecida" });
  }

  try {
    const response = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": process.env.DEEP_API_KEY, // sua chave no secrets
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text: question })
    });

    const data = await response.json();

    // O DeepAI retorna a resposta em data.output
    if (!data.output) {
      return res.status(500).json({ error: "Resposta inválida da DeepAI" });
    }

    res.json({ answer: data.output });
  } catch (error) {
    console.error("Erro ao consultar DeepAI:", error);
    res.status(500).json({ error: "Erro ao consultar DeepAI" });
  }
});

app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
