import fetch from "node-fetch";

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

        // Mostrar log completo da resposta
        console.log("Resposta bruta da OpenAI:", JSON.stringify(data, null, 2));

        // Verificar se existe a mensagem antes de acessar
        if (data.choices && data.choices[0] && data.choices[0].message) {
            console.log("Resposta GPT:", data.choices[0].message.content);
        } else {
            console.error("A resposta da OpenAI não possui choices[0].message");
        }
    } catch (err) {
        console.error("Erro ao consultar GPT:", err);
    }
}

testarGPT("Qual a cotação do dólar hoje?");
