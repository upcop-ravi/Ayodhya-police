import React, { useState, useCallback } from 'react';
import stationData from '../data/policeStations.json';

const UP_POLICE_LOGO = '/logo-up-police.webp';

const DESCRIPTION_TEXT = `ई-साक्ष्य पोर्टल की मॉनीटरिंग हेतु थाना स्थानीय पर नियुक्त निम्न अधिकारी/कर्मचारीगणों को नामित किया जाता है, निम्न अधिकारी/कर्मचारीगणों को अवगत कराया जाता है कि उनके द्वारा नियमित रूप से थाना स्तर पर विवेचकगणों से समन्वय स्थापित कर उनको ई-साक्ष्य पोर्टल पर आ रही समस्याओं को निस्तारित करवाते हुए यह सुनिश्चित करना होगा की उनके द्वारा सभी मुकदमों में SID समय से निर्मित की जा रही हैं व समस्त FIR को SID से फाइनल लिंकिंग समय से पूर्ण कराया जा रहा है।`;

const TABLE_HEADERS = [
  'क्र0सं0',
  'थाना',
  'पी0एन0ओ0',
  'पदनाम',
  'अधिकारी/कर्मचारी नाम',
  'मोबाइल नम्बर',
];

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

export default function NominationForm({ selectedStation, setSelectedStation, officers, setOfficers, onSaveAndPreview }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleStationChange = useCallback((e) => {
    setSelectedStation(e.target.value);
  }, []);

  const handleOfficerChange = useCallback((id, field, value) => {
    setOfficers(prev =>
      prev.map(officer =>
        officer.id === id ? { ...officer, [field]: value } : officer
      )
    );
  }, []);

  const handleAddRow = useCallback(() => {
    setOfficers(prev => [...prev, createEmptyOfficer()]);
  }, []);

  const handleDeleteRow = useCallback((id) => {
    setOfficers(prev => {
      if (prev.length <= 1) return prev; // Keep at least 1 row
      return prev.filter(officer => officer.id !== id);
    });
  }, []);

  const handleSaveAndPreview = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSaveAndPreview();
    } finally {
      setIsSaving(false);
    }
  }, [onSaveAndPreview]);

  return (
    <div className="form-page-wrapper">
      <div className="form-container">
        {/* Action Bar */}
        <div className="action-bar">
          <div className="action-bar-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            ई-साक्ष्य मॉनीटरिंग प्रपत्र
            <span className="badge">अयोध्या</span>
          </div>
          <button
            className="btn-save-preview"
            onClick={handleSaveAndPreview}
            disabled={isSaving}
            id="btn-save-preview"
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                सेव हो रहा है...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save and Preview
              </>
            )}
          </button>
        </div>

        {/* Header with Emblem */}
        <div className="form-header">
          <div className="emblem-container">
            <img
              src={UP_POLICE_LOGO}
              alt="उत्तर प्रदेश पुलिस"
              className="emblem-icon"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <h2 className="form-heading">
            अधिकारी/कर्मचारी ई-साक्ष्य मॉनीटरिंग थाना -{' '}
            <select
              className="station-dropdown"
              value={selectedStation}
              onChange={handleStationChange}
              id="station-selector"
            >
              <option value="">-- थाना चुनें --</option>
              {stationData.policeStations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </h2>
        </div>

        {/* Description */}
        <div className="form-description">
          <p>{DESCRIPTION_TEXT}</p>
        </div>

        {/* Table Section */}
        <div className="table-section">
          <div className="table-section-header">
            <div className="table-section-title">
              📋 नामित अधिकारी/कर्मचारी विवरण
            </div>
          </div>

          <div className="officer-table-wrapper">
            <table className="officer-table" id="officer-table">
              <thead>
                <tr>
                  {TABLE_HEADERS.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {officers.map((officer, index) => (
                  <tr key={officer.id}>
                    <td>
                      <span className="serial-number">{index + 1}</span>
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={officer.thana || selectedStation}
                        onChange={(e) =>
                          handleOfficerChange(officer.id, 'thana', e.target.value)
                        }
                      >
                        <option value="">-- थाना --</option>
                        {stationData.policeStations.map((station) => (
                          <option key={station} value={station}>
                            {station}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="पी0एन0ओ0"
                        value={officer.pno}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                          handleOfficerChange(officer.id, 'pno', val);
                        }}
                        maxLength={9}
                        inputMode="numeric"
                      />
                    </td>
                    <td>
                      <select
                        className="table-input"
                        value={officer.designation}
                        onChange={(e) =>
                          handleOfficerChange(
                            officer.id,
                            'designation',
                            e.target.value
                          )
                        }
                      >
                        <option value="">-- पदनाम --</option>
                        <option value="उ0नि0">उ0नि0</option>
                        <option value="मु0आ0">मु0आ0</option>
                        <option value="आरक्षी">आरक्षी</option>
                        <option value="क0आ0">क0आ0</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="नाम"
                        value={officer.name}
                        onChange={(e) =>
                          handleOfficerChange(officer.id, 'name', e.target.value)
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        className="table-input"
                        placeholder="मोबाइल नम्बर"
                        value={officer.mobile}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          handleOfficerChange(officer.id, 'mobile', val);
                        }}
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </td>
                    <td>
                      <button
                        className="btn-delete-row"
                        onClick={() => handleDeleteRow(officer.id)}
                        title="हटायें"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Row Button */}
          <div className="add-row-container">
            <button
              className="btn-add-row"
              onClick={handleAddRow}
              id="btn-add-row"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add More Officers
            </button>
          </div>
        </div>

        {/* Signature Section */}
        <div className="signature-section">
          <div className="signature-block">
            <div className="signature-line"></div>
            <div className="signature-text">
              प्रभारी निरीक्षक/थानाध्यक्ष
              <br />
              थाना - {selectedStation || '_______________'}
              <br />
              जनपद - अयोध्या
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
