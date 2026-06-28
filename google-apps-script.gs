/*
  Google Apps Script Web App to receive JSON POST requests and append to a Google Sheet.
  Steps:
  1. Create a Google Sheet and rename the first sheet to "Members".
  2. In Extensions -> Apps Script, create a new project and paste this file.
  3. Deploy -> New deployment -> Select "Web app" -> Execute as: Me, Who has access: Anyone
  4. Copy the Web App URL and set it in `app.js` as GAS_URL.
*/

// Set this to your target Google Sheet ID (from the sheet URL). If left empty, script will use the active spreadsheet when bound.
var SHEET_ID = '1PE2QkUEvdti8JwWrp55kkAxRZuLT3p_xDmIDLf6mwck';

function doPost(e){
  try{
    var data = {};
    if(e.postData && e.postData.contents){
      try{
        data = JSON.parse(e.postData.contents);
      }catch(err){
        // ignore, try parameter-based payload below
      }
    }

    // If client sent form-encoded payload (payload=JSON), read it
    if((!data || Object.keys(data).length===0) && e.parameter && e.parameter.payload){
      try{ data = JSON.parse(e.parameter.payload); }catch(err){ /* ignore */ }
    }

    var ss;
    if(SHEET_ID && SHEET_ID.length>5){
      ss = SpreadsheetApp.openById(SHEET_ID);
    } else {
      ss = SpreadsheetApp.getActiveSpreadsheet();
    }
    var sheet = ss.getSheetByName('Members');
    if(!sheet){
      sheet = ss.insertSheet('Members');
      sheet.appendRow(['Timestamp','First Name','Last Name','Email']);
    }

    var timestamp = new Date();
    sheet.appendRow([
      timestamp,
      data.firstName || '',
      data.lastName || '',
      data.email || ''
    ]);

    var output = ContentService.createTextOutput(JSON.stringify({status:'success'}));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;

  }catch(err){
    var output = ContentService.createTextOutput(JSON.stringify({status:'error',message:err.message}));
    output.setMimeType(ContentService.MimeType.JSON);
    return output;
  }
}

function doGet(e){
  return ContentService.createTextOutput(JSON.stringify({status:'ready',message:'This web app accepts POST requests.'}))
    .setMimeType(ContentService.MimeType.JSON);
}
