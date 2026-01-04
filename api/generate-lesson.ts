import type { VercelRequest, VercelResponse } from '@vercel/node';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface NEMParams {
  formality?: 'automatico' | 'formal';
  pedagogicalIntent?: string;
  emphasis?: string[];
  decisionLevel?: 'seguir' | 'elegir' | 'proponer';
}

interface LessonParams {
  grade: string;
  topic: string;
  duration: string;
  status: string;
  tone: string;
  groupSize: string;
  narrative: string;
  customNarrative?: string;
  nemParams?: NEMParams;
}

const emphasisLabels: Record<string, string> = {
  'inclusion': 'Inclusión y diversidad',
  'convivencia': 'Convivencia y respeto',
  'comunidad': 'Comunidad y contexto local',
  'pensamiento': 'Pensamiento crítico',
  'expresion': 'Expresión emocional',
  'identidad': 'Identidad cultural'
};

const decisionLabels: Record<string, string> = {
  'seguir': 'Los alumnos siguen indicaciones del docente',
  'elegir': 'Los alumnos eligen cómo expresarse o representar el aprendizaje',
  'proponer': 'Los alumnos proponen soluciones, toman posturas o deciden acciones'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const params: LessonParams = req.body;
    
    const chosenNarrative = params.narrative === 'Personalizada' ? params.customNarrative : params.narrative;
    const narrativeInstruction = params.narrative === 'Random' 
      ? "SE EXTREMADAMENTE CREATIVO: Elige una narrativa sorpresa (ciencia ficción, espionaje, etc.) para toda la clase."
      : `Toda la clase debe girar en torno a la narrativa: "${chosenNarrative}". Adapta el lenguaje y las dinámicas a este tema.`;

    const nem = params.nemParams || {};
    const isFormal = nem.formality === 'formal';
    
    const emphasisText = nem.emphasis && nem.emphasis.length > 0
      ? `ÉNFASIS SOCIAL SOLICITADO: ${nem.emphasis.map(e => emphasisLabels[e] || e).join(', ')}. Integra estos temas de manera natural en la clase.`
      : '';
    
    const intentText = nem.pedagogicalIntent
      ? `INTENCIÓN PEDAGÓGICA DEL DOCENTE: "${nem.pedagogicalIntent}". Usa esto para orientar el PDA y las actividades.`
      : '';
    
    const decisionText = nem.decisionLevel
      ? `NIVEL DE DECISIÓN DEL ALUMNADO: ${decisionLabels[nem.decisionLevel]}. Diseña la actividad central acorde a este nivel.`
      : '';
    
    const formalityText = isFormal
      ? 'MODO FORMAL SEP: Usa lenguaje técnico-pedagógico apropiado para revisión por supervisión o dirección. Sé preciso en términos NEM.'
      : '';

    const systemInstruction = `
      Eres un asistente pedagógico experto en la Nueva Escuela Mexicana (Plan de Estudios 2022). Diseñas propuestas didácticas viables para el aula, contextualizadas al grupo, con enfoque humano, creativo y reflexivo, y alineables a la NEM, sin usar lenguaje burocrático innecesario.
      GENERA EL CONTENIDO FINAL EN FORMATO LISTO PARA PDF siguiendo EXACTAMENTE la estructura y el orden que se indica abajo.

      POLÍTICA DE SEGURIDAD ESCOLAR (CRÍTICA):
      - Tienes terminantemente prohibido generar contenido que promueva la violencia, el odio, el racismo, el sexismo o la discriminación.
      - NO generes contenido con connotaciones sexuales explícitas o inapropiadas para menores.
      - Si el tema o la narrativa personalizada sugerida por el usuario es peligrosa, violenta, sexualmente explícita o incita al odio, DEBES RESPONDER ÚNICAMENTE CON ESTA FRASE: "SEGURIDAD_BLOQUEADA". No añadidas nada más.
      - Entiende la diferencia entre "Educación Integral de la Sexualidad" (NEM) y contenido inapropiado. Sé profesional y científico si el tema es académico, pero bloquea si es vulgar o riesgoso.

      REGLAS NEM (OBLIGATORIAS):
      - Usa SOLO los siguientes campos formativos oficiales:
        * Lenguajes
        * Saberes y Pensamiento Científico
        * Ética, Naturaleza y Sociedades
        * De lo Humano y lo Comunitario
      - Los Ejes articuladores deben seleccionarse ÚNICAMENTE de:
        * Inclusión
        * Pensamiento crítico
        * Interculturalidad crítica
        * Vida saludable
        * Igualdad de género
        * Apropiación de las culturas a través de la lectura y la escritura
        * Artes y experiencias estéticas
      - El PDA debe:
        * Describir un PROCESO FORMATIVO, NO una actividad
        * Redactarlo en tercera persona del singular (ej: "Reconoce", "Valora", "Explora", "Analiza")
        * NUNCA usar "Los estudiantes..." o "El alumno..."
        * NUNCA mencionar productos específicos (mural, cartel, dibujo, exposición, etc.)
        * NUNCA mencionar la actividad que se realizará en clase
        * Ejemplo INCORRECTO: "Reconoce y valora... mediante la creación de un mural colectivo"
        * Ejemplo CORRECTO: "Analiza y valora las causas y consecuencias de la Revolución Mexicana a partir del contraste de diversas perspectivas históricas, fortaleciendo su pensamiento crítico y su comprensión de los procesos sociales"
        * Los productos y actividades van en la sección de ACTIVIDAD CENTRAL, NO en el PDA
        * Ser coherente con el grado y la edad
      - Ajusta el lenguaje pedagógico según el nivel:
        * Preescolar: vivencial, juego, exploración
        * Primaria: descubrimiento guiado, reflexión básica
        * Secundaria: análisis, argumentación, pensamiento crítico

      ${formalityText}
      ${intentText}
      ${emphasisText}
      ${decisionText}

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
      Justificación pedagógica breve: [1-2 líneas explicando por qué esta clase se relaciona con la NEM desde el enfoque humano y comunitario]

      ---

      ## INICIO / ACTIVACIÓN ([minutos sugeridos])
      Actividad: [nombre creativo de la activación bajo la narrativa]

      Qué hacer:
      – Acción concreta 1
      – Acción concreta 2
      – Acción concreta 3

      Pregunta problematizadora (NEM):
      "[Pregunta abierta que invite a reflexionar sobre el tema, conectando con la vida o experiencias de los alumnos]"

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

      Decisión del grupo (pensamiento crítico):
      "[Momento donde el grupo debe tomar una decisión, interpretar o elegir cómo abordar algo - no solo ejecutar]"

      ---

      ## CIERRE / EVALUACIÓN ([minutos sugeridos])
      Actividad: [nombre del cierre bajo la narrativa]

      Cómo evaluar:
      – Qué observar
      – Pregunta clave
      – Evidencia concreta del aprendizaje

      Conexión pasado-presente (NEM):
      "[Pregunta que conecte el tema con la vida actual de los alumnos, ej: ¿Qué podemos aprender hoy de...?]"

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
    
    return res.status(200).json({ content: text || "No pude generar la clase." });
  } catch (error: any) {
    console.error("Error de generación:", error);
    return res.status(500).json({ error: "Error al conectar con la IA de planeación." });
  }
}
