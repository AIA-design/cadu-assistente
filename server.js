import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Endpoint Cadu
app.post("/cadu", async (req, res) => {
  try {
    const pergunta = req.body.pergunta;
    const apiKey = process.env.DEEP_API_KEY; // variável do secrets

    if(!apiKey) {
      return res.json({ message: "Chave de API não encontrada. Configure a variável DEEP_API_KEY." });
    }

    const params = new URLSearchParams();
    params.append("text", pergunta);

    const r = await fetch("https://api.deepai.org/api/text-generator", {
      method: "POST",
      headers: {
        "Api-Key": apiKey,
      },
      body: params
    });

    const text = await r.text();

    let message = "Não consegui gerar a resposta.";

    try {
      const data = JSON.parse(text);
      message = data.output || message;
    } catch(e) {
      // Se a resposta não for JSON, mantemos a mensagem padrão
      console.error("Resposta inesperada do DeepAI:", text);
    }

    res.json({ message });

  } catch (err) {
    console.error("Erro ao consultar DeepAI:", err);
    res.status(500).json({ message: "Erro ao consultar Cadu" });
  }
});

// Serve arquivos estáticos
app.use(express.static("public"));

// Root
app.get("/", (req, res) => {
  res.sendFile("index.html", { root: "./public" });
});

app.listen(PORT, () => console.log(`Cadu backend rodando na porta ${PORT}`));
