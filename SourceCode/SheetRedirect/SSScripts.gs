/**
 * Sorts data from sheet rozpis and creates sheets for all group actors and assigns appropriate data
 *
 * @param spreadSheet spreadsheet for refreshing
 */
function refreshAssistantsSheets(spreadSheet) {
  spreadSheet = spreadSheet ? spreadSheet : SpreadsheetApp.getActiveSpreadsheet();
  var actors = getData(spreadSheet, 'actors');
  var mainSheet = spreadSheet.getSheetByName('Rozpis');
  var clientsNames = getData(spreadSheet, 'clientsNames');
  var clientsSpecial = getData(spreadSheet, 'clientsSpecial');
  var data = [];

  for (var i = 1; i < 8; i++) {
    data.push(Utils.extractSpreadSheet(mainSheet, [{
      dayInWeek: i
    }]));
  }

  actors.forEach(function(item) {
    var sheet = spreadSheet.getSheetByName(item.nick);
    if (sheet == null) {
      var sheetRecord = Utils.findFiles([], {
        id: spreadSheet.getId()
      })[0];
      var messages = ['Rozpis služeb ' + item.nick, 'týden č. ' + sheetRecord.week, sheetRecord.year];

      sheet = spreadSheet.insertSheet(item.nick);
      try { // limit 2 000 000 cells per spreadsheet 1000 rows x 100 celss per sheet
        sheet.deleteRows(61, 1000 - 60);
      } catch (ex) { // if google changed default limits of sheet catch exception
        Utils.logError(ex);
      }
      /* try{      
           sheet.deleteColumns(31, 100); // not working properly, shows "Those columns are out of bounds."          
       }catch(ex){
         Utils.logError(ex);
       }*/
      Utils.prepareSheet(sheet, new Date(sheetRecord.weekStarts), messages);
    }
    copyDataBetweenSheets(mainSheet, sheet, data, clientsNames, clientsSpecial);
  });
}

/**
 * Copies data between two sheets, only sorted out data will be in secondary sheet
 *
 * @param main main spreadsheet
 * @param secondary spreadsheet to be coppied into
 * @param data data from main spreadsheet
 * @param clientsNames array with clients names
 * @param clientsSpecial array with special attributes
 */
function copyDataBetweenSheets(main, secondary, data, clientsNames, clientsSpecial) {
  var name = secondary.getName();

  for (var i = 0; i < data.length; i++) {

    var cleanData = data[i].filter(function(a) {
      var index = clientsNames.indexOf(a.event);
      return a.employee == name || (index > -1 && clientsSpecial[index] == 1);
    }).sort(function(a, b) {
      return new Date(a.from) - new Date(b.from);
    }).map(function(a) {
      return [a.from, a.to, a.event, a.employee, a.tariff, a.note];
    });

    if (i < 5) {
      copyDayRange(main, secondary, 5, i + 1, 28, 6, cleanData);
    } else {
      copyDayRange(main, secondary, 37, i - 4, 20, 6, cleanData);
    }
  }
}

/**
 * Copies data for one day between two sheets
 *
 * @param main main spreadsheet used for copying notes at the bottom
 * @param sheet spreadsheet to be coppied into
 * @param row row of sheet to start writing data
 * @param column column  of sheet to start writing data
 * @param numberOfRows numberOfRows of one day
 * @param width width of one day
 * @param data data to be written in sheet
 */
function copyDayRange(mainSheet, sheet, row, column, numberOfRows, width, data) {
  var block = column * width;
  var allRange = sheet.getRange(row, block - 5, numberOfRows + 1, 6);
  var noteMainRange = mainSheet.getRange(row + numberOfRows, block - 5, 1, 6)
  var noteSecondaryRange = sheet.getRange(row + numberOfRows, block - 5, 1, 6)
  var timesRange = sheet.getRange(row, block - 5, numberOfRows, 2);

  allRange.setValue('');
  timesRange.setNumberFormat('HH:mm:ss');
  if (data.length > 0) {
    sheet.getRange(row, block - 5, data.length, 6).setValues(data);
  }

  noteMainRange.copyTo(noteSecondaryRange);
}