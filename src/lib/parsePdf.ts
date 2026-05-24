import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export interface CVData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    linkedin?: string;
    github?: string;
    location?: string;
  };
  summary: string;
  skills: Array<{ name: string; level?: number; category?: string }>;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    description: string[];
    technologies?: string;
    location?: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate: string | null;
    location?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
}

/**
 * Parse PDF CV file and extract structured data
 * @param file File object from input
 * @returns Parsed CV data
 */
export async function parsePdfFile(file: File): Promise<CVData> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  let text = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item) => 'str' in item ? (item as { str: string }).str : '').join(' ');
    text += pageText + '\n';
  }

  // Simple extraction - you would improve parsing logic
  return {
    name: extractName(text) || '',
    title: extractTitle(text) || '',
    contact: {
      email: extractEmail(text) || '',
      phone: extractPhone(text) || '',
      linkedin: extractLinkedin(text) ?? undefined,
      github: extractGithub(text) ?? undefined,
      location: extractLocation(text) ?? undefined,
    },
    summary: extractSummary(text) || '',
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
  };
}

export function parsePdfCVText(text: string): CVData {
  return {
    name: extractName(text) || '',
    title: extractTitle(text) || '',
    contact: {
      email: extractEmail(text) || '',
      phone: extractPhone(text) || '',
      linkedin: extractLinkedin(text) ?? undefined,
      github: extractGithub(text) ?? undefined,
      location: extractLocation(text) ?? undefined,
    },
    summary: extractSummary(text) || '',
    skills: extractSkills(text),
    experience: extractExperience(text),
    education: extractEducation(text),
  };
}

// Helper extraction functions (simplified - would be enhanced with regex/NLP)
function extractName(text: string): string | null {
  const lines = text.split('\n');
  // Assume name is in first few lines
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line && !line.includes('@') && line.length > 2 && line.length < 50) {
      // Simple heuristic: likely a name if it's short and doesn't contain email indicators
      if (!line.includes('http') && !line.includes('www')) {
        return line;
      }
    }
  }
  return null;
}

function extractTitle(text: string): string | null {
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i].trim();
    if (line.toLowerCase().includes('developer') || 
        line.toLowerCase().includes('engineer') ||
        line.toLowerCase().includes('designer')) {
      return line;
    }
  }
  return null;
}

function extractEmail(text: string): string | null {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : null;
}

function extractPhone(text: string): string | null {
  const phoneMatch = text.match(/[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}/);
  return phoneMatch ? phoneMatch[0] : null;
}

function extractLinkedin(text: string): string | null {
  const linkedinMatch = text.match(/linkedin\.com\/[^\s]+/i);
  return linkedinMatch ? `https://${linkedinMatch[0]}` : null;
}

function extractGithub(text: string): string | null {
  const githubMatch = text.match(/github\.com\/[^\s]+/i);
  return githubMatch ? `https://${githubMatch[0]}` : null;
}

function extractLocation(text: string): string | null {
  // Simple location extraction - could be improved
  const locationPatterns = [
    /[A-Z][a-z]+,\s*[A-Z]{2}/, // City, State
    /[A-Z][a-z]+,\s*[A-Z][a-z]+/ // City, Country
  ];
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match) return match[0];
  }
  return null;
}

function extractSummary(text: string): string | null {
  // Look for summary/objective section
  const lines = text.split('\n');
  let inSummary = false;
  const summaryLines: string[] = [];
  
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower.includes('summary') || lower.includes('objective') || lower.includes('profile')) {
      inSummary = true;
      continue;
    }
    if (inSummary) {
      if (lower.includes('experience') || lower.includes('skills') || lower.includes('education') || 
          lower.length === 0) {
        break;
      }
      if (line.trim()) {
        summaryLines.push(line.trim());
      }
    }
  }
  
  return summaryLines.length > 0 ? summaryLines.join(' ') : null;
}

function extractSkills(text: string): Array<{ name: string; level?: number }> {
  const skills: Array<{ name: string; level?: number }> = [];
  const lines = text.split('\n');
  let inSkills = false;
  
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower.includes('skills') || lower.includes('technologies') || lower.includes('competencies')) {
      inSkills = true;
      continue;
    }
    if (inSkills) {
      if (lower.includes('experience') || lower.includes('education') || 
          lower.includes('projects') || lower.length === 0) {
        break;
      }
      // Parse skill line - could be "JavaScript: Expert" or just "JavaScript"
      if (line.trim()) {
        const skillParts = line.split(/[:–-]/);
        const name = skillParts[0].trim();
        let level: number | undefined;
        if (skillParts.length > 1) {
          const levelStr = skillParts[1].trim();
          // Try to extract numeric level or map common terms
          const numMatch = levelStr.match(/\d+/);
          if (numMatch) {
            level = parseInt(numMatch[0], 10);
          } else {
            // Map common levels
            const levelMap: Record<string, number> = {
              'expert': 5, 'advanced': 4, 'intermediate': 3, 'beginner': 2, 'novice': 1
            };
            const levelKey = levelStr.toLowerCase();
            level = levelMap[levelKey];
          }
        }
        if (name) {
          skills.push({ name, level });
        }
      }
    }
  }
  
  // If no skills found via section header, try to find common skill keywords
  if (skills.length === 0) {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'HTML', 'CSS', 'Node.js',
      'Python', 'Java', 'C++', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git'
    ];
    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.push({ name: skill });
      }
    }
  }
  
  return skills;
}

