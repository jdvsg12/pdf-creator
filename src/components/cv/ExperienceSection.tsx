import React, { useState, useEffect } from 'react';
import type { CVData } from '../../lib/parsePdf';

interface ExperienceSectionProps {
  data: CVData;
  onChange?: (data: Partial<CVData>) => void;
  viewMode?: boolean;
}

const MONTHS = [
  { value: '01', label: 'Jan' },
  { value: '02', label: 'Feb' },
  { value: '03', label: 'Mar' },
  { value: '04', label: 'Apr' },
  { value: '05', label: 'May' },
  { value: '06', label: 'Jun' },
  { value: '07', label: 'Jul' },
  { value: '08', label: 'Aug' },
  { value: '09', label: 'Sep' },
  { value: '10', label: 'Oct' },
  { value: '11', label: 'Nov' },
  { value: '12', label: 'Dec' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

function parseDate(dateStr: string | null | undefined): { month: string; year: string } {
  if (!dateStr) return { month: '', year: '' };
  const parts = dateStr.split('/');
  return {
    month: parts[0] || '',
    year: parts[1] || '',
  };
}

function formatDate(month: string, year: string): string {
  if (month && year) return `${month}/${year}`;
  if (month) return `${month}/`;
  if (year) return `/${year}`;
  return '';
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ data, onChange, viewMode = false }) => {
  const [experience, setExperience] = useState<Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    isPresent: boolean;
    location: string;
    bullets: string[];
    technologies: string;
  }>>(() =>
    data.experience?.map(exp => ({
      company: exp.company,
      position: exp.position,
      startDate: exp.startDate,
      endDate: exp.endDate ?? '',
      isPresent: exp.endDate === null || exp.endDate === '',
      location: exp.location ?? '',
      bullets: exp.description.length > 0 ? exp.description : [''],
      technologies: exp.technologies ?? ''
    })) ?? []
  );

  useEffect(() => {
    setExperience(
      data.experience?.map(exp => ({
        company: exp.company,
        position: exp.position,
        startDate: exp.startDate,
        endDate: exp.endDate ?? '',
        isPresent: exp.endDate === null || exp.endDate === '',
        location: exp.location ?? '',
        bullets: exp.description.length > 0 ? exp.description : [''],
        technologies: exp.technologies ?? ''
      })) ?? []
    );
  }, [data.experience]);

  const handleAddExperience = () => {
    setExperience([...experience, {
      company: '',
      position: '',
      startDate: '',
      endDate: null,
      isPresent: true,
      location: '',
      bullets: [''],
      technologies: ''
    }]);
  };

  const handleRemoveExperience = (index: number) => {
    const newExperience = [...experience];
    newExperience.splice(index, 1);
    setExperience(newExperience);
  };

  const handleExpChange = (index: number, field: 'company' | 'position' | 'location' | 'technologies', value: string) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const handleDateChange = (index: number, field: 'startDate' | 'endDate', month: string, year: string) => {
    const newExperience = [...experience];
    const formatted = formatDate(month, year);
    if (field === 'endDate') {
      newExperience[index].endDate = formatted || null;
      newExperience[index].isPresent = !formatted;
    } else {
      newExperience[index].startDate = formatted;
    }
    setExperience(newExperience);
  };

  const handlePresentToggle = (index: number, checked: boolean) => {
    const newExperience = [...experience];
    newExperience[index].isPresent = checked;
    newExperience[index].endDate = checked ? null : '';
    setExperience(newExperience);
  };

  const handleBulletChange = (expIndex: number, bulletIndex: number, value: string) => {
    const newExperience = [...experience];
    newExperience[expIndex].bullets[bulletIndex] = value;
    setExperience(newExperience);
  };

  const handleAddBullet = (expIndex: number) => {
    const newExperience = [...experience];
    newExperience[expIndex].bullets.push('');
    setExperience(newExperience);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const newExperience = [...experience];
    newExperience[expIndex].bullets.splice(bulletIndex, 1);
    if (newExperience[expIndex].bullets.length === 0) {
      newExperience[expIndex].bullets.push('');
    }
    setExperience(newExperience);
  };

  const handleSaveExperience = () => {
    const validExperience = experience
      .filter(exp => exp.company.trim() !== '' && exp.position.trim() !== '')
      .map(exp => ({
        company: exp.company.trim(),
        position: exp.position.trim(),
        startDate: exp.startDate.trim(),
        endDate: exp.isPresent ? null : (exp.endDate || null),
        location: exp.location.trim() || undefined,
        description: exp.bullets
          .filter(b => b.trim() !== '')
          .map(b => b.trim()),
        technologies: exp.technologies.trim() || undefined
      }));
    if (onChange) {
      onChange({ experience: validExperience });
    }
  };

  if (viewMode) {
    return (
      <section className="experience-section">
        <h2 className="section-title">Professional Experience</h2>
        {data.experience?.map((exp, index) => (
          <div key={index} className="experience-item">
            <div className="experience-header">
              <h3 className="company">{exp.company}</h3>
              <h4 className="position">{exp.position}</h4>
              <div className="experience-meta">
                <span className="date">
                  {exp.startDate} {exp.endDate ? `– ${exp.endDate}` : '– Present'}
                </span>
                {exp.location && <span className="location">| {exp.location}</span>}
              </div>
            </div>
            <ul className="description-list">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
            {exp.technologies && (
              <p className="technologies">
                <strong>Technologies:</strong> {exp.technologies}
              </p>
            )}
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="experience-section">
      <h2 className="section-title">Professional Experience</h2>
      <div className="experience-list">
        {experience.map((exp, index) => {
          const startParsed = parseDate(exp.startDate);
          const endParsed = parseDate(exp.endDate);

          return (
            <div key={index} className="experience-input-row">
              <div className="field-group">
                <label>Company:</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => handleExpChange(index, 'company', e.target.value)}
                  placeholder="Company name"
                />
              </div>
              <div className="field-group">
                <label>Position:</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => handleExpChange(index, 'position', e.target.value)}
                  placeholder="Job title"
                />
              </div>
              <div className="field-group date-group">
                <label>Start Date:</label>
                <div className="date-selects">
                  <select
                    value={startParsed.month}
                    onChange={(e) => handleDateChange(index, 'startDate', e.target.value, startParsed.year)}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    value={startParsed.year}
                    onChange={(e) => handleDateChange(index, 'startDate', startParsed.month, e.target.value)}
                  >
                    <option value="">Year</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-group date-group">
                <label>End Date:</label>
                <div className="date-selects">
                  <select
                    value={endParsed.month}
                    onChange={(e) => handleDateChange(index, 'endDate', e.target.value, endParsed.year)}
                    disabled={exp.isPresent}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    value={endParsed.year}
                    onChange={(e) => handleDateChange(index, 'endDate', endParsed.month, e.target.value)}
                    disabled={exp.isPresent}
                  >
                    <option value="">Year</option>
                    {YEARS.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <label className="present-toggle">
                  <input
                    type="checkbox"
                    checked={exp.isPresent}
                    onChange={(e) => handlePresentToggle(index, e.target.checked)}
                  />
                  Present
                </label>
              </div>
              <div className="field-group">
                <label>Location (City, Country):</label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => handleExpChange(index, 'location', e.target.value)}
                  placeholder="New York, USA"
                />
              </div>

              <div className="field-group bullets-group full-width">
                <label>Description:</label>
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="bullet-row">
                    <span className="bullet-marker">•</span>
                    <input
                      type="text"
                      value={bullet}
                      onChange={(e) => handleBulletChange(index, bulletIndex, e.target.value)}
                      placeholder="Achievement or responsibility"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(index, bulletIndex)}
                      className="remove-bullet-btn"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => handleAddBullet(index)}
                  className="add-bullet-btn"
                >
                  + Add bullet
                </button>
              </div>

              <div className="field-group full-width">
                <label>Technologies:</label>
                <input
                  type="text"
                  value={exp.technologies}
                  onChange={(e) => handleExpChange(index, 'technologies', e.target.value)}
                  placeholder="React, TypeScript, Node.js..."
                />
              </div>

              <button onClick={() => handleRemoveExperience(index)} className="remove-btn">
                ×
              </button>
            </div>
          );
        })}
        <div className="add-experience">
          <button onClick={handleAddExperience}>+ Add Experience</button>
        </div>
        <button onClick={handleSaveExperience} className="save-experience-btn">
          Save Experience
        </button>
      </div>
    </section>
  );
};
