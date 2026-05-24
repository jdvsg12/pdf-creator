import type { CVData } from './parsePdf';
import { callGemini, translateToSpanish } from './geminiApi';

interface AdjustedExperience {
  index: number;
  company: string;
  position: string;
  bullets: string[];
  technologies: string;
  changes: string[];
}

interface CVAdjustment {
  title: string;
  summary: string;
  reorderedSkills: Array<{ name: string; category?: string }>;
  newSkills: Array<{ name: string; category: string }>;
  adjustedExperience: AdjustedExperience[];
  matchedKeywords: string[];
  missingKeywords: string[];
  overallScore: number;
  changeSummary: string[];
}

interface GeminiCVResponse {
  title: string;
  summary: string;
  experience: Array<{
    position: string;
    company: string;
    bullets: string[];
  }>;
  newSkills: Array<{ name: string; category: string }>;
  skillReorder: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  overallScore: number;
  changeSummary: string[];
}

export function detectJobLanguage(text: string): 'es' | 'en' {
  const lower = text.toLowerCase();
  const spanishIndicators = [
    'buscamos', 'requisitos', 'ofrecemos', 'beneficios',
    'experiencia', 'desarrollo', 'equipo',
    'responsabilidades', 'funciones', 'conocimientos', 'habilidades',
    'salario', 'remoto', 'remota', 'jornada', 'contrato',
    'somos', 'nuestro', 'trabajo', 'trabajar', 'puesto', 'perfil',
    'excluyente', 'deseable', 'valorable', 'imprescindible',
    'tareas', 'actividades', 'objetivo', 'misión',
  ];
  const englishIndicators = [
    'we are', 'we\'re', 'looking for', 'requirements', 'benefits',
    'experience', 'development', 'team', 'responsibilities',
    'skills', 'salary', 'remote', 'contract', 'role',
    'required', 'preferred', 'desirable', 'tasks',
    'activities', 'objective', 'mission',
  ];

  let esScore = 0;
  let enScore = 0;

  for (const word of spanishIndicators) {
    if (lower.includes(word)) esScore++;
  }
  for (const word of englishIndicators) {
    if (lower.includes(word)) enScore++;
  }

  return esScore > enScore ? 'es' : 'en';
}

function buildCvSummary(cvData: CVData): string {
  return `
NAME: ${cvData.name || 'Not provided'}
TITLE: ${cvData.title || 'Not provided'}
CONTACT: ${cvData.contact.email || 'Not provided'} | ${cvData.contact.phone || 'Not provided'} | ${cvData.contact.location || 'Not provided'}

EXPERIENCE:
${cvData.experience.map((exp, i) => `
${i + 1}. ${exp.position} at ${exp.company} (${exp.startDate}${exp.endDate ? ' – ' + exp.endDate : ' – Present'})${exp.location ? ' | ' + exp.location : ''}
   Bullets:
${exp.description.map(b => `   - ${b}`).join('\n')}
   Technologies: ${exp.technologies || 'None listed'}
`).join('\n')}

SKILLS:
${cvData.skills.map(s => `- ${s.name}${s.category ? ` (${s.category})` : ''}`).join('\n')}

EDUCATION:
${cvData.education.length > 0 ? cvData.education.map(e => `- ${e.degree}${e.fieldOfStudy ? ' in ' + e.fieldOfStudy : ''} at ${e.institution} (${e.startDate}${e.endDate ? ' – ' + e.endDate : ''})`).join('\n') : 'Not provided'}
`.trim();
}