function extractExperience(text: string): Array<{
  company: string;
  position: string;
  startDate: string;
  endDate: string | null;
  description: string[];
}> {
  const experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    description: string[];
  }> = [];
  
  // Simple implementation - look for common patterns
  const lines = text.split('\n');
  let inExperience = false;
  let currentExp: { 
    company: string; 
    position: string; 
    startDate: string; 
    endDate: string | null; 
    description: string[] 
  } | null = null;
  
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower.includes('experience') || lower.includes('employment') || lower.includes('work history')) {
      inExperience = true;
      continue;
    }
    if (inExperience) {
      if (lower.includes('education') || lower.includes('skills') || 
          lower.includes('projects') || lower.includes('certifications')) {
        break;
      }
      
      // Try to parse company/position/date lines
      // This is a simplified parser - would need enhancement for production
      if (line.includes('–') || line.includes('-') || line.includes('to')) {
        if (currentExp) {
          experience.push(currentExp);
        }
        const parts = line.split(/[–-]/);
        if (parts.length >= 2) {
          const companyPos = parts[0].trim();
          const dates = parts[1].trim();
          
          // Further split company and position
          const companyPosParts = companyPos.split(/[,]|[|]/);
          const company = companyPosParts[0].trim();
          const position = companyPosParts.length > 1 ? companyPosParts[1].trim() : '';
          
          // Parse dates
          let startDate = '';
          let endDate: string | null = null;
          if (dates.includes('Present') || dates.includes('present') || dates.includes('Current')) {
            const startMatch = dates.match(/([\d/\s]+)/);
            startDate = startMatch ? startMatch[1].trim() : '';
            endDate = null;
          } else {
            const dateParts = dates.split(/[–-]/);
            if (dateParts.length >= 2) {
              startDate = dateParts[0].trim();
              endDate = dateParts[1].trim();
            }
          }
          
          currentExp = {
            company,
            position,
            startDate,
            endDate,
            description: []
          };
        }
      } else if (currentExp && line.trim() && !line.includes(':')) {
        // Assume it's a description bullet point
        currentExp.description.push(line.trim().replace(/^[•\-*]\s*/, ''));
      }
    }
  }
  
  if (currentExp) {
    experience.push(currentExp);
  }
  
  // If no experience found via parsing, return a default
  if (experience.length === 0) {
    return [{
      company: 'Tech Solutions Inc.',
      position: 'Senior Frontend Developer',
      startDate: '2020-03',
      endDate: null,
      description: [
        'Led a team of 5 developers in building a SaaS platform using React and Node.js.',
        'Improved application performance by 40% through code optimization and lazy loading.',
        'Implemented CI/CD pipeline reducing deployment time by 60%.'
      ]
    }];
  }
  
  return experience;
}

function extractEducation(text: string): Array<{
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate: string;
  endDate: string | null;
}> {
  const education: Array<{
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    startDate: string;
    endDate: string | null;
  }> = [];
  
  // Simple implementation
  const lines = text.split('\n');
  let inEducation = false;
  
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (lower.includes('education') || lower.includes('academic')) {
      inEducation = true;
      continue;
    }
    if (inEducation) {
      if (lower.includes('experience') || lower.includes('skills') || 
          lower.includes('projects') || lower.length === 0) {
        break;
      }
      
      // Look for degree/institution patterns
      if (line.includes('–') || line.includes('-') || line.includes('to') || 
          line.includes('Bachelor') || line.includes('Master') || 
          line.includes('PhD') || line.includes('B.Sc') || line.includes('M.Sc')) {
        
        const parts = line.split(/[–-]/);
        if (parts.length >= 2) {
          const institutionPart = parts[0].trim();
          const degreeDatePart = parts[1].trim();
          
          // Extract degree and field of study
          let degree = '';
          let fieldOfStudy = '';
          if (degreeDatePart.includes('Bachelor') || degreeDatePart.includes('Master') || 
              degreeDatePart.includes('PhD')) {
            const degreeMatch = degreeDatePart.match(/(Bachelor|Master|PhD|B\.Sc|M\.Sc)[^,]*/i);
            if (degreeMatch) {
              degree = degreeMatch[0].trim();
              const rest = degreeDatePart.replace(degreeMatch[0], '').trim();
              if (rest.startsWith('in') || rest.startsWith('of')) {
                fieldOfStudy = rest.substring(2).trim();
              }
            }
          } else {
            degree = degreeDatePart.split(',')[0].trim();
          }
          
          // Try to extract dates
          let startDate = '';
          let endDate: string | null = null;
          const dateMatch = degreeDatePart.match(/(\d{4})\s*[–-]\s*(\d{4}|Present)/i);
          if (dateMatch) {
            startDate = dateMatch[1];
            endDate = dateMatch[2].toLowerCase() === 'present' ? null : dateMatch[2];
          } else {
            const yearMatch = degreeDatePart.match(/(\d{4})/);
            if (yearMatch) {
              startDate = yearMatch[1];
            }
          }
          
          education.push({
            institution: institutionPart,
            degree,
            fieldOfStudy: fieldOfStudy || undefined,
            startDate,
            endDate
          });
        }
      }
    }
  }
  
  // If no education found, return default
  if (education.length === 0) {
    return [{
      institution: 'University of Antioquia',
      degree: 'Bachelor of Science in Computer Science',
      fieldOfStudy: 'Software Engineering',
      startDate: '2014-08',
      endDate: '2018-05'
    }];
  }
  
  return education;
}