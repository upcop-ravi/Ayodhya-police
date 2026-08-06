/**
 * Google Apps Script - ई-साक्ष्य मॉनीटरिंग Form Backend
 * 
 * SETUP INSTRUCTIONS:
 * ==================
 * 1. Go to Google Sheets: https://sheets.google.com
 * 2. Create a new spreadsheet named "ई-साक्ष्य मॉनीटरिंग - अयोध्या"
 * 3. Rename the first sheet tab to "Nominations"
 * 4. Add these headers in Row 1:
 *    A1: Timestamp
 *    B1: Station (थाना)
 *    C1: District (जनपद)
 *    D1: Serial No.
 *    E1: Officer Thana
 *    F1: PNO (पी0एन0ओ0)
 *    G1: Designation (पदनाम)
 *    H1: Officer Name (नाम)
 *    I1: Mobile (मोबाइल)
 * 
 * 5. Go to Extensions → Apps Script
 * 6. Delete any existing code and paste this entire file
 * 7. Click Save (Ctrl+S)
 * 8. Click Deploy → New Deployment
 * 9. Select type: "Web app"
 * 10. Settings:
 *     - Description: "ई-साक्ष्य मॉनीटरिंग API"
 *     - Execute as: Me
 *     - Who has access: Anyone
 * 11. Click Deploy
 * 12. Copy the Web App URL
 * 13. Paste the URL into src/services/GoogleSheetsService.js (GOOGLE_SCRIPT_URL variable)
 */

/**
 * Handle POST requests from the form
 */
function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Nominations');
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: 'Sheet "Nominations" not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    const data = JSON.parse(e.postData.contents);
    const { timestamp, station, district, officers } = data;

    // Append each officer as a separate row
    officers.forEach((officer) => {
      sheet.appendRow([
        timestamp,
        station,
        district,
        officer.serialNumber,
        officer.thana,
        officer.pno,
        officer.designation,
        officer.name,
        officer.mobile,
      ]);
    });

    // Auto-resize columns for readability
    sheet.autoResizeColumns(1, 9);

    return ContentService.createTextOutput(
      JSON.stringify({ 
        success: true, 
        message: 'Data saved successfully',
        rowsAdded: officers.length 
      })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing)
 */
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ 
      status: 'active', 
      message: 'ई-साक्ष्य मॉनीटरिंग API is running',
      version: '1.0'
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
