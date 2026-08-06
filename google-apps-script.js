/**
 * Google Apps Script - ई-साक्ष्य मॉनीटरिंग Form Backend
 * 
 * Spreadsheet: e-Sakshya Nominated officers List Dist Ayodhya
 * ID: 1Iw-lkFgCHBZZRnJsAL7FuwbaZrWpb13-ZeE186H11RU
 * 
 * SETUP INSTRUCTIONS:
 * ==================
 * 1. Open this Google Sheet:
 *    https://docs.google.com/spreadsheets/d/1Iw-lkFgCHBZZRnJsAL7FuwbaZrWpb13-ZeE186H11RU/edit
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire file
 * 4. Click Save (Ctrl+S)
 * 5. Click Deploy → New Deployment
 * 6. Select type: "Web app"
 * 7. Settings:
 *     - Description: "ई-साक्ष्य मॉनीटरिंग API"
 *     - Execute as: Me
 *     - Who has access: Anyone
 * 8. Click Deploy → Authorize → Allow
 * 9. Copy the Web App URL
 * 10. Paste the URL into src/services/GoogleSheetsService.js (GOOGLE_SCRIPT_URL variable)
 */

const SPREADSHEET_ID = '1Iw-lkFgCHBZZRnJsAL7FuwbaZrWpb13-ZeE186H11RU';
const SHEET_NAME = 'Sheet1';

/**
 * Initialize headers if the sheet is empty
 */
function initializeHeaders(sheet) {
  const firstRow = sheet.getRange(1, 1, 1, 9).getValues()[0];
  const isEmpty = firstRow.every(cell => cell === '');
  
  if (isEmpty) {
    const headers = [
      'Timestamp (दिनांक)',
      'Station (थाना)',
      'District (जनपद)',
      'Serial No. (क्र0सं0)',
      'Officer Thana (थाना)',
      'PNO (पी0एन0ओ0)',
      'Designation (पदनाम)',
      'Officer Name (नाम)',
      'Mobile (मोबाइल)'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Style the header row
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#1a2980');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
}

/**
 * Handle POST requests from the form
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      return ContentService.createTextOutput(
        JSON.stringify({ success: false, message: 'Sheet "' + SHEET_NAME + '" not found' })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    // Initialize headers if needed
    initializeHeaders(sheet);

    const data = JSON.parse(e.postData.contents);
    const { timestamp, station, district, officers } = data;

    // Append each officer as a separate row
    officers.forEach(function(officer) {
      sheet.appendRow([
        timestamp,
        station,
        district,
        officer.serialNumber,
        officer.thana,
        officer.pno,
        officer.designation,
        officer.name,
        officer.mobile
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
