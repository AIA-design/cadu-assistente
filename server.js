import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY; // variável do secrets

    const r = await fetch("https://api-inference.huggingface.co/models/gpt-neo-2.7B", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: pergunta })
    });

    const data = await r.json();
    // Verifica se a resposta veio
    const message = data[0]?.generated_text || "Não consegui gerar a resposta.";

    res.json({ message });
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar HF" });
  }
});

// Serve arquivos estáticos
app.use(express.static("public"));

// Root
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.listen(PORT, () => console.log(`Cadu backend rodando na porta ${PORT}`));
