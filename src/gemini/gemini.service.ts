import { Injectable } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    let generationConfig = undefined;
    try {
      generationConfig = process.env.GENERATION_CONFIG ? JSON.parse(process.env.GENERATION_CONFIG) : undefined;
    } catch (error) {
      console.error("Failed to parse GENERATION_CONFIG from .env:", error);
    }

    this.model = this.genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
      generationConfig: generationConfig,
      // safetySettings handling might need adjustment if json string is complex, but try parsing
    });
  }

  async generateRoadmap(topic: string, difficulty: string) {
    const prompt = `
      Generate a learning roadmap for "${topic}" at "${difficulty}" level.
      Return a STRICT JSON object (no markdown formatting, no code blocks, no key assignment like "type":="val").
      The structure must be exactly:
      {
        "nodes": [
          {
            "id": "1",
            "label": "Step Name",
            "description": "Short description",
            "type": "milestone", // or "resource"
            "references": [{"title": "Link Title", "url": "url"}]
          }
        ],
        "edges": [
          {
            "id": "e1-2",
            "source": "1",
            "target": "2"
          }
        ]
      }
      Ensure the roadmap is comprehensive.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text();
      console.log("Gemini Raw Response:", text); // Debug log

      // Cleanup markdown if present
      text = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
      // specific cleanup for leading/trailing non-json chars if model is chatty
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1) {
        text = text.substring(firstBrace, lastBrace + 1);
      }

      return JSON.parse(text);
    } catch (error) {
      console.error("Gemini Failure Details:", error);
      if (error instanceof SyntaxError) {
        console.error("JSON Parse Error. Text was:", error.message);
      }
      throw new Error("Failed to generate roadmap: " + (error.message || error));
    }
  }
}
