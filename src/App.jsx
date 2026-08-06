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

      // Filter out completely blank rows
      const isRowBlank = (o) =>
        !o.pno.trim() && !o.designation && !o.name.trim() && !o.mobile.trim();

      const filledOfficers = officers.filter((o) => !isRowBlank(o));

      if (filledOfficers.length === 0) {
        alert('कृपया कम से कम एक अधिकारी/कर्मचारी की जानकारी भरें।');
        return;
      }

      // Check for partially filled rows
      const incompleteRow = filledOfficers.find(
        (o) => !o.pno.trim() || !o.designation || !o.name.trim() || !o.mobile.trim()
      );
      if (incompleteRow) {
        alert('कृपया सभी पंक्तियों में पी0एन0ओ0, पदनाम, नाम और मोबाइल नम्बर भरें।');
        return;
      }

      // Check PNO length (must be exactly 9 numeric digits)
      const invalidPnoRow = filledOfficers.find((o) => o.pno.trim().length !== 9);
      if (invalidPnoRow) {
        alert('पी0एन0ओ0 9 अंकों का होना आवश्यक है।');
        return;
      }

      // Check Mobile length (must be exactly 10 numeric digits)
      const invalidMobileRow = filledOfficers.find((o) => o.mobile.trim().length !== 10);
      if (invalidMobileRow) {
        alert('मोबाइल नम्बर 10 अंकों का होना आवश्यक है।');
        return;
      }

      try {
        // Format the data (use only filled officers)
        const formData = formatFormData(selectedStation, filledOfficers);

        // Save to Google Sheets
        const result = await saveToGoogleSheet(formData);

        if (result.success) {
          showToast('सफलतापूर्वक सुरक्षित किया गया', 'success');

          // Update state to remove blank rows before preview
          setOfficers(filledOfficers);

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
