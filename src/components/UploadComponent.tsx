import { useState } from 'react';
import { parsePdfFile } from '../lib/parsePdf';
import type { CVData } from '../lib/parsePdf';

interface UploadComponentProps {
  onCVParse: (data: CVData) => void;
}

export const UploadComponent: React.FC<UploadComponentProps> = ({ onCVParse }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const cvData = await parsePdfFile(file);
      onCVParse(cvData);
    } catch (err) {
      console.error(err);
      setError('Failed to parse PDF. Please try another file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-section">
      <div className="upload-card">
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        </div>
        <h2 className="upload-title">Upload your CV</h2>
        <p className="upload-subtitle">Import an existing PDF to get started quickly</p>
        <div className="upload-dropzone">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            disabled={loading}
            id="file-input"
          />
          <label htmlFor="file-input" className="upload-label">
            {file ? file.name : 'Choose PDF file'}
          </label>
        </div>
        <button
          className="upload-btn"
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? 'Processing...' : 'Start Editing'}
        </button>
        {error && <p className="upload-error">{error}</p>}
      </div>
    </div>
  );
};
