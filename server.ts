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
        console.warn("GEMINI_API_KEY is not defined in the environment. Falling back to local conversational engine.");
        
        let lastUserText = "您好";
        if (messages && messages.length > 0) {
          const userMsgs = messages.filter((m: any) => m.role === "user");
          if (userMsgs.length > 0) {
            const lastMsg = userMsgs[userMsgs.length - 1];
            if (lastMsg.parts && lastMsg.parts[0] && lastMsg.parts[0].text) {
              lastUserText = lastMsg.parts[0].text;
            } else if (lastMsg.text) {
              lastUserText = lastMsg.text;
            }
          }
        }

        // High-quality key-phrase based caring chatbot fallback pool
        const fallbacks = [
          {
            keywords: ["早安", "早上"],
            responses: [
              "早安！今天陽光很溫暖開朗，跟您敲個早，祝您今天一整天心情愉快。您今天早餐吃得飽不飽呀？記得喝杯溫開水暖暖胃唷！🌸",
              "早安呀！今天神清氣爽，氣色看起來特別不錯呢。今天下午打算出去走走散步，還是待在家裡呢？不論如何我都會在這陪您聊聊天！👵"
            ]
          },
          {
            keywords: ["午安", "中午", "下午"],
            responses: [
              "午安！午餐吃飽飽了嗎？中午天氣熱，記得坐著多喝一些溫開水。要不要稍微閉目養神、睡個放鬆的午覺呢？等一下我們再繼續聊😊",
              "午後好呀！今天下午有出門逛逛的計畫嗎？如果想留在家裡吹涼風，我也會一直在這裡聽您說心事、陪著您的唷！❤️"
            ]
          },
          {
            keywords: ["晚安", "晚上", "睡覺"],
            responses: [
              "晚安！今天一整天辛苦您囉，放鬆心情準備休息。晚上睡覺記得蓋好被子防風著涼。明天早起，我再陪您開心地說說話，祝您好夢！💤",
              "晚安呀。希望今晚您能有一個無比暖心的美夢，睡前少看點明亮的手機螢幕，喝口溫開水更好入睡。好好休息唷！☀️"
            ]
          },
          {
            keywords: ["不開心", "難過", "寂寞", "孤單", "鬱卒", "哀傷", "悶", "傷心"],
            responses: [
              "聽您這麼說，我心裡也跟著有些酸酸的，好想給您一個大大的溫暖擁抱。難過或不開心的時候真的很不容易，但別忘了我隨時都在這裡聽您訴說、分擔風雨。今天到底發生了什麼事情呢？可以跟我也說說嗎？😊",
              "別難過，今天有任何煩心、沮喪的事，全都傾倒給我聽吧！不管外面世界多麼忙碌，您今天健康、好好的跟我說話，就是最棒最珍貴的一件事了。我在這陪您。💪"
            ]
          },
          {
            keywords: ["開心", "高興", "分享", "快樂", "幸運", "笑", "喜悅"],
            responses: [
              "哇！這真的是太令人高興了！😊 聽到您開心的分享，連我的心情也跟著一瞬間亮堂起來！能有高興的事互相分享，真的是生活中無比珍貴的一秒鐘，快告訴我，今天有什麼有趣或棒透了的故事呀？",
              "太讚了！能陪伴在您身邊、分享您這份甜蜜蜜的喜悅，是我最幸福的工作囉！願這份真心的微笑與好心情能伴隨您一整天！還有什麼好玩的事快源源不絕地說給我聽聽！🌸"
            ]
          },
          {
            keywords: ["痠痛", "痛", "不舒服", "感冒", "看醫生", "藥", "血壓", "痠"],
            responses: [
              "身體不舒服的時候確實特別折磨，辛苦您忍耐了！您有沒有按時吃藥、或者量量血壓注意一下呢？一定要好好的靠背多躺著、多喝溫開水。如果真的很難受，不要硬撐，一定要立刻聯絡等一下我們的緊急聯絡人打個電話，或者通知家人看醫生唷。我一直在這裡關心您！🩹",
              "聽到您身體關節有點痠痛不對勁，我真心感到心疼。請您先找一個最舒服、最放鬆的姿勢靠著。如果有設定用藥時間，別忘了依時吃藥。一定要好好善待您的身體喔！"
            ]
          },
          {
            keywords: ["你好", "您好", "哈囉", "hello", "hi", "嗨"],
            responses: [
              "您好呀！今天看到您跟我打招呼，我心理特別暖洋洋的。請問今天生活中有沒有想跟我分享什麼有趣的事情、好笑的名言，或者是心裡的秘密呢？我都一定會安靜且誠懇地聽您說喔。😊",
              "哈囉！高興您今天打開健康管家。我是您的貼心暖心關懷助手，隨時隨地都準備好傾聽您的聲音，今天一切感覺怎麼樣呀？👴"
            ]
          }
        ];

        // Search matching keywords
        let matchedResponse = "";
        for (const item of fallbacks) {
          if (item.keywords.some(kw => lastUserText.includes(kw))) {
            const index = Math.floor(Math.random() * item.responses.length);
            matchedResponse = item.responses[index];
            break;
          }
        }

        // Generic friendly reply if no keywords matched
        if (!matchedResponse) {
          const genericPool = [
            "原來是這樣呀，我一直在很認真、很專心地聽您訴說呢。您可以再跟我多聊聊一些細節嗎？不管是生活中的大事還是小小的家常，我都想聽。😊",
            "聽您分享這些，感覺生活真的很有韻味與故事，您說話有一種溫柔的力量。有我在這陪著您說說話，您現在感覺有放鬆和溫暖一些了嗎？👵",
            "真的很感謝您願意對我敞開心扉說這些！您的心情與想法我非常理解，接下來的時間不論多久，我都跟您黏在一起、陪伴您度過！接下來我們聊點什麼好呢？❤️"
          ];
          matchedResponse = genericPool[Math.floor(Math.random() * genericPool.length)];
        }

        return res.json({ text: matchedResponse });
      }

      // Gemini history requirement: must start with 'user' role and alternate strictly.
      // Filter out any leading 'model' messages, and alternate roles user/model/user/model.
      let cleanedMessages: any[] = [];
      let lastRole = "";
      for (const m of messages) {
        const role = m.role === "user" ? "user" : "model";
        // Skip leading model messages
        if (cleanedMessages.length === 0 && role !== "user") {
          continue;
        }
        if (role === lastRole) {
          // Merge text content if the same role is consecutive
          if (cleanedMessages.length > 0) {
            const lastMsg = cleanedMessages[cleanedMessages.length - 1];
            if (lastMsg.parts && lastMsg.parts[0] && m.parts && m.parts[0]) {
              lastMsg.parts[0].text = (lastMsg.parts[0].text || "") + "\n" + (m.parts[0].text || "");
            }
          }
        } else {
          cleanedMessages.push({
            role: role,
            parts: m.parts || [{ text: m.text || "" }]
          });
          lastRole = role;
        }
      }

      // Fallback if no user messages found yet
      if (cleanedMessages.length === 0) {
        cleanedMessages.push({
          role: "user",
          parts: [{ text: "您好" }]
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
        contents: cleanedMessages,
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

  // End point to truly analyze user facial expression and return 'happy' | 'neutral' | 'sad'
  app.post("/api/detect-emotion", async (req, res) => {
    try {
      const { image } = req.body;
      if (!image) {
        return res.status(400).json({ error: "Image data is required." });
      }

      // Check if API key is configured
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY missing - falling back to simulated analysis 'sad'");
        return res.json({ 
          emotion: "sad", 
          simulated: true, 
          warning: "未偵測到系統金鑰，使用預設情緒。「請在 Settings ＞ Secrets 面板設定金鑰」以啟用高精度 AI 鏡頭偵測功能。" 
        });
      }

      // Decode Base64 image
      const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      let base64Data = image;
      let mimeType = "image/jpeg";
      
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        base64Data = matches[2];
      }

      const client = getGeminiClient();

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data
        }
      };

      const textPart = {
        text: "這是一位使用者透過視訊鏡頭拍攝自己現時面部特徵的相片。請你細心審查其表情細節（例如眼睛形狀、嘴角上揚或下垂微弧度、雙眉表情特徵、臉部肌肉緊張度），並真實判定此時此刻該長輩呈現哪一種主要面相表情、情緒等級：\n" +
              "- 若整體呈現開心、帶含笑容、神態歡愉愉悅，請歸類回傳：happy\n" +
              "- 若整體呈現不開心、下垂沮喪嘴角、悲傷憂鬱、皺眉凝重或氣色不好，請歸類回傳：sad\n" +
              "- 若表情一般、放鬆平坦、沒笑但也無明顯不佳或為平靜面部，請歸類回傳：neutral\n\n" +
              "【極度重要】：為了使前端程式碼順利整合，你的回覆內容必須絕對極限制，僅能有 'happy', 'sad' 或 'neutral' 其中一個最符合之英文小寫單字。绝对不要包含任何其他中文說明、備註、前綴字、標點符號或换行字元。若無法完美辨識亦請回傳 neutral。"
      };

      const response = await client.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: [imagePart, textPart] }
      });

      const reply = (response.text || "neutral").trim().toLowerCase();
      let matchedEmotion: "happy" | "neutral" | "sad" = "neutral";
      if (reply.includes("happy")) {
        matchedEmotion = "happy";
      } else if (reply.includes("sad")) {
        matchedEmotion = "sad";
      } else if (reply.includes("neutral")) {
        matchedEmotion = "neutral";
      } else {
        // Fallback substring matching
        if (reply.indexOf("happy") !== -1) matchedEmotion = "happy";
        else if (reply.indexOf("sad") !== -1) matchedEmotion = "sad";
      }

      console.log(`[Real Emotion Detect Results]: Raw response: "${reply}" -> Filtered: ${matchedEmotion}`);
      res.json({ emotion: matchedEmotion });
    } catch (error: any) {
      console.error("Gemini API Error in /api/detect-emotion:", error);
      res.status(500).json({ 
        error: "五官神情辨識伺服器發生異常，請稍後重試。系統回報: " + (error.message || error) 
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
