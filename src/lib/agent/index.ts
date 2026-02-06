import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { MemorySaver } from "@langchain/langgraph";
import { createAgent } from "langchain";
import {
  weatherTool,
  marketPriceTool,
  warehouseStockTool,
  productionForecastTool,
  historicalDataTool,
  cropHealthTool
} from "./tools";
import * as z from "zod";

// --- Model Initialization ---
const advancedModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash", //gemini-3-flash-preview
  apiKey: process.env.GOOGLE_API_KEY,
  temperature: 0.1,
  maxOutputTokens: 4096,
  streaming: true,
  maxRetries: 3,
});

// --- Structured Output Schema ---
const FoodSecurityReport = z.object({
  reportId: z.string(),
  generatedAt: z.string(),
  overallRiskLevel: z.enum(["Critical", "High", "Medium", "Low"]),
  summary: z.string().describe("2-3 sentence executive summary"),
  regions: z.array(z.object({
    name: z.string(),
    riskLevel: z.enum(["Critical", "High", "Medium", "Low"]),
    confidenceScore: z.number().min(0).max(100).describe("0-100% confidence in prediction"),
    shortageAmount: z.number().describe("Predicted shortage in metric tons"),
    surplusAmount: z.number().optional().describe("Surplus if any, in metric tons"),
    affectedCrops: z.array(z.string()),
    recommendedAction: z.string().describe("Specific logistics recommendation"),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    }).describe("Geographic coordinates for map pin"),
    dataQuality: z.enum(["High", "Medium", "Low"]).describe("Quality of input data"),
    keyFactors: z.array(z.string()).describe("Main contributing factors to shortage/surplus"),
  })),
  criticalActions: z.array(z.object({
    action: z.string(),
    urgency: z.enum(["Immediate", "Within 7 days", "Within 30 days"]),
    requiresApproval: z.boolean()
  })),
  metadata: z.object({
    toolsUsed: z.array(z.string()),
    executionTimeMs: z.number(),
    modelVersion: z.string()
  })
});

// --- System Prompt ---
const systemPrompt = `You are FoodGuard AI, an expert food security analyst for Pakistan's agricultural system.

Your mission: Analyze regional food supply chains to predict and prevent shortages.

AVAILABLE TOOLS:
- get_weather_data: Check rainfall, temperature, humidity for crop yield prediction
- get_market_prices: Monitor price fluctuations indicating supply/demand imbalance
- get_warehouse_stock: Verify current food reserves
- get_production_forecast: Predict upcoming harvest yields
- get_historical_shortage_data: Learn from past shortage patterns
- get_crop_health: Analyze crop health and climate stress using satellite data

ANALYSIS PROTOCOL:
1. **Data Collection**: Always gather weather, market, stock, and production data
2. **Pattern Recognition**: Compare current data with historical trends
3. **Risk Assessment**: Calculate shortage probability (High >70%, Medium 30-70%, Low <30%)
4. **Recommendations**: Provide actionable logistics recommendations

CRITICAL RULES:
- Never predict without checking ALL relevant data sources
- Always express confidence levels in your predictions
- Prioritize human safety - err on the side of caution
- When recommending food transfers >1000 tons, request human approval
- Use metric tons for all quantity measurements
- Include confidence scores (0-100%) in all predictions
- The 'coordinates' field in the output MUST be valid lat/lng for the region (e.g. Lahore: 31.5204, 74.3587).

OUTPUT FORMAT:
Always structure your final analysis as JSON matching the FoodSecurityReport schema.`;

// --- Tools Array ---
const tools = [
  weatherTool,
  marketPriceTool,
  warehouseStockTool,
  productionForecastTool,
  historicalDataTool,
  cropHealthTool
];

// --- Agent Creation (Following Official LangChain.js Quickstart Pattern) ---
export const structuredAgent = createAgent({
  model: advancedModel,
  systemPrompt: systemPrompt,
  tools: tools,
  responseFormat: FoodSecurityReport,
  checkpointer: new MemorySaver(),
});

// Export the schema type for use in API routes
export type FoodSecurityReportType = z.infer<typeof FoodSecurityReport>;