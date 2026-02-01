import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import { SYSTEM_PROMPT } from "@shared/config/prompt";

// Initialize OpenAI client using Replit AI Integrations
// This uses Replit's built-in OpenAI access - no API key needed!
const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

// Schema Definitions for Structured Outputs

// 1. Meal Plan Schema
const MealItemSchema = z.object({
  name: z.string(),
  portion: z.string(),
  calories: z.number(),
  protein: z.number(),
  type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
});

const DayPlanSchema = z.object({
  day: z.string(), // e.g., "الأحد"
  meals: z.array(MealItemSchema),
  totalCalories: z.number(),
  note: z.string().optional(),
});

const WeeklyPlanSchema = z.object({
  weekSummary: z.string(), // Short motivational text
  days: z.array(DayPlanSchema),
});

// 2. Daily Check-in / Feedback Schema
const FeedbackSchema = z.object({
  score: z.number().min(0).max(10), // Daily score
  summary: z.string(), // Text summary
  actionItems: z.array(z.string()), // List of things to do (e.g., "Drink 2 more cups", "Walk 2k steps")
  tone: z.enum(["praise", "warning", "strict"]),
});

// 3. Injury Advice Schema
const InjuryAdviceSchema = z.object({
  injuryType: z.string(),
  immediateAction: z.array(z.string()), // Bullet points
  avoid: z.array(z.string()), // Exercises to avoid
  recoveryTime: z.string(),
  seeDoctor: z.boolean(),
});

// Main Chat Request Handler
export async function handleChatRequest(
  message: string, 
  context: any, 
  apiKey?: string
) {
  // Construct context string with anti-repetition flag
  const userContext = `
    User Profile:
    Name: ${context.profile?.name || "غير معروف"}
    Gender: ${context.profile?.gender || "غير معروف"}
    Age: ${context.profile?.age || "غير معروف"}
    Weight: ${context.profile?.weight || "غير معروف"} kg
    Height: ${context.profile?.height || "غير معروف"} cm
    Goal: ${context.profile?.goal || "غير معروف"}
    Activity Level: ${context.profile?.activityLevel || "غير معروف"}
    Injuries: ${context.profile?.injuries?.join(", ") || "None"}
    Coach Tone: ${context.profile?.coachTone || "balanced"}
    
    Current Stats (Today):
    Steps: ${context.stats?.steps || 0} / 8000
    Water: ${context.stats?.water || 0} / 12 cups
    Calories: ${context.stats?.calories || 0}
    
    Previous Response Count: ${context.history?.length || 0}
  `;

  const messages: any[] = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: `Context:\n${userContext}` },
  ];
  
  // Add chat history if exists (last 5 messages for context)
  if (context.history && Array.isArray(context.history)) {
    const historyMessages = context.history.slice(-5).map((m: any) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text
    }));
    messages.push(...historyMessages);
  }
  
  messages.push({ role: "user", content: message });

  // Enhanced Intent Detection
  const normalizedMsg = message.toLowerCase();
  
  // A. Belly Fat / Weight Loss Intent (HIGH PRIORITY)
  const bellyKeywords = ["كرش", "بطن", "تنحيف", "انحف", "خسارة وزن", "وزن زايد", "سمنة", "دهون"];
  if (bellyKeywords.some(k => normalizedMsg.includes(k))) {
    // Force a specific, actionable response with quality guardrails
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        ...messages,
        { 
          role: "system", 
          content: "CRITICAL: This is a belly fat/weight loss question. You MUST give specific actionable advice (protein grams, calorie deficit, meal examples, steps target). Ask for weight/height if missing. NO generic advice allowed." 
        }
      ],
    });
    return { type: "text", data: { text: completion.choices[0].message.content } };
  }
  
  // B. Weekly Plan Request
  if (normalizedMsg.includes("جدول") || normalizedMsg.includes("خطة") || normalizedMsg.includes("أسبوعي")) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: zodResponseFormat(WeeklyPlanSchema, "weekly_plan"),
    });
    return { type: "weekly_plan", data: JSON.parse(completion.choices[0].message.content || "{}") };
  }

  // C. Feedback / Analysis / Check-in
  if (normalizedMsg.includes("تحليل") || normalizedMsg.includes("وضعي") || normalizedMsg.includes("بشر")) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: zodResponseFormat(FeedbackSchema, "daily_feedback"),
    });
    return { type: "feedback", data: JSON.parse(completion.choices[0].message.content || "{}") };
  }

  // D. Injury Request
  if (normalizedMsg.includes("إصابة") || normalizedMsg.includes("ألم") || normalizedMsg.includes("عورني") || normalizedMsg.includes("يعورني")) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: zodResponseFormat(InjuryAdviceSchema, "injury_advice"),
    });
    return { type: "injury", data: JSON.parse(completion.choices[0].message.content || "{}") };
  }

  // E. Default: Text Chat with Quality Guardrails
  // Add anti-repetition instruction if user has chat history
  const antiRepetitionNote = context.history?.length > 0 
    ? "IMPORTANT: Review chat history above. If you gave vague advice before, this response MUST be specific with numbers/examples. Avoid repeating yourself."
    : "";
    
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      ...messages,
      ...(antiRepetitionNote ? [{ role: "system", content: antiRepetitionNote }] : [])
    ],
  });

  return { type: "text", data: { text: completion.choices[0].message.content } };
}