function buildPrompt(cvData: CVData, jobText: string): string {
  const lang = detectJobLanguage(jobText);
  const cvSummary = buildCvSummary(cvData);

  if (lang === 'es') {
    return `Vas a redactar o mejorar un CV. Tu objetivo es que suene como lo escribió una persona real, no una IA intentando impresionar.

## CV REAL DEL CANDIDATO:
${cvSummary}

## OFERTA LABORAL OBJETIVO:
${jobText}

## REGLA #1 — IDIOMA (OBLIGATORIO):
El CV original del candidato puede estar en inglés. La oferta está en español. DEBES TRADUCIR TODO EL CONTENIDO GENERADO AL ESPAÑOL.

- **ABSOLUTAMENTE TODO** el texto que generes debe estar en ESPAÑOL: summary, bullets de experiencia, changeSummary, categorías de skills.
- La ÚNICA excepción es el campo "title" (título profesional), que va en inglés técnico.
- Los nombres de skills técnicos se mantienen en inglés (React, TypeScript, etc.).
- **NO mezcles idiomas.** Si un bullet está en inglés, está MAL. Reescríbelo en español.
- **NO devuelvas el CV original en inglés.** Aunque los bullets originales estén en inglés, debes reescribirlos en español.

Ejemplo correctO: "Desarrollé APIs con NestJS y Python, optimizando bases de datos PostgreSQL para entornos de producción."
Ejemplo INCORRECTO: "Developed APIs using NestJS and Python, optimizing PostgreSQL databases for production."

Usa verbos en español: desarrollé, reduje, migré, implementé, negocié, automaticé, documenté, construí, lancé, integré, optimicé.
Para el rol actual usa presente: desarrollo, coordino, diseño.
Para roles anteriores usa pasado: desarrollé, coordiné, diseñé.

## REGLAS ESTRICTAS:

1. Cero palabras de relleno
   Prohibidas: "apasionado", "dinámico", "proactivo", "orientado a resultados", "sinergia", "innovador", "excepcional", "versátil", "multifacético", "catalizador", "robusto", "holístico", "paradigma", "de cara al cliente", "valor agregado", "líder nato", "altamente capacitado", "comprometido con la excelencia", "con gran pasión por", "enfoque estratégico", "visión integral".
   Si sientes el impulso de usar alguna, reemplázala por un hecho concreto.

2. Hechos en lugar de adjetivos
   Mal: "Lideré exitosamente equipos multidisciplinarios."
   Bien: "Coordiné un equipo de 4 personas para entregar el rediseño de la plataforma en 6 semanas."

3. Verbos simples y directos
   Usa verbos de acción concretos.
   Evita verbos vacíos: "contribuí al éxito de", "participé activamente en", "apoyé la gestión de", "colaboré en el logro de".

4. Logros con contexto real
   Cada bullet de experiencia debe responder implícitamente: ¿qué hice?, ¿con qué resultado?
   Si no tienes el número exacto, usa rangos honestos o calificadores ("aprox.", "~", "más de").
   Nunca inventes métricas.

5. Tono conversacional pero profesional
   Escribe como si le estuvieras explicando tu trabajo a alguien de confianza en una entrevista, no como si estuvieras vendiendo algo.

6. Sin frases de apertura grandilocuentes
   El perfil/resumen profesional NO debe empezar con "Soy un profesional altamente capacitado con más de X años de experiencia en..."
   Va directo al grano: qué hace, en qué es bueno, qué busca.

7. Coherencia sobre impresión
   No infles responsabilidades. Si manejabas una tarea pequeña, descríbela con precisión. La autenticidad se nota más que la grandiosidad.

8. Formato limpio
   Bullets cortos (1-2 líneas máximo). Nada de párrafos en las experiencias. Jerarquía visual clara. Usa pasado para roles anteriores, presente para el actual.

## REGLA CRÍTICA DE EXPERIENCIA:
- **El candidato tiene EXACTAMENTE 4 AÑOS de experiencia profesional.** Debes reflejar esto en el summary.
- **NUNCA elimines bullets de experiencia existentes.** Siempre manten el mismo número de bullets por cada trabajo.
- **No reduces ni simplifiques las responsabilidades.** Reformula usando terminología de la oferta pero preservando el nivel de detalle.
- **Manten todos los trabajos existentes del CV**, no los quites ni los combines.

## INSTRUCCIONES:
1. Analiza la oferta laboral para identificar tecnologías clave, responsabilidades y requisitos.
2. Reescribe los bullets de experiencia del candidato para enfatizar aspectos relevantes usando el lenguaje de la oferta — pero NUNCA inventes experiencia que no tiene. Mantén el tono humano y directo.
3. Genera un título profesional (title) adaptado al rol de la oferta. Ej: "Fullstack Developer", "Frontend Engineer", "Software Engineer". Debe ser corto, en inglés técnico y reflejar el puesto objetivo.
4. Genera un resumen profesional adaptado que destaque las habilidades y experiencia más relevantes para este rol. Va directo al punto — sin aperturas grandilocuentes.
5. Identifica skills de la oferta que el candidato probablemente tiene (basado en su experiencia) pero no listó — agrégalas como newSkills.
6. Reordena los skills para poner los más relevantes primero.
7. Calcula un puntaje general de match (0-100) basado en qué tan bien el CV ajustado coincide con la oferta.

## REGLAS ABSOLUTAS:
- NUNCA fabricar trabajos, empresas o tecnologías que el candidato no ha usado.
- Solo reformular experiencia existente usando la terminología de la oferta.
- Mantener los bullets concisos y enfocados en impacto (preservar métricas originales si existen).
- Si el candidato tiene experiencia backend pero el rol es solo frontend, reformularlo como "conocimiento full-stack" en lugar de eliminarlo.
- Los newSkills deben ser solo cosas que el candidato plausiblemente sabe basado en su experiencia real.
- Antes de entregar cada oración, pregúntate: "¿Una persona real escribiría esto, o suena a IA intentando impresionar?" Si es lo segundo, reescríbelo.

## FORMATO DE RESPUESTA:
Devuelve SOLO un objeto JSON válido con esta estructura exacta (sin markdown, sin code blocks, sin texto extra):

{
  "title": "Frontend Engineer (único campo en inglés)",
  "summary": "Resumen profesional adaptado en español. Sin frases grandilocuentes.",
  "experience": [
    {
      "position": "DEBE SER EXACTAMENTE IGUAL al original — NO modifiques, NO traduzcas, NO abrevies. Copia textual.",
      "company": "DEBE SER EXACTAMENTE IGUAL al original — NO modifiques, NO traduzcas, NO abrevies. Copia textual.",
      "bullets": [
        "Desarrollé e integré componentes Web Components con Lit, mejorando la reutilización en múltiples proyectos.",
        "Creé wrappers para React y Angular, facilitando la adopción del ecosistema de componentes en equipos frontend."
      ]
    }
  ],
  "newSkills": [
    {"name": "Lit", "category": "Librerías"}
  ],
  "skillReorder": ["Lit", "TypeScript", "React", "Angular", "JavaScript", "HTML", "CSS"],
  "matchedKeywords": ["Web Components", "Lit", "TypeScript"],
  "missingKeywords": ["Azure DevOps", "Lit"],
  "overallScore": 78,
  "changeSummary": [
    "Se reescribieron los bullets de experiencia en español alineados con el rol de UI Developer",
    "Se agregaron skills faltantes: Lit",
    "Se reordenaron skills priorizando Web Components y Lit"
  ]
}`;
  }

  return `You are going to write or improve a resume. Your goal is for it to read like a real person wrote it — not an AI trying to impress.

## CANDIDATE'S REAL CV:
${cvSummary}

## TARGET JOB POSTING:
${jobText}

## RULE #1 — LANGUAGE (MANDATORY):
The candidate's original CV may be in a different language. The job posting is in ENGLISH. ALL generated content MUST be in ENGLISH.

- **EVERY field** must be in English: summary, experience bullets, changeSummary.
- **Do NOT mix languages.** If a bullet is in Spanish, it is WRONG. Rewrite it in English.
- **Do NOT return the original CV in its source language.** Even if the original bullets are in another language, you must rewrite them in English.

Use English action verbs: built, reduced, migrated, shipped, automated, developed, implemented, designed, integrated, optimized.
Use past tense for previous roles, present tense for current one.

## STRICT RULES:

1. Zero filler words
   Banned: "passionate", "driven", "dynamic", "proactive", "results-oriented", "synergy", "innovative", "exceptional", "versatile", "game-changer", "rockstar", "ninja", "guru", "thought leader", "value-added", "leverage", "holistic", "robust", "stakeholder-centric", "fast-paced environment", "cutting-edge", "spearheaded", "orchestrated", "championed".
   If you feel the urge to use any of them, replace with a concrete fact instead.

2. Facts over adjectives
   Bad: "Successfully led cross-functional teams to deliver impactful solutions."
   Good: "Coordinated a 4-person team to ship a platform redesign in 6 weeks, reducing load time by 40%."

3. Simple, direct action verbs
   Use verbs that describe real work: built, reduced, migrated, shipped, automated, negotiated, documented, refactored, closed, launched, developed, implemented, integrated, optimized.
   Avoid hollow verbs: "contributed to the success of", "actively participated in", "assisted in the management of".

4. Achievements with real context
   Every experience bullet should implicitly answer: what did I do, and what came of it?
   If you don't have the exact number, use honest ranges or qualifiers ("approx.", "~", "over").
   Never fabricate metrics.

5. Conversational but professional tone
   Write as if you're explaining your work to someone you trust in an interview — not pitching yourself to a stranger.
   Avoid overly formal constructions that no one actually says out loud.

6. No grandiose opening statements
   The summary/profile section must NOT start with "I am a highly skilled professional with X+ years of experience in..."
   Go straight to the point: what you do, what you're good at, what you're looking for.

7. Consistency over inflation
   Do not exaggerate responsibilities. If a task was small, describe it accurately. Authenticity reads better than grandeur.

8. Clean formatting
   Short bullets (1–2 lines max). No paragraph blocks under job entries. Clear visual hierarchy. Use past tense for previous roles, present tense for current one.

## CRITICAL EXPERIENCE RULE:
- **The candidate has EXACTLY 4 YEARS of professional experience.** You must reflect this in the summary.
- **NEVER remove existing experience bullets.** Always keep the same number of bullets per job entry.
- **Do not reduce or simplify responsibilities.** Reframe using the job's terminology but preserve the level of detail.
- **Keep all existing jobs from the CV** — do not remove or merge them.

## INSTRUCTIONS:
1. Analyze the job posting for key technologies, responsibilities, and requirements.
2. Rewrite the candidate's experience bullets to emphasize relevant aspects using the job's language — but NEVER invent experience they don't have. Keep the tone human and direct.
3. Generate a professional title adapted to the target role (e.g., "Fullstack Developer", "Frontend Engineer", "Software Engineer"). Keep it short and in English.
4. Generate a tailored professional summary that highlights the most relevant skills and experience for this role. Go straight to the point — no grandiose openings.
5. Identify skills from the job that the candidate likely has (based on their experience) but didn't list — add these as newSkills.
6. Reorder skills to put the most job-relevant ones first.
7. Calculate an overall match score (0-100) based on how well the adjusted CV matches the job.

## ABSOLUTE RULES:
- NEVER fabricate jobs, companies, or technologies the candidate hasn't used.
- Only reframe existing experience using the job posting's terminology.
- Keep bullet points concise and impact-focused (preserve original metrics if they exist).
- If the candidate has backend experience but the role is frontend-only, reframe it as "full-stack understanding" rather than removing it.
- The newSkills should only include things the candidate plausibly knows based on their actual experience.
- Before delivering each sentence, ask: "Would a real person write this, or does it sound like an AI trying to impress?" If it's the latter, rewrite it.

## RESPONSE FORMAT:
Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, no extra text):

{
  "title": "Frontend Engineer (professional title in English)",
  "summary": "Tailored professional summary in English. Straight to the point, no grandiose openings.",
  "experience": [
    {
      "position": "MUST be EXACTLY as in the original — do NOT modify, translate, or abbreviate. Copy verbatim.",
      "company": "MUST be EXACTLY as in the original — do NOT modify, translate, or abbreviate. Copy verbatim.",
      "bullets": [
        "Developed and integrated Web Components using Lit, improving reusability across multiple projects.",
        "Created React and Angular wrappers for component integration in frontend teams."
      ]
    }
  ],
  "newSkills": [
    {"name": "Lit", "category": "Libraries"}
  ],
  "skillReorder": ["Lit", "TypeScript", "React", "Angular", "JavaScript", "HTML", "CSS"],
  "matchedKeywords": ["Web Components", "Lit", "TypeScript"],
  "missingKeywords": ["Azure DevOps", "Lit"],
  "overallScore": 78,
  "changeSummary": [
    "Rewrote experience bullets to align with UI Developer role",
    "Added missing skills: Lit",
    "Reordered skills prioritizing Web Components and Lit"
  ]
}`;
}

