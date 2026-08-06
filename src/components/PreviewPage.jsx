import React from 'react';

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

export default function PreviewPage({ selectedStation, officers, onBack }) {
  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('hi-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Filter out completely empty rows from preview
  const filledOfficers = officers.filter(
    (o) => o.thana || o.pno || o.designation || o.name || o.mobile
  );
  const displayOfficers = filledOfficers.length > 0 ? filledOfficers : officers;

  return (
    <div className="preview-wrapper">
      {/* Action Buttons (hidden in print) */}
      <div className="preview-actions">
        <button className="btn-back" onClick={onBack} id="btn-back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          वापस जायें
        </button>
        <button className="btn-print" onClick={handlePrint} id="btn-print">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9"/>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          प्रिंट करें
        </button>
      </div>

      {/* Preview Document */}
      <div className="preview-document" id="preview-document">
        {/* Letterhead */}
        <div className="preview-letterhead">
          <div className="preview-letterhead-top">
            <img
              src={UP_POLICE_LOGO}
              alt="उत्तर प्रदेश पुलिस"
              className="preview-emblem"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div>
              <div className="preview-org-name">उत्तर प्रदेश पुलिस</div>
              <div className="preview-sub-heading">
                कार्यालय - थाना {selectedStation || '_______________'}
              </div>
            </div>
          </div>
          <div className="preview-district">
            जनपद - अयोध्या
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
            दिनांक: {currentDate}
          </div>
        </div>

        {/* Body */}
        <div className="preview-body">
          {/* Title */}
          <div className="preview-title">
            अधिकारी/कर्मचारी ई-साक्ष्य मॉनीटरिंग थाना - {selectedStation || '_______________'}
          </div>

          {/* Description */}
          <p className="preview-description">{DESCRIPTION_TEXT}</p>

          {/* Officers Table */}
          <table className="preview-table">
            <thead>
              <tr>
                {TABLE_HEADERS.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayOfficers.map((officer, index) => (
                <tr key={officer.id || index}>
                  <td style={{ fontWeight: 700 }}>{index + 1}</td>
                  <td>{officer.thana || selectedStation || '-'}</td>
                  <td>{officer.pno || '-'}</td>
                  <td>{officer.designation || '-'}</td>
                  <td>{officer.name || '-'}</td>
                  <td>{officer.mobile || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Signature */}
          <div className="preview-signature">
            <div className="preview-signature-block">
              <div className="preview-signature-line"></div>
              <div className="preview-signature-text">
                प्रभारी निरीक्षक/थानाध्यक्ष
                <br />
                थाना - {selectedStation || '_______________'}
                <br />
                जनपद - अयोध्या
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="preview-footer">
          यह एक कम्प्यूटर जनित प्रपत्र है | ई-साक्ष्य मॉनीटरिंग सिस्टम - जनपद अयोध्या
        </div>
      </div>

      {/* Website Copyright Footer */}
      <div className="copyright-footer no-print" style={{ maxWidth: '900px', margin: '1rem auto 0', borderRadius: '8px' }}>
        © {new Date().getFullYear()} ई-साक्ष्य मॉनीटरिंग प्रणाली - उत्तर प्रदेश पुलिस, जनपद अयोध्या | सर्वाधिकार सुरक्षित
      </div>
    </div>
  );
}
