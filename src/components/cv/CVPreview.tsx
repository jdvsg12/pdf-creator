import type { CVData } from '../../lib/parsePdf';

interface CVPreviewProps {
  data: CVData;
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Aug',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('/');
  if (parts.length === 2) {
    const month = MONTH_LABELS[parts[0]] || parts[0];
    return `${month} ${parts[1]}`;
  }
  return dateStr;
}

export const CVPreview: React.FC<CVPreviewProps> = ({ data }) => {
  const { name, title, contact, summary, skills, experience, education } = data;

  return (
    <div className="cv-page">
      <div className="cv-header">
        <h1 className="cv-name">{name || 'YOUR NAME'}</h1>
        <div className="cv-contact-row">
          {contact.location && (
            <span className="cv-contact-item">
              <svg className="cv-icon" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
              {contact.location}
            </span>
          )}
          {contact.email && (
            <a href={`mailto:${contact.email}`} className="cv-contact-item">
              <svg className="cv-icon" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>
              {contact.email}
            </a>
          )}
          {contact.phone && (
            <span className="cv-contact-item">
              <svg className="cv-icon" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>
              {contact.phone}
            </span>
          )}
          {contact.linkedin && (
            <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className="cv-contact-item">
              <svg className="cv-icon" viewBox="0 0 448 512"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>
              {contact.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}
            </a>
          )}
          {contact.github && (
            <a href={contact.github} target="_blank" rel="noopener noreferrer" className="cv-contact-item">
              <svg className="cv-icon" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256c0 113.3 73.5 209.3 175.4 243.2c12.8 2.3 17.5-5.6 17.5-12.3c0-6.1-.2-22.2-.3-43.5c-71.2 15.5-86.2-34.3-86.2-34.3c-11.6-29.5-28.4-37.4-28.4-37.4c-23.2-15.9 1.8-15.6 1.8-15.6c25.6 1.8 39.1 26.3 39.1 26.3c22.8 39.1 59.8 27.8 74.4 21.3c2.3-16.5 8.9-27.8 16.2-34.2c-56.8-6.5-116.6-28.4-116.6-126.5c0-28 10-50.8 26.4-68.7c-2.6-6.5-11.4-32.5 2.5-67.8c0 0 21.5-6.9 70.4 26.3c20.4-5.7 42.3-8.5 64-8.6c21.7 .1 43.6 2.9 64 8.6c48.9-33.2 70.4-26.3 70.4-26.3c13.9 35.3 5.2 61.3 2.6 67.8c16.4 17.9 26.4 40.7 26.4 68.7c0 98.3-59.9 120-116.9 126.3c9.2 7.9 17.4 23.5 17.4 47.4c0 34.2-.3 61.8-.3 70.3c0 6.8 4.7 14.8 17.6 12.3C438.6 465.3 512 369.3 512 256C512 114.6 397.4 0 256 0z"/></svg>
              {contact.github.replace(/https?:\/\/(www\.)?github\.com\//, '')}
            </a>
          )}
        </div>
      </div>

      {title && (
        <>
          <div className="cv-section-title">{title.toUpperCase()}</div>
          {summary && <p className="cv-profile-text">{summary}</p>}
        </>
      )}

      {experience && experience.length > 0 && (
        <>
          <div className="cv-section-title">Experience</div>
          {experience.map((exp, i) => (
            <div key={i} className="cv-job-entry">
              <div className="cv-job-title-row">
                <span>{exp.position}{exp.company ? ` — ${exp.company}` : ''}</span>
                <span>{exp.location ? `${exp.location} | ` : ''}{formatDate(exp.startDate)}{exp.endDate ? ` – ${formatDate(exp.endDate)}` : ' – Present'}</span>
              </div>
              {exp.description.length > 0 && (
                <ul>
                  {exp.description.map((desc, j) => (
                    <li key={j}>{desc}</li>
                  ))}
                </ul>
              )}
              {exp.technologies && (
                <p className="cv-technologies"><strong>Technologies:</strong> {exp.technologies}</p>
              )}
            </div>
          ))}
        </>
      )}

      {skills && skills.length > 0 && (
        <>
          <div className="cv-section-title">Skills</div>
          <div className="cv-skills-grouped">
            {Object.entries(
              skills.reduce<Record<string, string[]>>((acc, s) => {
                const cat = s.category || 'Frontend (Main Experience)';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(s.name);
                return acc;
              }, {})
            ).map(([cat, names]) => (
              <p key={cat} className="cv-skill-row">
                <strong>{cat}:</strong> {names.join(', ')}
              </p>
            ))}
          </div>
        </>
      )}

      {education && education.length > 0 && (
        <>
          <div className="cv-section-title">Education</div>
          {education.map((edu, i) => (
            <div key={i} className="cv-job-entry" style={{ marginBottom: 0 }}>
              <div className="cv-job-title-row">
                <span>{edu.degree}{edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}</span>
                <span>{edu.institution}{edu.location ? `, ${edu.location}` : ''}</span>
              </div>
              <div className="cv-job-date">{formatDate(edu.startDate)}{edu.endDate ? ` – ${formatDate(edu.endDate)}` : ''}</div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};
