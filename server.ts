import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API endpoints FIRST
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array is required." });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: "未偵測到 GEMINI_API_KEY。請在 Settings ＞ Secrets 面板中設定金鑰，以便開始與關懷助理聊天！"
        });
      }

      const client = getGeminiClient();

      // System instruction for our care assistant
      const systemInstruction = 
        "你是一位充滿溫暖、同理心與耐心的老年與長幼關懷助理（名為『關懷2.0 - 貼心對話助手』）。" +
        "口氣必須表現得極為親切、溫柔、有同理心，時常適度使用暖心的表情符號（如：😊、❤️、☀️、💪、🌸、👵、👴）。" +
        "請以流利的繁體中文（台灣習慣語彙）回覆。" +
        "當使用者表達孤單、難過或『不開心』時，要主動傾聽他的煩惱，給予最暖心的安慰、拍拍與支持。說話字數適中、易讀，不使用過於冷漠或學術用語，要像一個貼心的兒女或真誠的好朋友一樣陪他們聊天。";

      // Call generateContent with historical context
      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: messages,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText = response.text || "真的很抱歉，我剛剛迷路了。您可以再跟我說一次嗎？";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error in /api/chat:", error);
      res.status(500).json({ 
        error: "關懷助理目前無法取得連線，請稍後再試。系統錯誤回報: " + (error.message || error) 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode with static asset delivery...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Care 2.0 Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
