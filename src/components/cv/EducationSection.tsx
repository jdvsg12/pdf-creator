import React, { useState, useEffect } from 'react';
import type { CVData } from '../../lib/parsePdf';

interface EducationSectionProps {
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

export const EducationSection: React.FC<EducationSectionProps> = ({ data, onChange, viewMode = false }) => {
  const [education, setEducation] = useState<Array<{
    institution: string;
    degree: string;
    fieldOfStudy: string;
    startDate: string;
    endDate: string | null;
    isPresent: boolean;
    location: string;
  }>>(() =>
    data.education?.map(edu => ({
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy ?? '',
      startDate: edu.startDate,
      endDate: edu.endDate ?? '',
      isPresent: edu.endDate === null || edu.endDate === '',
      location: edu.location ?? ''
    })) ?? []
  );

  useEffect(() => {
    setEducation(
      data.education?.map(edu => ({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy ?? '',
        startDate: edu.startDate,
        endDate: edu.endDate ?? '',
        isPresent: edu.endDate === null || edu.endDate === '',
        location: edu.location ?? ''
      })) ?? []
    );
  }, [data.education]);

  const handleAddEducation = () => {
    setEducation([...education, {
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: null,
      isPresent: true,
      location: ''
    }]);
  };

  const handleRemoveEducation = (index: number) => {
    const newEducation = [...education];
    newEducation.splice(index, 1);
    setEducation(newEducation);
  };

  const handleEduChange = (index: number, field: 'institution' | 'degree' | 'fieldOfStudy' | 'location', value: string) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const handleDateChange = (index: number, field: 'startDate' | 'endDate', month: string, year: string) => {
    const newEducation = [...education];
    const formatted = formatDate(month, year);
    if (field === 'endDate') {
      newEducation[index].endDate = formatted || null;
      newEducation[index].isPresent = !formatted;
    } else {
      newEducation[index].startDate = formatted;
    }
    setEducation(newEducation);
  };

  const handlePresentToggle = (index: number, checked: boolean) => {
    const newEducation = [...education];
    newEducation[index].isPresent = checked;
    newEducation[index].endDate = checked ? null : '';
    setEducation(newEducation);
  };

  const handleSaveEducation = () => {
    const validEducation = education
      .filter(edu => edu.institution.trim() !== '' && edu.degree.trim() !== '')
      .map(edu => ({
        institution: edu.institution.trim(),
        degree: edu.degree.trim(),
        fieldOfStudy: edu.fieldOfStudy.trim() || undefined,
        startDate: edu.startDate.trim(),
        endDate: edu.isPresent ? null : (edu.endDate || null),
        location: edu.location.trim() || undefined
      }));
    if (onChange) {
      onChange({ education: validEducation });
    }
  };

  if (viewMode) {
    return (
      <section className="education-section">
        <h2 className="section-title">Education</h2>
        {data.education?.map((edu, index) => (
          <div key={index} className="education-item">
            <div className="education-header">
              <h3 className="institution">{edu.institution}</h3>
              <h4 className="degree">{edu.degree}</h4>
              {edu.fieldOfStudy && <span className="field-of-study">{edu.fieldOfStudy}</span>}
            </div>
            <div className="education-meta">
              <span className="date">
                {edu.startDate} {edu.endDate ? `– ${edu.endDate}` : ''}
              </span>
              {edu.location && <span className="location">| {edu.location}</span>}
            </div>
          </div>
        ))}
      </section>
    );
  }

  return (
    <section className="education-section">
      <h2 className="section-title">Education</h2>
      <div className="education-list">
        {education.map((edu, index) => {
          const startParsed = parseDate(edu.startDate);
          const endParsed = parseDate(edu.endDate);

          return (
            <div key={index} className="education-input-row">
              <div className="field-group">
                <label>Institution:</label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => handleEduChange(index, 'institution', e.target.value)}
                  placeholder="University or school name"
                />
              </div>
              <div className="field-group">
                <label>Degree:</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => handleEduChange(index, 'degree', e.target.value)}
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
              <div className="field-group">
                <label>Field of Study:</label>
                <input
                  type="text"
                  value={edu.fieldOfStudy}
                  onChange={(e) => handleEduChange(index, 'fieldOfStudy', e.target.value)}
                  placeholder="e.g., Computer Science"
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
                    disabled={edu.isPresent}
                  >
                    <option value="">Month</option>
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                  <select
                    value={endParsed.year}
                    onChange={(e) => handleDateChange(index, 'endDate', endParsed.month, e.target.value)}
                    disabled={edu.isPresent}
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
                    checked={edu.isPresent}
                    onChange={(e) => handlePresentToggle(index, e.target.checked)}
                  />
                  Present
                </label>
              </div>
              <div className="field-group">
                <label>Location (City, Country):</label>
                <input
                  type="text"
                  value={edu.location}
                  onChange={(e) => handleEduChange(index, 'location', e.target.value)}
                  placeholder="Boston, USA"
                />
              </div>
              <button onClick={() => handleRemoveEducation(index)} className="remove-btn">
                ×
              </button>
            </div>
          );
        })}
        <div className="add-education">
          <button onClick={handleAddEducation}>+ Add Education</button>
        </div>
        <button onClick={handleSaveEducation} className="save-education-btn">
          Save Education
        </button>
      </div>
    </section>
  );
};
