import fetch from "node-fetch";

// Pergunta de teste
const pergunta = "Olá, teste se você responde corretamente.";

// Pega a chave do ambiente (Render Secrets ou variável local)
const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error("Erro: OPENAI_API_KEY não definida!");
  process.exit(1);
}

async function testarGPT() {
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: pergunta }],
        temperature: 0.7
      }),
    });

    const data = await r.json();

    console.log("Resposta GPT:", data.choices[0].message.content);
  } catch (err) {
    console.error("Erro ao consultar GPT:", err);
  }
}

testarGPT();
