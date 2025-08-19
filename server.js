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
    const apiKey = process.env.DEEP_API_KEY; // variável do secrets

    const r = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ text: pergunta })
    });

    const data = await r.json();
    const message = data.output || "Não consegui gerar a resposta.";

    res.json({ message });
  } catch (err) {
    console.error("Erro ao consultar DeepAI:", err);
    res.status(500).json({ message: "Erro ao consultar DeepAI" });
  }
});

// Serve arquivos estáticos
app.use(express.static("public"));

// Root
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.listen(PORT, () => console.log(`Cadu backend rodando na porta ${PORT}`));
