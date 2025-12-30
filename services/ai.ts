
import { LessonParams } from "../types";

const API_URL = '';

export const generateLessonContent = async (params: LessonParams): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/generate-lesson`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error de generación");
    }

    const data = await response.json();
    return data.content;
  } catch (error: any) {
    console.error("Error de generación:", error);
    throw new Error(error.message || "Error al conectar con la IA de planeación.");
  }
};

export const generatePlanBContent = async (params: LessonParams): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/api/generate-planb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error de generación");
    }

    const data = await response.json();
    return data.content;
  } catch (error: any) {
    throw new Error(error.message || "Error al generar Plan B.");
  }
};
