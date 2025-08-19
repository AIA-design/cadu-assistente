import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve arquivos estáticos da pasta 'public'
app.use(express.static("public"));

// Endpoint GPT / perguntas gerais
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.HF_API_KEY; // token HF no Secrets
    const modelo = "gpt-llama-2-7b-chat"; // exemplo de modelo correto HF

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${modelo}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: pergunta,
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      return res
        .status(500)
        .json({ message: `Erro ao consultar HF: ${data.error}` });
    }

    // Lida com respostas de texto do HF
    const mensagem = Array.isArray(data)
      ? data[0].generated_text
      : data.generated_text || "Resposta vazia";

    res.json({ message: mensagem });
  } catch (err) {
    console.error("Erro ao consultar HF:", err);
    res.status(500).json({ message: "Erro ao consultar HF" });
  }
});

// Root
app.get("/", (req, res) => {
  res.send("Cadu backend rodando!");
});

// Inicia servidor
app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
