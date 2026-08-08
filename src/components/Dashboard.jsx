import React, { useState, useEffect, useMemo } from 'react';
import stationData from '../data/policeStations.json';
import { fetchGoogleSheetData } from '../services/GoogleSheetsService.js';

export default function Dashboard({ onBack }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [selectedStationDetails, setSelectedStationDetails] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetchGoogleSheetData();
        if (response.success) {
          setData(response.data || []);
          setIsDemo(!!response.demo);
        } else if (response.status === 'active') {
          // Detected old script version
          setErrorMsg('Google Apps Script का पुराना संस्करण सक्रिय है। कृपया Apps Script संपादक में जाकर "New Deployment" या "Manage Deployments" से "New Version" चुनकर पुनः डिप्लॉय करें ताकि डेटा डैशबोर्ड में प्रदर्शित हो सके। (वर्तमान में डेमो डेटा दिखाया जा रहा है)');
          setIsDemo(true);
          // Load helper mock data so dashboard is still viewable
          const mockDataRes = await fetchGoogleSheetData(); // service falls back to mock if url doesn't match
          setData(mockDataRes.data || []);
        } else {
          setErrorMsg(response.message || 'डेटा लोड करने में विफल।');
          setData(response.data || []); // Fallback mock data
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setErrorMsg('सर्वर से डेटा लोड करने में त्रुटि हुई।');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleBarClick = (stationName, count) => {
    if (count === 0) return;
    
    // Find all officers under this station
    const officersForStation = data.filter(row => {
      const st = (row.station || row.thana || '').toString().trim();
      return st === stationName.trim();
    });

    setSelectedStationDetails({
      name: stationName,
      officers: officersForStation
    });
  };

  // Compute stats
  const stats = useMemo(() => {
    const totalStationsList = stationData.policeStations;
    
    // Group records by station to get total officers nominated
    const stationNominations = {};
    totalStationsList.forEach(st => {
      stationNominations[st] = new Set();
    });

    data.forEach(row => {
      const st = (row.station || row.thana || '').toString().trim();
      if (st && totalStationsList.includes(st)) {
        const pno = (row.pno || '').toString().trim();
        if (pno) {
          stationNominations[st].add(pno);
        }
      }
    });

    const submittedStations = [];
    const notSubmittedStations = [];
    const nominationsCountMap = {}; // station -> count

    totalStationsList.forEach(st => {
      const count = stationNominations[st].size;
      nominationsCountMap[st] = count;
      if (count > 0) {
        submittedStations.push({ name: st, count });
      } else {
        notSubmittedStations.push(st);
      }
    });

    // Nomination Distribution: count how many stations nominated 0, 1, 2, 3, etc.
    const distMap = { 0: 0, 1: 0, 2: 0, 3: 0, '3+': 0 };
    totalStationsList.forEach(st => {
      const count = nominationsCountMap[st];
      if (count === 0) distMap[0]++;
      else if (count === 1) distMap[1]++;
      else if (count === 2) distMap[2]++;
      else if (count === 3) distMap[3]++;
      else distMap['3+']++;
    });

    // Designation stats for Pie Chart
    const designationCounts = { 'उ0नि0': 0, 'मु0आ0': 0, 'आरक्षी': 0, 'क0आ0': 0 };
    data.forEach(row => {
      if (row.designation && designationCounts[row.designation] !== undefined) {
        designationCounts[row.designation]++;
      }
    });

    // Submissions over time (Line Chart)
    const dateCounts = {};
    data.forEach(row => {
      if (row.timestamp) {
        let dateKey = 'Unknown';
        try {
          const match = row.timestamp.match(/\d+[\/\-]\d+[\/\-]\d+/);
          if (match) {
            dateKey = match[0];
          } else {
            dateKey = row.timestamp.substring(0, 10).trim();
          }
        } catch (e) {
          dateKey = 'Other';
        }
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(dateCounts)
      .sort((a, b) => new Date(a) - new Date(b))
      .slice(-7); // last 7 days

    const timelineData = sortedDates.map(date => ({
      date,
      count: dateCounts[date]
    }));

    return {
      submittedStations,
      notSubmittedStations,
      nominationsCountMap,
      distribution: distMap,
      designations: designationCounts,
      timeline: timelineData,
      totalNominations: data.length
    };
  }, [data]);

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="spinner spinner-dark" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></div>
        <p style={{ marginTop: '1rem', fontFamily: 'Noto Sans Devanagari', fontWeight: 600 }}>आंकड़े लोड हो रहे हैं, कृपया प्रतीक्षा करें...</p>
      </div>
    );
  }

  // Maximum value for Bar Chart scaling
  const maxNominations = Math.max(...Object.values(stats.nominationsCountMap), 1);

  return (
    <div className="dashboard-wrapper">
      {/* Top Navigation */}
      <div className="dashboard-nav no-print">
        <button className="btn-back" onClick={onBack}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          नामांकन फॉर्म पर वापस जायें
        </button>
        <div className="dashboard-nav-title">
          📊 सांख्यिकी डैशबोर्ड (E-Sakshya Statistics)
        </div>
      </div>

      {isDemo && (
        <div className="demo-banner no-print">
          ℹ️ <strong>डेमो मोड:</strong> यह डेमो डेटा प्रदर्शित कर रहा है। अपना Google Apps Script URL जोड़ने पर वास्तविक डेटा प्रदर्शित होगा।
        </div>
      )}

      {errorMsg && !isDemo && (
        <div className="error-banner no-print">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Grid Layout for Charts */}
      <div className="dashboard-grid">
        
        {/* Metric Cards */}
        <div className="card metric-card">
          <div className="metric-title">कुल नामांकित पुलिसकर्मी</div>
          <div className="metric-val">{stats.totalNominations}</div>
        </div>
        <div className="card metric-card">
          <div className="metric-title">विवरण जमा करने वाले थाने</div>
          <div className="metric-val" style={{ color: '#27ae60' }}>
            {stats.submittedStations.length} / {stationData.policeStations.length}
          </div>
        </div>
        <div className="card metric-card">
          <div className="metric-title">शेष (लंबित) थाने</div>
          <div className="metric-val" style={{ color: '#e74c3c' }}>
            {stats.notSubmittedStations.length}
          </div>
        </div>

        {/* 1. Bar Chart: Nominations per Station */}
        <div className="card chart-card col-span-2">
          <h3 className="chart-title">🚨 थानावार नामांकित अधिकारियों की संख्या (Bar Chart)</h3>
          <div className="bar-chart-container">
            {Object.keys(stats.nominationsCountMap).map(st => {
              const count = stats.nominationsCountMap[st];
              const pct = (count / maxNominations) * 100;
              return (
                <div 
                  key={st} 
                  className={`bar-row ${count > 0 ? 'clickable-bar' : ''}`}
                  onClick={() => handleBarClick(st, count)}
                  style={count > 0 ? { cursor: 'pointer' } : {}}
                >
                  <div className="bar-label">{st}</div>
                  <div className="bar-wrapper">
                    <div 
                      className={`bar-fill ${count > 0 ? 'active-bar' : 'empty-bar'}`} 
                      style={{ width: `${Math.max(pct, 3)}%` }}
                    >
                      {count > 0 && <span className="bar-value">{count}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Pie Chart & Distribution */}
        <div className="card chart-card">
          <h3 className="chart-title">👮 पदनाम वितरण (Designation Pie Chart)</h3>
          <div className="pie-chart-section">
            {/* Custom SVG Pie Chart */}
            <div className="svg-pie-wrapper">
              <svg width="160" height="160" viewBox="0 0 32 32" className="pie-svg">
                {(() => {
                  const total = Object.values(stats.designations).reduce((a, b) => a + b, 0) || 1;
                  let accumulatedPercent = 0;
                  const colors = ['#1a2980', '#f39c12', '#2ecc71', '#e74c3c'];
                  
                  return Object.keys(stats.designations).map((desg, idx) => {
                    const val = stats.designations[desg];
                    const pct = (val / total) * 100;
                    if (pct === 0) return null;
                    
                    const strokeDasharray = `${pct} ${100 - pct}`;
                    const strokeDashoffset = 100 - accumulatedPercent + 25; // start from top (12 o'clock)
                    accumulatedPercent += pct;

                    return (
                      <circle
                        key={desg}
                        cx="16"
                        cy="16"
                        r="15.915"
                        fill="transparent"
                        stroke={colors[idx]}
                        strokeWidth="3.2"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                      />
                    );
                  });
                })()}
              </svg>
            </div>
            
            {/* Legend */}
            <div className="pie-legend">
              {Object.keys(stats.designations).map((desg, idx) => {
                const colors = ['#1a2980', '#f39c12', '#2ecc71', '#e74c3c'];
                return (
                  <div key={desg} className="legend-item">
                    <span className="legend-dot" style={{ backgroundColor: colors[idx] }}></span>
                    <span className="legend-text">{desg}: <strong>{stats.designations[desg]}</strong></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 4. Distribution Count Cards */}
        <div className="card chart-card col-span-3">
          <h3 className="chart-title">📊 नामांकन लक्ष्य वितरण (Nomination Target Distribution)</h3>
          <p className="distribution-subtitle">कितने थानों ने कितने पुलिसकर्मियों को नामांकित किया है:</p>
          <div className="dist-cards-container">
            {Object.keys(stats.distribution).map(count => {
              const stationsNum = stats.distribution[count];
              return (
                <div key={count} className="dist-count-card">
                  <div className="dist-label">
                    {count === '3+' ? '3 से अधिक' : `${count} पुलिसकर्मी`}
                  </div>
                  <div className="dist-value">{stationsNum} <span className="dist-unit">थाने</span></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Submitted list of Police Stations */}
        <div className="card list-card col-span-2">
          <h3 className="list-title" style={{ color: '#27ae60', borderBottomColor: '#2ebd67' }}>
            ✅ विवरण भेजने वाले थाने ({stats.submittedStations.length})
          </h3>
          {stats.submittedStations.length === 0 ? (
            <div className="empty-list-placeholder">अभी किसी थाने से विवरण प्राप्त नहीं हुआ है।</div>
          ) : (
            <ul className="station-ul">
              {stats.submittedStations.map(st => (
                <li key={st.name} className="station-li">
                  <span className="station-li-name">{st.name}</span>
                  <span className="station-li-badge">{st.count} नामांकित</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 6. Pending list of Police Stations */}
        <div className="card list-card">
          <h3 className="list-title" style={{ color: '#e74c3c', borderBottomColor: '#eb5e4f' }}>
            ❌ विवरण न भेजने वाले लंबित थाने ({stats.notSubmittedStations.length})
          </h3>
          {stats.notSubmittedStations.length === 0 ? (
            <div className="empty-list-placeholder" style={{ color: '#27ae60' }}>🎉 सभी थानों से विवरण प्राप्त हो गया है!</div>
          ) : (
            <ul className="station-ul">
              {stats.notSubmittedStations.map(st => (
                <li key={st} className="station-li pending-li">
                  <span className="station-li-name">{st}</span>
                  <span className="pending-badge">लंबित</span>
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>

      {/* Drawer Overlay and Bottom Sheet */}
      {selectedStationDetails && (
        <>
          <div 
            className="drawer-overlay active" 
            onClick={() => setSelectedStationDetails(null)}
          ></div>
          <div className="bottom-drawer active">
            <div className="drawer-header">
              <div className="drawer-title">
                🏢 {selectedStationDetails.name} - नामांकित अधिकारी विवरण
              </div>
              <button 
                className="btn-close-drawer" 
                onClick={() => setSelectedStationDetails(null)}
              >
                &times;
              </button>
            </div>
            <div className="drawer-body">
              {selectedStationDetails.officers.length === 0 ? (
                <div className="empty-list-placeholder">कोई नामांकित अधिकारी उपलब्ध नहीं हैं।</div>
              ) : (
                <div className="drawer-officers-list">
                  {selectedStationDetails.officers.map((off, oIdx) => (
                    <div key={oIdx} className="drawer-officer-card">
                      <div className="officer-card-header">
                        <span className="officer-badge-rank">{off.designation || 'पदनाम अनुपलब्ध'}</span>
                        {off.pno && (
                          <span className="officer-pno">
                            PNO: {off.pno.toString().trim().substring(0, 4) + 'X'.repeat(Math.max(0, off.pno.toString().trim().length - 4))}
                          </span>
                        )}
                      </div>
                      <div className="officer-name-title">{off.name}</div>
                      <div className="officer-contact-row">
                        <a href={`tel:${off.mobile}`} className="officer-phone-link">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                          {off.mobile}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
