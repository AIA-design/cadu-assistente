import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // garante que o index.html e assets sejam servidos

// Endpoint para perguntas ao Cadu via Hugging Face
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const hfToken = process.env.HF_API_KEY; // token configurado no Secrets
    const model = "bigcode/starcoder"; // substitua pelo modelo correto HF que você escolheu

    const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: pergunta }),
    });

    const data = await response.json();

    // Confere se a resposta veio no formato esperado
    if (Array.isArray(data) && data[0].generated_text) {
      res.json({ message: data[0].generated_text });
    } else {
      res.status(500).json({ message: "Erro ao consultar HF: resposta inesperada" });
    }
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar HF" });
  }
});

// Endpoint raiz
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Mantém o servidor ativo
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
