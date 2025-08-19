import express from "express";
import cors from "cors";
import fetch from "node-fetch"; // Node 22+ já suporta fetch nativo, mas manter para compatibilidade

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public")); // Serve index.html e outros arquivos estáticos

// Endpoint para perguntas ao Hugging Face
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const hfApiKey = process.env.HF_API_KEY;

    if (!hfApiKey) {
      return res.status(500).json({ message: "HF_API_KEY não encontrada no Secrets" });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2", // substitua pelo modelo que você escolheu
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: pergunta }),
      }
    );

    const data = await response.json();

    // Verifica se a resposta está no formato esperado
    if (data.error) {
      return res.status(500).json({ message: `Erro API HF: ${data.error}` });
    }

    // A resposta geralmente vem em data[0].generated_text
    const resposta = data[0]?.generated_text || "Não consegui gerar uma resposta.";
    res.json({ message: resposta });
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar o Cadu" });
  }
});

// Root
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "public" });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
