import type { CVData } from './parsePdf';

interface JobAnalysisResult {
  missingSkills: string[];
  matchedSkills: string[];
  keywordSuggestions: string[];
  summarySuggestions: string[];
  bulletSuggestions: Array<{
    experienceIndex: number;
    original: string;
    suggestion: string;
    reason: string;
  }>;
  overallScore: number;
}

const COMMON_TECH_KEYWORDS = [
  'javascript', 'typescript', 'react', 'vue', 'angular', 'node.js', 'nodejs',
  'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
  'html', 'css', 'sass', 'less', 'tailwind', 'bootstrap',
  'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'ci/cd',
  'git', 'graphql', 'rest', 'microservices', 'agile', 'scrum',
  'webpack', 'vite', 'babel', 'jest', 'cypress', 'testing',
  'next.js', 'nextjs', 'nuxt', 'svelte', 'express', 'django', 'flask',
  'spring boot', 'springboot', '.net', 'dotnet', 'laravel', 'rails',
  'figma', 'adobe', 'photoshop', 'illustrator', 'xd',
  'machine learning', 'ml', 'ai', 'data science', 'analytics',
  'linux', 'unix', 'bash', 'shell', 'nginx', 'apache',
  'typescript', 'rxjs', 'redux', 'mobx', 'zustand', 'context api',
  'postgresql', 'postgres', 'sqlite', 'oracle', 'dynamodb',
  'jenkins', 'github actions', 'gitlab ci', 'circleci',
  'prometheus', 'grafana', 'datadog', 'new relic',
  'websockets', 'socket.io', 'grpc', 'protobuf',
  'solidity', 'web3', 'blockchain', 'ethereum',
];

function extractKeywords(text: string): Set<string> {
  const lower = text.toLowerCase();
  const found = new Set<string>();

  for (const keyword of COMMON_TECH_KEYWORDS) {
    if (lower.includes(keyword)) {
      found.add(keyword);
    }
  }

  const actionVerbs = [
    'designed', 'developed', 'implemented', 'architected', 'led',
    'managed', 'optimized', 'improved', 'reduced', 'increased',
    'delivered', 'deployed', 'maintained', 'collaborated', 'mentored',
    'automated', 'streamlined', 'enhanced', 'resolved', 'analyzed',
    'created', 'built', 'integrated', 'migrated', 'scaled',
  ];
  for (const verb of actionVerbs) {
    if (lower.includes(verb)) {
      found.add(verb);
    }
  }

  const softSkills = [
    'leadership', 'communication', 'teamwork', 'problem solving',
    'critical thinking', 'adaptability', 'time management',
    'collaboration', 'mentoring', 'coaching', 'stakeholder management',
    'cross-functional', 'agile mindset', 'ownership',
  ];
  for (const skill of softSkills) {
    if (lower.includes(skill)) {
      found.add(skill);
    }
  }

  return found;
}

function normalizeSkill(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function analyzeJobPosting(jobText: string, cvData: CVData): JobAnalysisResult {
  const jobKeywords = extractKeywords(jobText);
  const cvSkillNames = cvData.skills.map(s => normalizeSkill(s.name));
  const cvAllText = [
    cvData.summary,
    ...cvData.experience.flatMap(e => [e.position, e.company, ...e.description, e.technologies || '']),
    ...cvData.skills.map(s => s.name),
  ].join(' ').toLowerCase();

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const keyword of jobKeywords) {
    const isMatch = cvSkillNames.some(s => s.includes(keyword) || keyword.includes(s));
    const isInText = cvAllText.includes(keyword);

    if (isMatch || isInText) {
      matchedSkills.push(keyword);
    } else {
      missingSkills.push(keyword);
    }
  }

  const keywordSuggestions = [...jobKeywords].slice(0, 15);

  const summarySuggestions: string[] = [];
  if (cvData.summary) {
    const summaryLower = cvData.summary.toLowerCase();
    for (const keyword of [...jobKeywords].slice(0, 5)) {
      if (!summaryLower.includes(keyword) && missingSkills.includes(keyword)) {
        summarySuggestions.push(
          `Consider adding "${keyword}" to your professional summary to improve ATS matching.`
        );
      }
    }
  }

  const bulletSuggestions: JobAnalysisResult['bulletSuggestions'] = [];
  cvData.experience.forEach((exp, idx) => {
    exp.description.forEach((bullet) => {
      const bulletLower = bullet.toLowerCase();
      for (const keyword of missingSkills.slice(0, 5)) {
        if (!bulletLower.includes(keyword)) {
          bulletSuggestions.push({
            experienceIndex: idx,
            original: bullet,
            suggestion: `Consider incorporating "${keyword}" into this bullet if applicable to your work at ${exp.company}.`,
            reason: `The job posting emphasizes "${keyword}" but it's not mentioned in this experience entry.`,
          });
          break;
        }
      }
    });
  });

  const totalKeywords = jobKeywords.size;
  const matchedCount = matchedSkills.length;
  const overallScore = totalKeywords > 0 ? Math.round((matchedCount / totalKeywords) * 100) : 0;

  return {
    missingSkills,
    matchedSkills,
    keywordSuggestions,
    summarySuggestions,
    bulletSuggestions: bulletSuggestions.slice(0, 10),
    overallScore,
  };
}
