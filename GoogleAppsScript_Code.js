/**
 * =========================================================================
 * SWAYÉ - GOOGLE APPS SCRIPT WEB APP FOR RSVP REGISTRATION
 * =========================================================================
 * 
 * Instructions:
 * 1. Open Google Sheets (https://sheets.new)
 * 2. Rename the sheet tab at the bottom to: RSVPs (optional, defaults to active sheet)
 * 3. Go to Extensions -> Apps Script
 * 4. Replace code inside Code.gs with this entire file and click Save (Ctrl+S)
 * 5. Click "Deploy" (top-right button) -> "Manage deployments" -> Click Edit (pencil icon)
 * 6. Under "Version", select "New version"
 * 7. Ensure "Who has access" is set to "Anyone"
 * 8. Click "Deploy"
 * =========================================================================
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for other concurrent requests to release lock
  lock.tryLock(10000);

  try {
    var doc = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = doc.getSheetByName("RSVPs") || doc.getActiveSheet();

    // If sheet is brand new / empty, initialize header row with luxury styling
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Submission Timestamp",
        "Pass Tier",
        "Total Price",
        "Guest 1 Name",
        "Guest 1 Instagram Profile Link",
        "Guest 2 Name (Couple)",
        "Guest 2 Instagram Profile Link (Couple)",
        "Phone / WhatsApp",
        "Status"
      ]);

      // Style header row
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#b31b54");
      headerRange.setFontColor("#ffffff");
      headerRange.setFontWeight("bold");
      headerRange.setFontFamily("Montserrat");
      sheet.setFrozenRows(1);
    }

    var data;
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter;
      }
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }

    // Format IST Date & Time
    var timestamp = Utilities.formatDate(new Date(), "Asia/Kolkata", "dd-MMM-yyyy hh:mm:ss a");
    var passTier = data.passTier || "Single Pass";
    var totalPrice = data.totalPrice || "₹999";
    var guest1Name = data.guest1Name || data.name || "";
    var guest1Insta = data.guest1Instagram || data.insta || "";
    var guest2Name = data.guest2Name || data.name2 || "N/A";
    var guest2Insta = data.guest2Instagram || data.insta2 || "N/A";
    var phone = data.contactNumber || data.phone || "";
    var status = "Pending Confirmation";

    // Append submission row to sheet
    sheet.appendRow([
      timestamp,
      passTier,
      totalPrice,
      guest1Name,
      guest1Insta,
      guest2Name,
      guest2Insta,
      phone,
      status
    ]);

    // Return JSON success response
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "success", "message": "RSVP recorded successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ "result": "error", "error": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      "status": "online", 
      "service": "Swayé Event RSVP Webhook",
      "timestamp": new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
