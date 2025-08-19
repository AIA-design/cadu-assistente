import express from "express";
import cors from "cors";
import multer from "multer";
import OpenAI, { toFile } from "openai";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// -------------------- CONFIG --------------------
const PORT = process.env.PORT || 3000; // Render injeta PORT (use essa!)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;      // defina no Render
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY; // defina no Render
// Opcional: pesquisa na web (Tavily). Se não for usar, deixe em branco.
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || ""; 

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

app.use(cors());
app.use(express.json({ limit: "2mb" }));

// -------------------- API: dólar --------------------
app.get("/api/usdbrl", async (req, res) => {
  try {
    const r = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=BRL");
    const data = await r.json();
    const valor = data?.rates?.BRL;
    if (!valor) throw new Error("Sem taxa");
    res.json({ ok: true, answer: `O dólar agora está em R$ ${valor.toFixed(2)}.` });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Erro ao consultar dólar." });
  }
});

// -------------------- API: clima --------------------
app.get("/api/weather", async (req, res) => {
  try {
    const city = (req.query.city || "Fortaleza").toString();
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},BR&appid=${OPENWEATHER_API_KEY}&units=metric&lang=pt_br`;
    const r = await fetch(url);
    const data = await r.json();
    if (!data?.main?.temp) throw new Error("Cidade inválida ou chave incorreta");
    const desc = data.weather?.[0]?.description || "tempo desconhecido";
    const temp = Math.round(data.main.temp);
    res.json({ ok: true, answer: `Em ${city} agora está ${desc} com ${temp}°C.` });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Erro ao consultar o clima." });
  }
});

// -------------------- API: STT (áudio -> texto) --------------------
app.post("/api/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ ok: false, error: "Sem áudio." });
    const fileName = `fala.${(req.file.mimetype?.split("/")?.[1] || "webm")}`;
    const transcription = await openai.audio.transcriptions.create({
      file: await toFile(req.file.buffer, fileName),
      model: "whisper-1", // estável e com bom custo/benefício
      // language: "pt" // opcional
    });
    res.json({ ok: true, text: transcription.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Falha na transcrição." });
  }
});

// -------------------- API: LLM (perguntas gerais) --------------------
app.post("/api/ask", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ ok: false, error: "Pergunta vazia." });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Você é o Cadu, assistente pessoal do usuário. Responda em pt-BR, de forma direta e útil." },
        { role: "user", content: text }
      ]
    });

    const answer = completion.choices?.[0]?.message?.content || "Não consegui responder agora.";
    res.json({ ok: true, answer });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: "Erro ao consultar o modelo." });
  }
});

// -------------------- (Opcional) Pesquisa na Web com Tavily --------------------
app.get("/api/search", async (req, res) => {
  try {
    if (!TAVILY_API_KEY) return res.status(400).json({ ok: false, error: "Sem TAVILY_API_KEY configurada." });
    const q = (req.query.q || "").toString();
    if (!q) return res.status(400).json({ ok: false, error: "Query vazia." });

    const r = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TAVILY_API_KEY}` },
      body: JSON.stringify({ query: q, include_answer: true })
    });
    const data = await r.json();
    res.json({ ok: true, result: data });
  } catch (e) {
    res.status(500).json({ ok: false, error: "Erro na pesquisa web." });
  }
});

// -------------------- Static (site) --------------------
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Cadu rodando na porta ${PORT}`);
});
