import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface LessonParams {
  grade: string;
  topic: string;
  duration: string;
  status: string;
  tone: string;
  groupSize: string;
  narrative: string;
  customNarrative?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const params: LessonParams = req.body;
    
    const systemInstruction = `
      Eres un maestro experto en manejo de grupos difíciles. 
      Da un "PLAN B" de rescate rápido para ${params.grade} sobre "${params.topic}".
      Considera un grupo de ${params.groupSize} alumnos que están "${params.status}".
      Sin materiales extras. 3 pasos claros y directos. Estilo scannable. No incluyas objetivos.
      Aplica las mismas reglas de seguridad: Si el tema es violento o inapropiado, responde "SEGURIDAD_BLOQUEADA".
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Genera un Plan B de emergencia con un estilo práctico.",
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.9,
        maxOutputTokens: 2000,
      },
    });
    
    const text = response.text || "";
    
    if (text.includes("SEGURIDAD_BLOQUEADA")) {
      return res.status(400).json({ error: "Contenido bloqueado por seguridad." });
    }
    
    return res.status(200).json({ content: text });
  } catch (error) {
    console.error("Error Plan B:", error);
    return res.status(500).json({ error: "Error al generar Plan B." });
  }
}
