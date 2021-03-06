/**
 * Insert Object to database
 * sleep hack because of https://code.google.com/p/google-apps-script-issues/issues/detail?id=4901
 *
 * @param {string} sheet sheet/table where the object will be stored
 * @param obj object with key/value  pairs that will be inserted to database
 * @param {boolean} disableLogging
 * @return {boolean} indicating success or failure.
 */
function repCreate_(sheet, obj, disableLogging) {
  var num;

  if (sheet == null || obj == null) return false;

  lock_()
  try{
    num = ObjDB.insertRow(manager.myDB, sheet, obj);
  } catch(x) {
    Utilities.sleep(manager.sleepConstantForSSServiceBug)
    num = ObjDB.insertRow(manager.myDB, sheet, obj);
  } finally {
    unlock_();
  }

  if (num && !disableLogging) {
    var name = obj.name ? obj.name : JSON.stringify(obj);
    log(name + ' added to ' + sheet);
  }
  return num > 0;
}

/**
 * Deletes Object in database
 * sleep hack because of https://code.google.com/p/google-apps-script-issues/issues/detail?id=4901
 *
 * @param {string} sheet sheet/table from which the object will be removed
 * @param obj object with key/value  pairs that will be removed from database
 * @param {boolean} hasMoreInstances indicates whether deleted object can have more instances for deletion
 * @param {boolean} disableLogging
 * @return {boolean} indicating success or failure.
 */
function repDelete_(sheet, obj, hasMoreInstances, disableLogging) {
  var num;

  if (sheet == null || obj == null) return false;

  lock_();
  try{
    num = ObjDB.deleteRow(manager.myDB, sheet, obj);
  } catch(x) {
    Utilities.sleep(manager.sleepConstantForSSServiceBug)
    num = ObjDB.deleteRow(manager.myDB, sheet, obj);
  } finally {
    unlock_();
  }

  if (num && !disableLogging) {
    var name = obj.name ? obj.name : JSON.stringify(obj);
    log(name + ' deleted from ' + sheet);
  }
  if (num > 1 && !hasMoreInstances) {
    logError('Error : deleted ' + num + ' instances of: ' + name + ' in ' + sheet);
  }

  return num > 0;
}

/**
 * Updates Object in database
 * sleep hack because of https://code.google.com/p/google-apps-script-issues/issues/detail?id=4901
 *
 * @param {string} sheet sheet/table where the object is stored
 * @param obj object with key/value  pairs that will be updated in database
 * @param cond object with key/value  pairs that will be used to find columns of database which will be replaced
 * @param {boolean} disableLogging
 * @return {boolean} indicating success or failure.
 */
function repUpdate_(sheet, obj, cond, disableLogging) {
  var num;

  if (sheet == null || obj == null || cond == null) return false;

  lock_();
  try{
    num = ObjDB.updateRow(manager.myDB, sheet, obj, cond);
  }catch(x){
    Utilities.sleep(manager.sleepConstantForSSServiceBug)
    num = ObjDB.updateRow(manager.myDB, sheet, obj, cond);
  } finally {
    unlock_();
  }

  if (num && !disableLogging) {
    var cond = cond.name ? cond.name : JSON.stringify(cond);
    log(cond + ' updated to ' + JSON.stringify(obj) + ' in ' + sheet);
  }
  if (num > 1) {
    logError('Error : updated ' + num + ' instances of:' + cond + ' in ' + sheet);
  }

  return num > 0;
}

/**
 * Returns objects from database
 * sleep hack because of https://code.google.com/p/google-apps-script-issues/issues/detail?id=4901
 *
 * @param {string} sheet sheet/table where the object is stored
 * @param fields array with strings of columns we want to have returned, if empty array it can return undefined properties for no data in property
 * @param restrictions object with key/value  pairs that will be used for filtering columns of database
 * @param limit maximum number of objects function returns
 * @return {Array<Object>} array of found objects
 *
 *  30.5.2016 Do not lock on find - Google throws lock exception often and it is not really necessary to lock db here
 */
function repFind_(sheet, fields, restrictions, limit) {
  var rows;

  if (sheet == null) return [];

  if (!Array.isArray(fields)) {
    fields = [];
  }
  if (restrictions == null) {
    restrictions = {};
  }

  // lock_();
  try{
    rows = ObjDB.getRows(manager.myDB, sheet, fields, restrictions, limit);
  }catch(x){
    Utilities.sleep(manager.sleepConstantForSSServiceBug);
    rows = ObjDB.getRows(manager.myDB, sheet, fields, restrictions, limit);
  }
  // unlock_();

  if (fields.length > 0) {
    rows = rows.map(function(item) {
      for (var i = 0; i < fields.length; i++) {
        if (item[fields[i]] === undefined) {
          item[fields[i]] = '';
        }
      }
      return item;
    });
  }

  return rows;
}
