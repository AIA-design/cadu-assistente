import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001; // pega a porta do Render

app.use(cors());
app.use(express.json());

// Endpoint GPT / perguntas gerais
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY; // pega do Secrets do Render

    const r = await fetch("https://api-inference.huggingface.co/models/gpt-neo-3.5", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: pergunta
      })
    });

    const data = await r.json();

    if (data.error) {
      return res.status(500).json({ message: "Erro ao consultar GPT", detail: data.error });
    }

    // O HuggingFace retorna texto direto na resposta dependendo do modelo
    const resposta = Array.isArray(data) && data[0]?.generated_text ? data[0].generated_text : "Opa, deu algum erro!";
    res.json({ message: resposta });

  } catch (err) {
    console.error("Erro ao consultar GPT:", err);
    res.status(500).json({ message: "Erro ao consultar GPT" });
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
