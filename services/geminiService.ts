import { GoogleGenAI } from "@google/genai";
import { HistoryItem } from "../types";
import { formatDurationVerbose } from "../utils/timeUtils";

export const generateDailySummary = async (history: HistoryItem[]): Promise<string> => {
  // @ts-ignore
  const apiKey = process.env.API_KEY; 

  if (!apiKey) {
    return "API Key not configured (Check Vercel Environment Variables).";
  }

  if (history.length === 0) {
    return "Nenhuma atividade concluída para analisar.";
  }

  // Format data for the prompt
  const tasksText = history.map(item => 
    `- Atividade: "${item.description}", Duração: ${formatDurationVerbose(item.totalDuration)}`
  ).join('\n');

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analise o seguinte registro de atividades (timesheet) de um usuário:
      
      ${tasksText}
      
      Por favor, forneça um resumo curto, motivador e produtivo em Português (Brasil).
      1. Agrupe tarefas similares se houver e some seus tempos.
      2. Destaque a principal área de foco.
      3. Use formatação Markdown (negrito para destaques).
      4. Seja conciso (máximo 3 parágrafos).
      
      Responda em tom profissional mas amigável.`,
      config: {
        systemInstruction: "You are a helpful productivity assistant.",
        temperature: 0.7,
      }
    });

    return response.text || "Não foi possível gerar o resumo.";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Ocorreu um erro ao conectar com a IA para gerar o resumo.";
  }
};