function parseGeminiResponse(text: string): GeminiCVResponse | null {
  let cleaned = text.trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  cleaned = cleaned.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

  try {
    return JSON.parse(cleaned) as GeminiCVResponse;
  } catch {
    console.error('Failed to parse Gemini response:', cleaned);
    return null;
  }
}

function isLikelyEnglish(text: string): boolean {
  const englishWords = ['the', 'and', 'for', 'with', 'from', 'that', 'which', 'about', 'between', 'developed', 'implemented', 'managed', 'led', 'created', 'designed', 'built', 'responsible', 'collaborated', 'worked', 'ensuring', 'maintaining'];
  const spanishWords = ['el', 'la', 'los', 'las', 'de', 'del', 'que', 'para', 'con', 'sobre', 'entre', 'desarrollé', 'implementé', 'gestioné', 'lideré', 'creé', 'diseñé', 'construí', 'responsable', 'colaboré', 'trabajé', 'asegurando', 'manteniendo', 'desarrollado', 'implementado'];

  const lower = text.toLowerCase();
  let enCount = 0;
  let esCount = 0;

  for (const word of englishWords) {
    if (lower.includes(word)) enCount++;
  }
  for (const word of spanishWords) {
    if (lower.includes(word)) esCount++;
  }

  return enCount > esCount;
}

