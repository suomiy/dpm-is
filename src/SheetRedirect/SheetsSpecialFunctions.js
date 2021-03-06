/**
 * Sets to user prop whether to check integrity of sheet
 * @param bool if true checks integrity
 */
function setIntegrityCheck(boolVal) {
  setProp('sheets_redirect_integrity', boolVal);
}

/**
 * Sets to user prop whether to check duplicates in sheet
 * @param bool if true checks duplicates
 */
function setDuplicateCheck(boolVal) {
  setProp('sheets_redirect_duplicates', boolVal);
}

/**
 * Safe method to alert message
 * because user can leave the alert dialog for too long or
 * can close the window which throws the exception
 * and we actually dont need the clicked button returned
 *
 * @param message message to be alerted
 */
function alertUi(message){
  try{
    SpreadsheetApp.getUi().alert(message);
  }catch(timeoutReached){
  }
}

/**
 * Safe method to toast message
 * because user can close the window before the script ends
 *
 * @param spreadsheet spreadsheet to be alerted
 * @param message message to be alerted
 */
function toast(spreadsheet,message){
  try{
    spreadsheet.toast(message);
  }catch(ignore){
  }
}


/**
 * Checks if sheet has duplicates in times for one assistant
 *
 */
function checkAssistantDuplicities(){
  toast(SpreadsheetApp.getActive(), 'Kontrola duplicit...');
  var sheet = SpreadsheetApp.getActive().getSheetByName('Rozpis');
  var width = 6; // num of columns per day
  var messages = '';

  for (var i = 1; i < 6; i++) {
    messages += checkDayDuplicities(sheet, 4, i, 28,width);
  }

  for (var i = 1; i < 3; i++) {
    messages += checkDayDuplicities(sheet, 36, i, 20, width);
  }

  if(messages){
    alertUi('Byly nalezeny tyto nesrovnalosti :\n\n' + messages);
  }else{
    toast(SpreadsheetApp.getActive(), 'Nenalezeny žádné duplicity.');
  }
}

/**
 * Checks if day in sheet has duplicates in times for one assistant
 *
 * @param sheet sheet to check
 * @param row row where to check
 * @param column column where to check
 * @param numberOfRows numberOfRows to check
 * @param width width of one day(for now should be 6 only)
 */
function checkDayDuplicities(sheet, row, column, numberOfRows, width) {
  var block = column * width;
  var froms = sheet.getRange(row + 1, block - 5, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var tos = sheet.getRange(row + 1, block - 4, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var events = sheet.getRange(row + 1, block - 3, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var nicks = sheet.getRange(row + 1, block - 2, numberOfRows, 1).getValues().map(function(item){return item[0]});
  var tariffs = sheet.getRange(row + 1, block - 1, numberOfRows, 1).getValues().map(function(item){return item[0]});

  var uniqueNicks = Utils.toUniquePrimitiveArray(nicks);
  var index = uniqueNicks.indexOf("");
  if(index > -1){
    uniqueNicks.splice(index,1);
  }

  var resultMessages = ''

  uniqueNicks.forEach(function(nick){
    var times = [];
    for(var i = 0; i < nicks.length; i++){
      if(nicks[i] == nick){
        var from = froms[i];
        var to = tos[i];

        if (from == '' || to == '' || events[i] == '' || nick == '' || tariffs[i] == '') {
          var range = sheet.getRange(row + i + 1, block - 5, 1, 5);
          resultMessages += range.getA1Notation() + ' - nedostatečně vyplněno (Duplicity u ' + nick + ' nebyly zkontrolovány)\n';
          return;
        }
        var fromDate = new Date(from);
        var toDate = new Date(to);
        times.push({from: fromDate.getTime(), to: toDate.getTime()});
      }
    }
    times.sort(function(a,b){
       return (a.from - b.from);
    });

    for(var i = 0; i < times.length; i++){
      var duration = times[i];
      for(var j = i + 1; j < times.length; j++){
        var otherDuration = times[j];

        if((duration.to > otherDuration.from && duration.from < otherDuration.to)){
          var range = sheet.getRange(row + 1, block - 5, numberOfRows, 2);
          resultMessages += range.getA1Notation() + ' - byly nalezeny duplicity u ' + nick + '\n';
          return;
        }
      }
    }
  });
  return resultMessages;
}
