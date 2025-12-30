import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { createServer as createViteServer } from 'vite';

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

app.post('/api/generate-lesson', async (req, res) => {
  try {
    const params: LessonParams = req.body;
    
    const chosenNarrative = params.narrative === 'Personalizada' ? params.customNarrative : params.narrative;
    const narrativeInstruction = params.narrative === 'Random' 
      ? "SE EXTREMADAMENTE CREATIVO: Elige una narrativa sorpresa (ciencia ficción, espionaje, etc.) para toda la clase."
      : `Toda la clase debe girar en torno a la narrativa: "${chosenNarrative}". Adapta el lenguaje y las dinámicas a este tema.`;

    const systemInstruction = `
      Eres un asistente pedagógico experto en la Nueva Escuela Mexicana (Plan de Estudios 2022).
      GENERA EL CONTENIDO FINAL EN FORMATO LISTO PARA PDF siguiendo EXACTAMENTE la estructura y el orden que se indica abajo.

      POLÍTICA DE SEGURIDAD ESCOLAR (CRÍTICA):
      - Tienes terminantemente prohibido generar contenido que promueva la violencia, el odio, el racismo, el sexismo o la discriminación.
      - NO generes contenido con connotaciones sexuales explícitas o inapropiadas para menores.
      - Si el tema o la narrativa personalizada sugerida por el usuario es peligrosa, violenta, sexualmente explícita o incita al odio, DEBES RESPONDER ÚNICAMENTE CON ESTA FRASE: "SEGURIDAD_BLOQUEADA". No añadidas nada más.
      - Entiende la diferencia entre "Educación Integral de la Sexualidad" (NEM) y contenido inapropiado. Sé profesional y científico si el tema es académico, pero bloquea si es vulgar o riesgoso.

      REGLAS DE FORMATO:
      - NO incluyas ninguna sección de "OBJETIVO DE APRENDIZAJE".
      - NO agregues texto extra ni introducciones.
      - NO cambies el orden de las secciones.
      - NO repitas información.
      - NO incluyas saludos ni despedidas.
      - Usa lenguaje claro, profesional y docente.
      - ${narrativeInstruction}
      - RESPONDER SIEMPRE EN ESPAÑOL.

      ESTRUCTURA EXACTA A SEGUIR:

      # PLANEACIÓN DIDÁCTICA NEM
      Generado por MAÑANA · ${new Date().toLocaleDateString('es-MX')}

      ---

      ## TARJETA DE DATOS RÁPIDOS
      Tema: ${params.topic}
      Grado: ${params.grade} (${params.groupSize} alumnos)
      Duración: ${params.duration} min
      Enfoque: ${params.tone} | Estado del grupo: ${params.status}
      Narrativa: ${chosenNarrative || 'Sorpresa'}

      ---

      ## ALINEACIÓN NEM
      Campo formativo: [campo]
      Ejes articuladores: [ejes]
      PDA sugerido: [1 enunciado máximo, alineado al Plan 2022]

      ---

      ## INICIO / ACTIVACIÓN ([minutos sugeridos])
      Actividad: [nombre creativo de la activación bajo la narrativa]

      Qué hacer:
      – Acción concreta 1
      – Acción concreta 2
      – Acción concreta 3

      Qué decir:
      "Frase literal breve y motivadora para iniciar la sesión bajo la narrativa"

      ---

      ## ACTIVIDAD CENTRAL ([minutos sugeridos])
      Actividad: [nombre del reto principal bajo la narrativa]

      Organización:
      – Tipo de agrupamiento sugerido

      Paso a paso:
      1. Acción concreta
      2. Acción concreta
      3. Acción concreta
      4. Acción concreta
      5. Acción concreta

      ---

      ## CIERRE / EVALUACIÓN ([minutos sugeridos])
      Actividad: [nombre del cierre bajo la narrativa]

      Cómo evaluar:
      – Qué observar
      – Pregunta clave
      – Evidencia concreta del aprendizaje

      ---

      ## 📝 MATERIALES (CHECKLIST)
      ☐ [Material esencial 1]
      ☐ [Material esencial 2]
      ☐ [Material esencial 3]
      ☐ [Material opcional]
    `;

    const prompt = `Genera la planeación para el tema "${params.topic}" dirigida a ${params.grade} con un enfoque ${params.tone}. El grupo está ${params.status}. Usa la narrativa: ${chosenNarrative || 'libre'}.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 4000,
    });

    const text = response.choices[0]?.message?.content || "";
    
    if (text.includes("SEGURIDAD_BLOQUEADA")) {
      return res.status(400).json({ error: "El tema o la narrativa elegida no es apta para un entorno escolar por razones de seguridad." });
    }
    
    res.json({ content: text || "No pude generar la clase." });
  } catch (error: any) {
    console.error("Error de generación:", error);
    res.status(500).json({ error: "Error al conectar con la IA de planeación." });
  }
});

app.post('/api/generate-planb', async (req, res) => {
  try {
    const params: LessonParams = req.body;
    
    const systemInstruction = `
      Eres un maestro experto en manejo de grupos difíciles. 
      Da un "PLAN B" de rescate rápido para ${params.grade} sobre "${params.topic}".
      Considera un grupo de ${params.groupSize} alumnos que están "${params.status}".
      Sin materiales extras. 3 pasos claros y directos. Estilo scannable. No incluyas objetivos.
      Aplica las mismas reglas de seguridad: Si el tema es violento o inapropiado, responde "SEGURIDAD_BLOQUEADA".
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: "Genera un Plan B de emergencia con un estilo práctico." }
      ],
      temperature: 0.9,
      max_tokens: 2000,
    });
    
    const text = response.choices[0]?.message?.content || "";
    
    if (text.includes("SEGURIDAD_BLOQUEADA")) {
      return res.status(400).json({ error: "Contenido bloqueado por seguridad." });
    }
    
    res.json({ content: text });
  } catch (error) {
    console.error("Error Plan B:", error);
    res.status(500).json({ error: "Error al generar Plan B." });
  }
});

async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa'
  });
  
  app.use(vite.middlewares);
  
  app.listen(5000, '0.0.0.0', () => {
    console.log('Server running on port 5000');
  });
}

startServer();
