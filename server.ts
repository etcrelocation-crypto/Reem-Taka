import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const CONTENT_PATH = path.join(process.cwd(), "content.json");

app.use(express.json());

// Content API
app.get("/api/content", async (req, res) => {
  try {
    const data = await fs.readFile(CONTENT_PATH, "utf-8");
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: "Failed to read content" });
  }
});

app.post("/api/admin/login", async (req, res) => {
  const { code } = req.body;
  if (code === process.env.ADMIN_ACCESS_CODE) {
    res.json({ success: true });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

app.post("/api/content", async (req, res) => {
  try {
    await fs.writeFile(CONTENT_PATH, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to update content" });
  }
});

// Gemini AI API
app.post("/api/chat", async (req, res) => {
  const { message, history } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: "GEMINI_API_KEY is not set" });
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  try {
    const systemInstruction = `You are the ETC Relocation AI Concierge, a premium relocation expert in Kuwait.
You are professional, welcoming, and highly knowledgeable about Kuwaiti culture, landmarks, schooling, and relocation logistics.
Mention local landmarks like 'Babel Restaurant' (Lebanese fine dining with Gulf views), 'The Avenues Mall' (best for shopping and escaping heat), and 'Souk Al Mubarakiya'.
ETC Relocation is owned by Reem Taka (German-Iraqi background), who is the 'Cultural Bridge'.
Keep responses concise but premium. Use formatting where helpful.`;

    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction,
      }
    });

    // Send history if provided, but for now just send the single message for simplicity
    // or properly map history if needed.
    const response = await chat.sendMessage({ message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
