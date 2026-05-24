import { useState } from 'react';
import type { CVData } from '../../lib/parsePdf';
import { adjustCVForJob, detectJobLanguage } from '../../lib/adjustCVForJob';
import './JobAnalysisSection.css';

interface JobAnalysisSectionProps {
  data: CVData;
  onChange: (partial: Partial<CVData>) => void;
}

export const JobAnalysisSection: React.FC<JobAnalysisSectionProps> = ({ data, onChange }) => {
  const [jobText, setJobText] = useState('');
  const [adjustment, setAdjustment] = useState<Awaited<ReturnType<typeof adjustCVForJob>> | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [applied, setApplied] = useState(false);
  const [language, setLanguage] = useState<'es' | 'en' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobText.trim()) return;
    setLoading(true);
    setError(null);
    setApplied(false);
    const detectedLang = detectJobLanguage(jobText);
    setLanguage(detectedLang);
    try {
      const result = await adjustCVForJob(jobText, data);
      setAdjustment(result);
      setHasAnalyzed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze job posting');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyChanges = () => {
    if (!adjustment) return;

    const allSkills = [...adjustment.reorderedSkills, ...adjustment.newSkills];

    const uniqueSkills = allSkills.filter((s, i, arr) =>
      arr.findIndex(x => x.name.toLowerCase() === s.name.toLowerCase()) === i
    );

    const updatedExperience = data.experience.map((exp, idx) => {
      const adjusted = adjustment.adjustedExperience.find(e => e.index === idx);
      if (adjusted) {
        return { ...exp, description: adjusted.bullets };
      }
      return exp;
    });

    onChange({
      title: adjustment.title,
      summary: adjustment.summary,
      skills: uniqueSkills,
      experience: updatedExperience,
    });

    setApplied(true);
  };

  const handleReset = () => {
    setJobText('');
    setAdjustment(null);
    setHasAnalyzed(false);
    setApplied(false);
    setError(null);
    setLanguage(null);
  };

  return (
    <div className="job-analysis-section">
      <h2 className="section-title">AI Job Posting Analysis</h2>
      <p className="analysis-description">
        Paste a job posting and Gemini AI will adjust your CV to match — rewriting bullets, reordering skills, and adding missing keywords based on your real experience.
        {language && <span className="lang-badge">{language === 'es' ? '🇪🇸 Spanish' : '🇺🇸 English'} detected</span>}
      </p>

      <div className="analysis-input-group">
        <label>Paste the target job description</label>
        <textarea
          className="job-textarea"
          placeholder="Paste the full job posting here..."
          value={jobText}
          onChange={e => setJobText(e.target.value)}
          rows={10}
          disabled={loading}
        />
        <div className="analysis-actions">
          <button
            className="btn-analyze"
            onClick={handleAnalyze}
            disabled={!jobText.trim() || loading}
          >
            {loading ? 'Analyzing...' : 'Analyze & Adjust CV'}
          </button>
          {hasAnalyzed && !loading && (
            <button className="btn-reset-analysis" onClick={handleReset}>
              Clear
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>{language === 'es'
            ? 'Gemini AI está analizando la oferta y ajustando tu CV...'
            : 'Gemini AI is analyzing the job posting and adjusting your CV...'}</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p><strong>Error:</strong> {error}</p>
          <button className="btn-reset-analysis" onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {hasAnalyzed && adjustment && !loading && (
        <div className="analysis-results">
          <div className="score-card">
            <div className="score-circle" style={{ background: `conic-gradient(#d4af37 ${adjustment.overallScore * 3.6}deg, #e8e5e0 0deg)` }}>
              <span className="score-value">{adjustment.overallScore}%</span>
            </div>
            <p className="score-label">Match Score</p>
          </div>

          {adjustment.changeSummary.length > 0 && (
            <div className="result-block change-summary">
              <h3>Planned Changes</h3>
              <ul className="change-list">
                {adjustment.changeSummary.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {adjustment.title && adjustment.title !== data.title && (
            <div className="result-block">
              <h3>Preview of Adjusted Title</h3>
              <div className="title-comparison">
                <div className="original-title">
                  <h4>Original</h4>
                  <span>{data.title}</span>
                </div>
                <div className="adjusted-title">
                  <h4>Adjusted</h4>
                  <span>{adjustment.title}</span>
                </div>
              </div>
            </div>
          )}

          {adjustment.summary && (
            <div className="result-block">
              <h3>Preview of Adjusted Summary</h3>
              <div className="summary-comparison">
                <div className="original-summary">
                  <h4>Original</h4>
                  <p>{data.summary}</p>
                </div>
                <div className="adjusted-summary">
                  <h4>Adjusted</h4>
                  <p>{adjustment.summary}</p>
                </div>
              </div>
            </div>
          )}

          {adjustment.adjustedExperience.length > 0 && (
            <div className="result-block">
              <h3>Preview of Adjusted Bullets</h3>
              {adjustment.adjustedExperience.map(adj => {
                const original = data.experience[adj.index];
                const hasChanges = adj.changes.length > 0;
                return (
                  <div key={adj.index} className={`bullet-adjustment ${hasChanges ? '' : 'no-changes'}`}>
                    <p className="bullet-adjustment-header">
                      <strong>{adj.position}</strong> at {adj.company}
                      {!hasChanges && <span className="no-changes-badge"> Sin cambios</span>}
                    </p>
                    <div className="bullet-comparison">
                      <div className="original-bullets">
                        <h4>Original</h4>
                        <ul>
                          {(original?.description || []).map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="adjusted-bullets">
                        <h4>Adjusted</h4>
                        <ul>
                          {adj.bullets.map((b, i) => (
                            <li key={i}>{b}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {adjustment.matchedKeywords.length > 0 && (
            <div className="result-block">
              <h3>Matched Keywords ({adjustment.matchedKeywords.length})</h3>
              <div className="skill-tag-list">
                {adjustment.matchedKeywords.map(skill => (
                  <span key={skill} className="skill-tag matched">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {adjustment.missingKeywords.length > 0 && (
            <div className="result-block">
              <h3>Missing Keywords ({adjustment.missingKeywords.length})</h3>
              <div className="skill-tag-list">
                {adjustment.missingKeywords.map(skill => (
                  <span key={skill} className="skill-tag missing">{skill}</span>
                ))}
              </div>
              {adjustment.newSkills.length > 0 && (
                <p className="new-skills-note">
                  Will add: {adjustment.newSkills.map(s => s.name).join(', ')}
                </p>
              )}
            </div>
          )}



          <div className="apply-section">
            {applied ? (
              <div className="applied-confirmation">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="10" fill="#2e7d32" />
                  <path d="M6 10l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Changes applied to your CV!</span>
              </div>
            ) : (
              <button className="btn-apply-all" onClick={handleApplyChanges}>
                Apply All Changes to CV
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
