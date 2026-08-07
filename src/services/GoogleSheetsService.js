/**
 * Google Sheets Integration Service
 * 
 * This service sends form data to a Google Spreadsheet via Google Apps Script Web App.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet
 * 2. Go to Extensions → Apps Script
 * 3. Paste the code from /google-apps-script.js
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web App URL and paste it below
 */

// Deployed Google Apps Script Web App URL for e-Sakshya Nominated officers List Dist Ayodhya sheet
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzZZGn6EEHY5xsKDunaMXRPGGiHX7W7VdOjvJEkRY01YZAIedLUCea6MiCFuDHbwpgAQ/exec';

/**
 * Save form data to Google Spreadsheet
 * @param {Object} formData - The form data to save
 * @returns {Promise<Object>} - Response from Google Apps Script
 */
export async function saveToGoogleSheet(formData) {
  // If the URL hasn't been configured, simulate a successful save
  if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL') {
    console.warn(
      '⚠️ Google Sheets URL not configured. Running in demo mode.\n' +
      'To connect to Google Sheets, follow the setup instructions in GoogleSheetsService.js'
    );
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      success: true, 
      message: 'डेमो मोड: डेटा सफलतापूर्वक सेव किया गया (Google Sheets कनेक्ट करने के लिए URL कॉन्फ़िगर करें)',
      demo: true 
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    // With no-cors mode, we can't read the response body
    // But a successful fetch means the request was sent
    return { 
      success: true, 
      message: 'सफलतापूर्वक सुरक्षित किया गया' 
    };
  } catch (error) {
    console.error('Error saving to Google Sheets:', error);
    return { 
      success: false, 
      message: 'डेटा सेव करने में त्रुटि हुई। कृपया पुनः प्रयास करें।' 
    };
  }
}

export async function fetchGoogleSheetData() {
  const SPREADSHEET_ID = '1Iw-lkFgCHBZZRnJsAL7FuwbaZrWpb13-ZeE186H11RU';
  const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const text = await response.text();
    
    // Parse the JSONP-like format /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const startIdx = text.indexOf('{');
    const endIdx = text.lastIndexOf('}');
    if (startIdx === -1 || endIdx === -1) {
      throw new Error('Invalid JSON format from Google Sheets');
    }
    
    const jsonStr = text.substring(startIdx, endIdx + 1);
    const result = JSON.parse(jsonStr);
    
    if (result.status !== 'ok') {
      throw new Error('Google query status not ok');
    }

    const rows = result.table.rows || [];
    const formattedData = rows.map(row => {
      const cells = row.c || [];
      return {
        timestamp: cells[0] ? (cells[0].f || cells[0].v || '') : '',
        station: cells[1] ? (cells[1].v || '') : '',
        district: cells[2] ? (cells[2].v || '') : '',
        serialNumber: cells[3] ? (cells[3].v || '') : '',
        thana: cells[4] ? (cells[4].v || '') : '',
        pno: cells[5] ? (cells[5].f || cells[5].v || '') : '', // string representation
        designation: cells[6] ? (cells[6].v || '') : '',
        name: cells[7] ? (cells[7].v || '') : '',
        mobile: cells[8] ? (cells[8].f || cells[8].v || '') : '' // string representation
      };
    });

    return {
      success: true,
      data: formattedData
    };
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return {
      success: false,
      message: 'डेटा लोड करने में असमर्थ। (नेटवर्क समस्या या अमान्य अनुमतियां)',
      data: getMockDashboardData() // fallback to mock data
    };
  }
}

/**
 * Helper to generate mock data for demo / fallback mode
 */
function getMockDashboardData() {
  const stations = [
    'अयोध्या कैंट', 'इनायत नगर', 'कुमारगंज', 'कोतवाली अयोध्या', 'कोतवाली नगर', 
    'कोतवाली बीकापुर', 'खंडासा'
  ];
  const designations = ['उ0नि0', 'मु0आ0', 'आरक्षी', 'क0आ0'];
  const mockRows = [];
  
  // Let's populate some nominations
  // Station 1: 3 nominations
  stations.slice(0, 4).forEach((station, sIdx) => {
    // Nominate 1, 2, or 3 officers
    const count = (sIdx % 3) + 1; // 1, 2, or 3
    for (let i = 0; i < count; i++) {
      mockRows.push({
        timestamp: new Date(Date.now() - (sIdx * 24 * 60 * 60 * 1000)).toLocaleString('hi-IN'),
        station: station,
        district: 'अयोध्या',
        thana: station,
        pno: '987654' + sIdx + i,
        designation: designations[(sIdx + i) % designations.length],
        name: 'अधिकारी ' + (sIdx * 3 + i + 1),
        mobile: '99887766' + sIdx + i
      });
    }
  });
  
  return mockRows;
}

/**
 * Format form data for spreadsheet storage
 * @param {string} selectedStation - Selected police station
 * @param {Array} officers - Array of officer data objects
 * @returns {Object} - Formatted data for the spreadsheet
 */
export function formatFormData(selectedStation, officers) {
  const timestamp = new Date().toLocaleString('hi-IN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  return {
    timestamp,
    station: selectedStation,
    district: 'अयोध्या',
    officers: officers.map((officer, index) => ({
      serialNumber: index + 1,
      thana: officer.thana || selectedStation,
      pno: officer.pno,
      designation: officer.designation,
      name: officer.name,
      mobile: officer.mobile,
    })),
  };
}
