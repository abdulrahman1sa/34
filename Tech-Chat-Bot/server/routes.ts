import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { handleChatRequest } from "./openai";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Chat API Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, context, apiKey } = req.body;
      
      // Basic validation
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Call OpenAI Logic
      const response = await handleChatRequest(message, context || {}, apiKey);
      
      res.json(response);
    } catch (error: any) {
      console.error("Chat Error:", error);
      
      // Fallback or Error
      if (error.message.includes("API Key")) {
        return res.status(401).json({ error: "MISSING_API_KEY", message: "يحتاج مفتاح API لتفعيل الذكاء" });
      }
      
      res.status(500).json({ error: "Internal Server Error", message: "صار خطأ بسيط، حاول مرة ثانية" });
    }
  });

  return httpServer;
}
