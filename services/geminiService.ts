import { GoogleGenAI, Type } from "@google/genai";
import { Asset, GeminiAnalysisResponse } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const getMarketAnalysis = async (assets: Asset[]): Promise<GeminiAnalysisResponse> => {
  if (!apiKey) {
    throw new Error("API Key missing");
  }

  // Prepare a prompt context from current asset data
  const marketContext = assets.map(a => 
    `${a.nameFa} (${a.nameEn}): ${a.priceToman} Toman, Change: ${a.change24h}%`
  ).join('\n');

  const prompt = `
    Analyze the following market data for the Iranian currency and gold market.
    Provide a brief summary, the general market sentiment (BULLISH, BEARISH, or NEUTRAL), and a short piece of advice for a regular person looking to preserve the value of their money.
    
    Current Data:
    ${marketContext}
    
    Respond in JSON format.
    The 'summary' and 'advice' must be in Persian (Farsi).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Market summary in Persian" },
            trend: { type: Type.STRING, enum: ["BULLISH", "BEARISH", "NEUTRAL"] },
            advice: { type: Type.STRING, description: "Financial advice in Persian" }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return result as GeminiAnalysisResponse;

  } catch (error) {
    console.error("Gemini analysis failed", error);
    return {
      summary: "خطا در دریافت تحلیل هوشمند. لطفاً دقایقی دیگر تلاش کنید.",
      trend: "NEUTRAL",
      advice: "در شرایط فعلی بازار محتاط باشید."
    };
  }
};