/**
 * Reloads and prepares spreadsheet for a user.
 *
 * @param spreadSheet object of a spreadSheet to update
 * @param checkIntegrity if true checks color and data integrity
 */
function updateSpreadSheet(spreadSheet, checkIntegrity) {
  var sheetRecord = Utils.findFiles(['group'], {
      id: spreadSheet.getId()
    },1)[0];
  var group = sheetRecord.group;
  var actors = Utils.sort(getActors(group), 'nick');
  var events = Utils.sort(Utils.findEvents(), 'name');
  var assistUser = Utils.getUserEmail();

  var cell = SpreadsheetApp.getActive().getRange('A5');
  var firstRun = cell.getDataValidation() ==  null;

  if(firstRun || checkIntegrity){
    var turnOffColors = !checkIntegrity && firstRun;
    toast(spreadSheet, 'Obnova integrity dat' + (turnOffColors ? '' : ' a barev'));
    var tariffs = Utils.sort(Utils.findTariffs(), 'shortcut');
    var clients = Utils.sort(Utils.findGroupClients(['name'], { group: group}), 'name')

    clients.push.apply(clients, events);

    var arrays = [{array: clients, convertProp: 'name'}, {array: actors, convertProp: 'nick'}, {array: tariffs, convertProp: 'shortcut'}];

    var rules = makeRules(arrays);
    var width = 6; // num of columns per day
    var sheet = spreadSheet.getSheetByName('Rozpis');


    for (var i = 1; i < 6; i++) {
      updateDayRange(sheet, 5, i, 28, rules, width, turnOffColors);
    }

    for (var i = 1; i < 3; i++) {
      updateDayRange(sheet, 37, i, 20, rules, width, turnOffColors);
    }
  }

  actors = actors.filter(function(actor){
    return actor.email == assistUser;
  });

  if(actors.length > 0){
    toast(spreadSheet, 'Tvorba vašeho listu');
    refreshAssistantsSheets(spreadSheet,actors,Utils.convertObjectsToArrayByProperty(events, 'name'));
  }
}

/**
 * Makes rules for data validation
 *
 * @param arrays array of arrays, fields of each array are values used for each rule (i.e. only these values are valid)
 * @return {Array<Object>} arrays of rules in the same order as input
 */
function makeRules(arrays) {
  var result = [];

  for (var i = 0; i < arrays.length; i++) {
    var values = Utils.convertObjectsToArrayByProperty(arrays[i].array, arrays[i].convertProp);
    result.push(SpreadsheetApp.newDataValidation().requireValueInList(values).setAllowInvalid(false).build());
  }

  return result;
}

/**
 * Updates one day in a spreadsheet
 *
 * @param sheet sheet to update
 * @param row row where to start updating
 * @param column column where to start updating
 * @param numberOfRows numberOfRows to update
 * @param rules rules to set for associated drop down lists
 * @param width width of one day(for now should be 6 only)
 * @param turnOffColors if true doesn't update colors
 */
function updateDayRange(sheet, row, column, numberOfRows, rules, width, turnOffColors) {
  var block = column * width;
  var timesRange = sheet.getRange(row, block - 5, numberOfRows, 2);
  var clientsRange = sheet.getRange(row, block - 3, numberOfRows, 1);
  var assistantsRange = sheet.getRange(row, block - 2, numberOfRows, 1);
  var tarifsRange = sheet.getRange(row , block - 1, numberOfRows, 1);

  clientsRange.setDataValidation(rules[0]);
  assistantsRange.setDataValidation(rules[1]);
  tarifsRange.setDataValidation(rules[2]);

  timesRange.setNumberFormat('[hh]:mm:ss');
  timesRange.setDataValidation(SpreadsheetApp.newDataValidation()
    .requireFormulaSatisfied('= REGEXMATCH( TO_TEXT(INDEX(' + timesRange.getCell(1, 1).getA1Notation() +
      ')),"^((([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9])|24:00:00)$")')
    .setAllowInvalid(false).build());

  if(turnOffColors)
    return;
  //colors updated efficently
  var values = sheet.getRange(row, block - 3, numberOfRows, 3).getValues();
  var count = 0;
  var update = false;
  var timesRange = sheet.getRange(row, block - 5, numberOfRows, 2);
  var noteRange = sheet.getRange(row + numberOfRows, block - 5, 1, 6);

  timesRange.setBackground('#fff2cc');
  noteRange.setBackground('#e2f3ff');

  for(var i = 0; i < values.length; i++){
    if(values[i][1] == ''){
      count++;
    }else {
      if(count > 0){
        update = true;
      }
      employeeChanged(sheet, row + i, block - 2);
    }

    if(i == values.length -1 && values[i][1] == ''){
      i++;
      update = true;
    }

    if(update){
      sheet.getRange(row + i - count, block - 3, count, 3).setBackground('#ffffff');
      count = 0;
      update = false;
    }
  }
}

/**
 * gets employees associated with this group
 *
 * @param group group
 * @return {Array<Object>} actors of this group
 */
function getActors(group) {
  var leaders = Utils.convertObjectsToArrayByProperty(Utils.findGroupLeaders(['employeeEmail'], {
    group: group
  }), 'employeeEmail');
  var actors = Utils.convertObjectsToArrayByProperty(Utils.findGroupActors(['employeeEmail'], {
    group: group
  }), 'employeeEmail');
  var employees = Utils.findEmployees(['email', 'nick', 'color']);

  actors.push.apply(actors, leaders);
  actors = Utils.toUniquePrimitiveArray(actors);

  return employees.filter(function(item) {
    return actors.indexOf(item.email) > -1;
  });
}
