import { useState, useCallback, useEffect, useRef } from 'react';
import type { CVData } from '../../lib/parsePdf';
import { HeaderSection } from './HeaderSection';
import { SummarySection } from './SummarySection';
import { SkillsSection } from './SkillsSection';
import { ExperienceSection } from './ExperienceSection';
import { EducationSection } from './EducationSection';
import { JobAnalysisSection } from './JobAnalysisSection';
import { CVPreview } from './CVPreview';
import './CVViewer.css';
import html2pdf from 'html2pdf.js';
import { SEED_CV_DATA } from '../../../seed-cv-data';

const STORAGE_KEY = 'cv-creator-data';

interface CVViewerProps {
  initialData: CVData;
  onCVChange: (data: CVData) => void;
}

type SectionKey = 'header' | 'summary' | 'skills' | 'experience' | 'education' | 'ai-assist';
type PreviewTab = 'preview' | 'html';

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

function getHtmlContent(data: CVData): string {
  const contactRow = [
    data.contact.location && `<span class="contact-item"><svg class="icon" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>${data.contact.location}</span>`,
    data.contact.email && `<a href="mailto:${data.contact.email}" class="contact-item"><svg class="icon" viewBox="0 0 512 512"><path d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4c0-26.5-21.5-48-48-48H48zM0 176V384c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V176L294.4 339.2c-22.8 17.1-54 17.1-76.8 0L0 176z"/></svg>${data.contact.email}</a>`,
    data.contact.phone && `<span class="contact-item"><svg class="icon" viewBox="0 0 512 512"><path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>${data.contact.phone}</span>`,
    data.contact.linkedin && `<a href="${data.contact.linkedin}" target="_blank" class="contact-item"><svg class="icon" viewBox="0 0 448 512"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg>${data.contact.linkedin.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, '')}</a>`,
    data.contact.github && `<a href="${data.contact.github}" target="_blank" class="contact-item"><svg class="icon" viewBox="0 0 512 512"><path d="M256 0C114.6 0 0 114.6 0 256c0 113.3 73.5 209.3 175.4 243.2c12.8 2.3 17.5-5.6 17.5-12.3c0-6.1-.2-22.2-.3-43.5c-71.2 15.5-86.2-34.3-86.2-34.3c-11.6-29.5-28.4-37.4-28.4-37.4c-23.2-15.9 1.8-15.6 1.8-15.6c25.6 1.8 39.1 26.3 39.1 26.3c22.8 39.1 59.8 27.8 74.4 21.3c2.3-16.5 8.9-27.8 16.2-34.2c-56.8-6.5-116.6-28.4-116.6-126.5c0-28 10-50.8 26.4-68.7c-2.6-6.5-11.4-32.5 2.5-67.8c0 0 21.5-6.9 70.4 26.3c20.4-5.7 42.3-8.5 64-8.6c21.7 .1 43.6 2.9 64 8.6c48.9-33.2 70.4-26.3 70.4-26.3c13.9 35.3 5.2 61.3 2.6 67.8c16.4 17.9 26.4 40.7 26.4 68.7c0 98.3-59.9 120-116.9 126.3c9.2 7.9 17.4 23.5 17.4 47.4c0 34.2-.3 61.8-.3 70.3c0 6.8 4.7 14.8 17.6 12.3C438.6 465.3 512 369.3 512 256C512 114.6 397.4 0 256 0z"/></svg>${data.contact.github.replace(/https?:\/\/(www\.)?github\.com\//, '')}</a>`,
  ].filter(Boolean).join('\n            ');

  const expHtml = data.experience?.map(exp => `
          <div class="job-entry">
            <div class="job-title-row"><span>${exp.position}${exp.company ? ` — ${exp.company}` : ''}</span><span>${exp.location ? `${exp.location} | ` : ''}${formatDate(exp.startDate)}${exp.endDate ? ` – ${formatDate(exp.endDate)}` : ' – Present'}</span></div>
            <ul>${exp.description.map(d => `\n              <li>${d}</li>`).join('')}
            </ul>
            ${exp.technologies ? `<p style="margin:4px 0 0;font-size:9.5pt"><strong>Technologies:</strong> ${exp.technologies}</p>` : ''}
          </div>`).join('') || '';

  const skillsHtml = data.skills?.length
    ? Object.entries(
      data.skills.reduce<Record<string, string[]>>((acc, s) => {
        const cat = s.category || 'Frontend (Main Experience)';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(s.name);
        return acc;
      }, {})
    )
      .map(([cat, names]) => `<p style="margin:0 0 4px;font-size:9.5pt"><strong>${cat}:</strong> ${names.join(', ')}</p>`)
      .join('')
    : '';

  const eduEntries = data.education?.filter(e => e.institution && e.degree) || [];
  const eduHtml = eduEntries.map(edu => `
          <div class="job-entry" style="margin-bottom:0">
            <div class="job-title-row"><span>${edu.degree}${edu.fieldOfStudy ? ` — ${edu.fieldOfStudy}` : ''}</span><span>${edu.institution}${edu.location ? `, ${edu.location}` : ''}</span></div>
            <div style="font-size:9pt;color:#555;margin-bottom:6px">${formatDate(edu.startDate)}${edu.endDate ? ` – ${formatDate(edu.endDate)}` : ''}</div>
          </div>`).join('') || '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  @page { size: A4; margin: 15mm 15mm; }
  body { font-family: Arial, Helvetica, sans-serif; color: #000; line-height: 1.3; font-size: 9.5pt; margin: 40px 70px; padding: 0; }
  .header { text-align: center; margin-bottom: 20px; }
  h1 { font-family: 'Times New Roman', Times, serif; font-size: 26pt; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 4px; font-weight: normal; }
  .contact-row { font-size: 8.5pt; text-align: center; display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 15px; }
  .contact-item { display: inline-flex; align-items: center; text-decoration: none; color: black; }
  .icon { width: 10pt; height: 10pt; margin-right: 5px; fill: currentColor; }
  .section-title { font-size: 10.5pt; font-weight: bold; border-bottom: 1px solid #000; margin-top: 18px; margin-bottom: 8px; padding-bottom: 1px; text-transform: uppercase; letter-spacing: 1px; }
  .profile-text { margin-bottom: 15px; text-align: justify; }
  .job-entry { margin-bottom: 12px; }
  .job-title-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 10pt; margin-bottom: 4px; }
  ul { margin: 0 0 8px 18px; padding: 0; }
  li { margin-bottom: 3px; }
  .job-entry { page-break-inside: avoid; }
  .section-title { page-break-after: avoid; }
</style>
</head>
<body>
  <div class="header">
    <h1>${data.name || 'YOUR NAME'}</h1>
    <div class="contact-row">${contactRow}
    </div>
  </div>

  ${data.title ? `<div class="section-title">${data.title.toUpperCase()}</div>${data.summary ? `<div class="profile-text">${data.summary}</div>` : ''}` : ''}

  ${data.experience?.length ? `<div class="section-title">Experience</div>${expHtml}` : ''}

  ${skillsHtml ? `<div class="section-title">Skills</div><div class="profile-text">${skillsHtml}</div>` : ''}

  ${eduEntries.length ? `<div class="section-title">Education</div>${eduHtml}` : ''}
</body>
</html>`;
}

export const CVViewer: React.FC<CVViewerProps> = ({ initialData, onCVChange }) => {
  const [cvData, setCvData] = useState<CVData>(initialData);
  const [activeSection, setActiveSection] = useState<SectionKey>('header');
  const [previewTab, setPreviewTab] = useState<PreviewTab>('preview');
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData)); } catch { }
  }, [cvData]);

  const updateData = useCallback((partial: Partial<CVData>) => {
    setCvData(prev => {
      const updated = { ...prev, ...partial };
      onCVChange(updated);
      return updated;
    });
  }, [onCVChange]);

  const handleExportPDF = () => {
    const element = previewRef.current;
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number],
      filename: 'frontend-developer-julian-velandia.pdf',
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(element).save();
  };

  const sections: { key: SectionKey; label: string }[] = [
    { key: 'header', label: 'Header' },
    { key: 'summary', label: 'Summary' },
    { key: 'skills', label: 'Skills' },
    { key: 'experience', label: 'Experience' },
    { key: 'education', label: 'Education' },
    { key: 'ai-assist', label: 'AI Assist' },
  ];

  return (
    <div className="cv-workspace">
      <header className="workspace-toolbar">
        <div className="toolbar-left">
          <h1 className="toolbar-title">CV Builder</h1>
          <span className="toolbar-badge">Workspace</span>
        </div>
        <div className="toolbar-right">
          <button className="btn btn-outline" onClick={() => setCvData({ ...SEED_CV_DATA })}>
            Load My Profile
          </button>
          <button className="btn btn-outline" onClick={() => setCvData({ ...initialData })}>
            Reset
          </button>
          <button className="btn btn-ghost" onClick={() => setPreviewTab(previewTab === 'preview' ? 'html' : 'preview')}>
            {previewTab === 'preview' ? 'View HTML' : 'Live Preview'}
          </button>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            Export PDF
          </button>
        </div>
      </header>

      <div className="workspace-body">
        <aside className="workspace-sidebar">
          <nav className="section-nav">
            {sections.map(s => (
              <button
                key={s.key}
                className={`section-nav-btn ${activeSection === s.key ? 'active' : ''}`}
                onClick={() => setActiveSection(s.key)}
              >
                <span className="nav-dot" />
                {s.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="workspace-editor">
          <div className="editor-panel">
            <div className={`editor-section ${activeSection === 'header' ? 'visible' : 'hidden'}`}>
              <HeaderSection data={cvData} onChange={updateData} />
            </div>
            <div className={`editor-section ${activeSection === 'summary' ? 'visible' : 'hidden'}`}>
              <SummarySection data={cvData} onChange={updateData} />
            </div>
            <div className={`editor-section ${activeSection === 'skills' ? 'visible' : 'hidden'}`}>
              <SkillsSection data={cvData} onChange={updateData} />
            </div>
            <div className={`editor-section ${activeSection === 'experience' ? 'visible' : 'hidden'}`}>
              <ExperienceSection data={cvData} onChange={updateData} />
            </div>
            <div className={`editor-section ${activeSection === 'education' ? 'visible' : 'hidden'}`}>
              <EducationSection data={cvData} onChange={updateData} />
            </div>
            <div className={`editor-section ${activeSection === 'ai-assist' ? 'visible' : 'hidden'}`}>
              <JobAnalysisSection data={cvData} onChange={updateData} />
            </div>
          </div>
        </main>

        <aside className="workspace-preview">
          <div className="preview-header">
            <h2>{previewTab === 'preview' ? 'A4 Preview' : 'HTML Source'}</h2>
            <span className="preview-badge">A4</span>
          </div>
          <div className="preview-viewport">
            {previewTab === 'preview' ? (
              <div className="a4-preview" ref={previewRef} id="cv-preview">
                <CVPreview data={cvData} />
              </div>
            ) : (
              <div className="html-viewer">
                <pre className="html-code">{getHtmlContent(cvData)}</pre>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
