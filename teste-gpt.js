import fetch from "node-fetch";

// Função para testar GPT
async function testarGPT(pergunta) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        console.error("Erro: OPENAI_API_KEY não definida!");
        return;
    }

    try {
        const r = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: pergunta }],
            }),
        });

        const data = await r.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            console.log("Resposta GPT:", data.choices[0].message.content);
        } else {
            console.error("Erro ao consultar GPT:", data);
        }
    } catch (err) {
        console.error("Erro ao consultar GPT:", err);
    }
}

// Teste rápido
testarGPT("Qual a cotação do dólar hoje?");
