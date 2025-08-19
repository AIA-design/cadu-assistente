import express from "express";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public")); // serve arquivos da pasta public

// Root
app.get("/", (req, res) => {
  res.sendFile(path.resolve("public/index.html")); // garante que abre o HTML
});

app.listen(PORT, () => {
  console.log(`Cadu backend rodando na porta ${PORT}`);
});
