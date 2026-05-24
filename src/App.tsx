import { useState, useEffect, useCallback } from 'react';
import type { CVData } from './lib/parsePdf';
import { UploadComponent } from './components/UploadComponent';
import { CVViewer } from './components/cv/CVViewer';
import { SEED_CV_DATA } from '../seed-cv-data';

const STORAGE_KEY = 'cv-creator-data';

function loadSavedData(): CVData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CVData;
  } catch {}
  return null;
}

function App() {
  const [cvData, setCvData] = useState<CVData | null>(() => loadSavedData() || SEED_CV_DATA);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cvData) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cvData));
      } catch {}
    }
  }, [cvData]);

  const handleFileUpload = useCallback((data: CVData) => {
    setError(null);
    setCvData(data);
  }, []);

  return (
    <>
      {cvData ? (
        <CVViewer initialData={cvData} onCVChange={setCvData} />
      ) : (
        <UploadComponent onCVParse={handleFileUpload} />
      )}
      {error && <div className="error-message">{error}</div>}
    </>
  );
}

export default App;
