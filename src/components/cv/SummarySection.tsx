import React, { useState, useEffect } from 'react';
import type { CVData } from '../../lib/parsePdf';

interface SummarySectionProps {
  data: CVData;
  onChange?: (data: Partial<CVData>) => void;
  viewMode?: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ data, onChange, viewMode = false }) => {
  const [summary, setSummary] = useState(data.summary || '');

  useEffect(() => {
    setSummary(data.summary || '');
  }, [data.summary]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(e.target.value);
    if (onChange) {
      onChange({ summary: e.target.value });
    }
  };

  if (viewMode) {
    return (
      <section className="summary-section">
        <h2 className="section-title">Professional Summary</h2>
        <p className="summary-text">{summary}</p>
      </section>
    );
  }

  return (
    <section className="summary-section">
      <h2 className="section-title">Professional Summary</h2>
      <div className="form-group">
        <textarea
          value={summary}
          onChange={handleChange}
          placeholder="Brief summary of your professional background and goals"
          rows={4}
        />
      </div>
    </section>
  );
};