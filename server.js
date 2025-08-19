import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint GPT/Hugging Face
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY; // variável do secrets
    const modelo = "NomeDoModeloLL"; // substitua pelo modelo que você quer usar

    const r = await fetch(`https://api-inference.huggingface.co/models/${modelo}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: pergunta,
      }),
    });

    const data = await r.json();

    // verificação de erro
    if (!data || data.error) {
      return res.status(500).json({ message: "Erro ao consultar HF", data });
    }

    // resposta do modelo
    res.json({ message: data[0]?.generated_text || "Sem resposta do modelo" });
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar HF" });
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
