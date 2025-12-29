
export type Grade = 
  | 'Preescolar' 
  | '1° Primaria' | '2° Primaria' | '3° Primaria' 
  | '4° Primaria' | '5° Primaria' | '6° Primaria' 
  | '1° Secundaria' | '2° Secundaria' | '3° Secundaria';

export type Duration = '30' | '45' | '50' | '60' | '90';

export type GroupStatus = 'Activo' | 'Cansado' | 'Disperso' | 'Mixto' | 'Desmotivado' | 'Competitivo' | 'Ruidoso' | 'Creativo';

export type LessonTone = 'Divertido' | 'Estricto' | 'Gamificado' | 'Tradicional' | 'Socioemocional' | 'Investigación' | 'Experimental' | 'Colaborativo';

export type GroupSize = '1-15' | '16-30' | '31-45' | '45+';

export type NarrativeType = 'Random' | 'Misión Social' | 'Expedición' | 'Viaje Histórico' | 'Gran Misterio' | 'Eco-Aventura' | 'Taller de Inventores' | 'Olimpiada' | 'Personalizada';

export interface LessonParams {
  grade: Grade;
  topic: string;
  duration: Duration;
  status: GroupStatus;
  tone: LessonTone;
  groupSize: GroupSize;
  narrative: NarrativeType;
  customNarrative?: string;
}

export interface SavedLesson extends LessonParams {
  id: string;
  content: string;
  createdAt: number;
}

export const SUGGESTED_TOPICS = [
  "Fracciones y decimales",
  "Comprensión lectora",
  "Alimentación saludable",
  "El ciclo del agua",
  "Tablas de multiplicar",
  "La Revolución Mexicana",
  "Sumas y restas con llevada",
  "Ecosistemas y biodiversidad",
  "Figuras y cuerpos geométricos",
  "Cuidado del medio ambiente",
  "Ortografía y gramática",
  "Independencia de México",
  "El Sistema Solar",
  "Derechos humanos",
  "Poesía y rima",
  "Leyes de Newton",
  "Álgebra básica",
  "Civilizaciones mesoamericanas",
  "Resolución de conflictos",
  "Cuerpo humano y salud"
];
