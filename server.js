import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001; // Render define a porta automaticamente

app.use(cors());
app.use(express.json());

// Endpoint GPT / perguntas gerais
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY; // variável do Secrets

    if (!apiKey) {
      return res.status(500).json({ message: "API key não definida" });
    }

    const r = await fetch("https://api-inference.huggingface.co/models/gpt2", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: pergunta })
    });

    const data = await r.json();

    if (data.error) {
      return res.status(500).json({ message: `Erro HF: ${data.error}` });
    }

    // Retorna a primeira resposta (ajuste se necessário)
    let resposta = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      resposta = data[0].generated_text;
    } else {
      resposta = "Opa, não consegui gerar a resposta.";
    }

    res.json({ message: resposta });

  } catch (err) {
    console.error("Erro ao consultar GPT:", err);
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
