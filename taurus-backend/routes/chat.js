const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const FILE_PATH = path.join(__dirname, "../conversations.json");

router.post("/", async (req, res) => {
  const { message, userId, conversationId } = req.body;
  if (!message || !userId || !conversationId) {
    return res.status(400).json({ error: "Parâmetros ausentes" });
  }
  try {
    const result = await model.generateContent(message);
    const response = result.response.text();

    let conversations = [];
    if (fs.existsSync(FILE_PATH)) {
      conversations = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8") || "[]");
    }

    // Verifica se já existe conversa com esse ID
    const existing = conversations.find(c => c.userId === userId && c.conversationId === conversationId);

    // Se não existir, cria nova com título baseado na mensagem
    if (!existing) {
      conversations.push({
        userId,
        conversationId,
        title: message.length > 30 ? message.slice(0, 30) + "..." : message,
        updatedAt: new Date().toISOString(),
        history: [{ message, response, timestamp: new Date().toISOString() }],
      });
    } else {
      existing.history.push({ message, response, timestamp: new Date().toISOString() });
      existing.updatedAt = new Date().toISOString();
    }

    // Remove conversas vazias (sem histórico)
    conversations = conversations.filter(c => c.history && c.history.length > 0);

    fs.writeFileSync(FILE_PATH, JSON.stringify(conversations, null, 2));

    res.json({ response });
  } catch (error) {
    console.error("Erro na Gemini API:", error);
    res.status(500).json({ error: "Erro ao chamar a API da Gemini" });
  }
});

router.get("/history/:userId/:conversationId", (req, res) => {
  const { userId, conversationId } = req.params;

  if (!fs.existsSync(FILE_PATH)) return res.json([]);

  const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8") || "[]");
  const convo = data.find(c => c.userId === userId && c.conversationId === conversationId);
  res.json(convo ? convo.history : []);
});

router.get("/conversations/:userId", (req, res) => {
  const { userId } = req.params;

  if (!fs.existsSync(FILE_PATH)) {
    return res.json([]);
  }

  const data = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8") || "[]");
  const userConversations = data.filter(c => c.userId === userId);

  const grouped = {};

  for (const conv of userConversations) {
    const id = conv.conversationId;
    if (!grouped[id]) {
      grouped[id] = {
        id: id,
        title: conv.title || "Sem título",
        updatedAt: conv.updatedAt || conv.timestamp || new Date(0).toISOString(),
      };
    } else {
      const current = new Date(grouped[id].updatedAt);
      const candidate = new Date(conv.updatedAt || conv.timestamp);
      if (candidate > current) {
        grouped[id].updatedAt = candidate.toISOString();
        grouped[id].title = conv.title || grouped[id].title;
      }
    }
  }

  const result = Object.values(grouped).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  res.json(result);
});


module.exports = router;