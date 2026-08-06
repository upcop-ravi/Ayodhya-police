import React, { useState, useCallback } from 'react';
import NominationForm from './components/NominationForm.jsx';
import PreviewPage from './components/PreviewPage.jsx';
import Toast from './components/Toast.jsx';
import { saveToGoogleSheet, formatFormData } from './services/GoogleSheetsService.js';

function createEmptyOfficer() {
  return {
    id: Date.now() + Math.random(),
    thana: '',
    pno: '',
    designation: '',
    name: '',
    mobile: '',
  };
}

export default function App() {
  const [currentView, setCurrentView] = useState('form'); // 'form' or 'preview'
  const [selectedStation, setSelectedStation] = useState('');
  const [officers, setOfficers] = useState([
    createEmptyOfficer(),
    createEmptyOfficer(),
  ]);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSaveAndPreview = useCallback(
    async () => {
      if (!selectedStation) {
        alert('कृपया थाना चुनें');
        return;
      }
      try {
        // Format the data
        const formData = formatFormData(selectedStation, officers);

        // Save to Google Sheets
        const result = await saveToGoogleSheet(formData);

        if (result.success) {
          showToast(result.message, result.demo ? 'info' : 'success');

          // Wait a moment to show the toast, then switch to preview
          setTimeout(() => {
            setCurrentView('preview');
          }, 1500);
        } else {
          showToast(result.message, 'error');
        }
      } catch (error) {
        showToast('एक अप्रत्याशित त्रुटि हुई। कृपया पुनः प्रयास करें।', 'error');
        console.error('Save error:', error);
      }
    },
    [selectedStation, officers, showToast]
  );

  const handleBackToForm = useCallback(() => {
    setCurrentView('form');
  }, []);

  return (
    <>
      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Route between Form and Preview */}
      {currentView === 'form' ? (
        <NominationForm
          selectedStation={selectedStation}
          setSelectedStation={setSelectedStation}
          officers={officers}
          setOfficers={setOfficers}
          onSaveAndPreview={handleSaveAndPreview}
        />
      ) : (
        <PreviewPage
          selectedStation={selectedStation}
          officers={officers}
          onBack={handleBackToForm}
        />
      )}
    </>
  );
}
