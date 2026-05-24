import React, { useState, useEffect } from 'react';
import type { CVData } from '../../lib/parsePdf';

interface SkillsSectionProps {
  data: CVData;
  onChange?: (data: Partial<CVData>) => void;
  viewMode?: boolean;
}

const SKILL_CATEGORIES: { name: string; skills: string[] }[] = [
  {
    name: 'Frontend (Main Experience)',
    skills: [
      'JavaScript (ES6+)',
      'TypeScript',
      'React.js',
      'Next.js (App Router & Pages Router)',
      'Tailwind CSS',
      'SASS',
      'ShadCN UI',
      'Flowbite',
      'CSS-in-JS',
      'Responsive Design',
      'Web Performance Optimization',
      'SEO',
      'Accessibility (a11y)',
      'Vite',
      'Webpack',
    ],
  },
  {
    name: 'Backend and Database',
    skills: [
      'Node.js',
      'Express.js',
      'NestJS',
      'TypeORM',
      'PostgreSQL',
      'Supabase',
      'RESTful API Design',
      'Backend Architecture',
    ],
  },
  {
    name: 'Tools and Workflow',
    skills: [
      'Git',
      'GitHub',
      'Version Control',
      'Code Reviews',
      'Figma',
      'Adobe XD',
      'WordPress (Headless CMS with ACF)',
      'npm',
      'Prettier',
      'Docker (Basic)',
      'CI/CD Concepts',
    ],
  },
  {
    name: 'Languages',
    skills: ['Spanish (Native)', 'English'],
  },
];

export const SkillsSection: React.FC<SkillsSectionProps> = ({ data, onChange, viewMode = false }) => {
  const [skillNames, setSkillNames] = useState<Array<{ name: string; category?: string }>>(() =>
    (data.skills || []).map(s => ({ name: s.name, category: s.category }))
  );
  const [customInput, setCustomInput] = useState('');

  useEffect(() => {
    setSkillNames((data.skills || []).map(s => ({ name: s.name, category: s.category })));
  }, [data.skills]);

  const selectedSet = new Set(skillNames.map(s => s.name));

  const toggleSkill = (name: string) => {
    let next: Array<{ name: string; category?: string }>;
    const existing = skillNames.find(s => s.name === name);
    
    if (existing) {
      next = skillNames.filter(s => s.name !== name);
    } else {
      const category = SKILL_CATEGORIES.find(c => c.skills.includes(name))?.name;
      next = [...skillNames, { name, category }];
    }
    
    setSkillNames(next);
    if (onChange) {
      onChange({ skills: next });
    }
  };

  const removeSkill = (name: string) => {
    toggleSkill(name);
  };

  const addCustomSkill = () => {
    const trimmed = customInput.trim();
    if (!trimmed || selectedSet.has(trimmed)) return;
    const next = [...skillNames, { name: trimmed, category: 'Frontend (Main Experience)' }];
    setSkillNames(next);
    setCustomInput('');
    if (onChange) {
      onChange({ skills: next });
    }
  };

  const handleCustomKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSkill();
    }
  };

  if (viewMode) {
    return (
      <section className="skills-section">
        <h2 className="section-title">Key Skills</h2>
        <div className="skills-grid">
          {data.skills?.map((skill, index) => (
            <div key={index} className="skill-tag">
              <span className="skill-name">{skill.name}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="editor-section visible">
      <h2 className="section-title">Key Skills</h2>

      {skillNames.length > 0 && (
        <div className="selected-skills-area">
          <label>Selected Skills</label>
          <div className="skill-chips">
            {skillNames.map(s => (
              <span key={s.name} className="skill-chip selected">
                {s.name}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={() => removeSkill(s.name)}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {SKILL_CATEGORIES.map(cat => (
        <div key={cat.name} className="skill-category">
          <label className="category-label">{cat.name}</label>
          <div className="skill-chips">
            {cat.skills.map(skill => (
              <span
                key={skill}
                className={`skill-chip ${selectedSet.has(skill) ? 'selected' : ''}`}
                onClick={() => toggleSkill(skill)}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}

      <div className="custom-skill-row">
        <input
          type="text"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
          onKeyDown={handleCustomKeyDown}
          placeholder="Add a custom skill…"
        />
        <button onClick={addCustomSkill} className="btn-add-custom">
          Add
        </button>
      </div>
    </section>
  );
};