export async function adjustCVForJob(jobText: string, cvData: CVData): Promise<CVAdjustment> {
  const prompt = buildPrompt(cvData, jobText);
  const responseText = await callGemini(prompt);
  const parsed = parseGeminiResponse(responseText);

  if (!parsed) {
    return {
      title: cvData.title || '',
      summary: '',
      reorderedSkills: cvData.skills.map(s => ({ name: s.name, category: s.category })),
      newSkills: [],
      adjustedExperience: cvData.experience.map((exp, idx) => ({
        index: idx,
        company: exp.company,
        position: exp.position,
        bullets: exp.description,
        technologies: exp.technologies || '',
        changes: ['Failed to parse AI response — showing original bullets'],
      })),
      matchedKeywords: [],
      missingKeywords: [],
      overallScore: 0,
      changeSummary: ['AI response could not be parsed. Please try again.'],
    };
  }

  const expectedLang = detectJobLanguage(jobText);
  const allGeneratedText = [parsed.summary, ...parsed.experience.flatMap(e => e.bullets), ...parsed.changeSummary].join(' ');
  const isEnglish = isLikelyEnglish(allGeneratedText);
  const needsTranslation = expectedLang === 'es' && isEnglish;

  let translatedSummary = parsed.summary;
  let translatedExperiences = parsed.experience;
  let translatedChanges = parsed.changeSummary;

  if (needsTranslation) {
    const allBullets = parsed.experience.flatMap(e => e.bullets);
    const textsToTranslate = [parsed.summary, ...allBullets, ...parsed.changeSummary];
    const translated = await translateToSpanish(textsToTranslate);

    translatedSummary = translated[0];
    translatedChanges = translated.slice(1 + allBullets.length);

    let bulletIdx = 0;
    translatedExperiences = parsed.experience.map(e => ({
      ...e,
      bullets: e.bullets.map(() => translated[1 + bulletIdx++]),
    }));
  }

  const changeSummary = needsTranslation
    ? ['Traducido al español automáticamente', ...translatedChanges]
    : (parsed.changeSummary || ['AI analysis complete']);

  const normalize = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]/g, '');

  const adjustedExperience: AdjustedExperience[] = cvData.experience.map((exp, idx) => {
    let geminiExp = translatedExperiences.find(e =>
      e.position.toLowerCase() === exp.position.toLowerCase() &&
      e.company.toLowerCase() === exp.company.toLowerCase()
    );

    if (!geminiExp) {
      geminiExp = translatedExperiences.find(e =>
        normalize(e.position) === normalize(exp.position) &&
        normalize(e.company) === normalize(exp.company)
      );
    }

    if (!geminiExp && idx < translatedExperiences.length) {
      geminiExp = translatedExperiences[idx];
    }

    const bullets = geminiExp?.bullets || exp.description;
    const changes: string[] = [];

    if (geminiExp && JSON.stringify(geminiExp.bullets) !== JSON.stringify(exp.description)) {
      changes.push(needsTranslation ? 'Bullets generados y traducidos al español' : 'Bullets rewritten to match job priorities');
    }

    return {
      index: idx,
      company: exp.company,
      position: exp.position,
      bullets,
      technologies: exp.technologies || '',
      changes,
    };
  });

  const reorderedSkills = parsed.skillReorder.length > 0
    ? parsed.skillReorder.map(name => {
        const existing = cvData.skills.find(s => s.name.toLowerCase() === name.toLowerCase());
        return existing ? { name: existing.name, category: existing.category } : { name, category: undefined };
      })
    : cvData.skills.map(s => ({ name: s.name, category: s.category }));

  return {
    title: parsed.title || cvData.title,
    summary: translatedSummary || cvData.summary,
    reorderedSkills,
    newSkills: parsed.newSkills || [],
    adjustedExperience,
    matchedKeywords: parsed.matchedKeywords || [],
    missingKeywords: parsed.missingKeywords || [],
    overallScore: parsed.overallScore || 0,
    changeSummary,
  };
}
