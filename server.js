import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001; // Use porta disponível

app.use(cors());
app.use(express.json());

// Endpoint para perguntas ao Cadu
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY;

    const r = await fetch(
      "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: pergunta }),
      }
    );

    const data = await r.json();

    if (data.error) {
      return res.status(500).json({ message: `Erro ao consultar HF: ${data.error}` });
    }

    // A resposta do modelo pode vir em array ou string, depende do modelo
    let resposta = "";
    if (Array.isArray(data) && data[0].generated_text) {
      resposta = data[0].generated_text;
    } else if (data.generated_text) {
      resposta = data.generated_text;
    } else {
      resposta = "Não foi possível obter resposta do modelo.";
    }

    res.json({ message: resposta });
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar HF" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("Cadu backend rodando!");
});

// Mantém servidor ativo
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
