/**
 * Webapp entry function, returns HTML.
 *
 * @param e url parameters setting this webapp's beahviour
 * @return {Object} HTML page with javascript
 */
function doGet(e) {
  return HtmlService.createTemplate('<p>Authorizace...OK</p>').evaluate();
}

/**
 * @param str string to be trimmed of white spaces and apppostrophes '
 * @return trimmed string
 */
function trim(str) {
  return (typeof str === 'string') ? str.replace(/^[\s\']+|[\s\']+$/g, '') : '';
}

/**
 * Returns new unique array.
 *
 * @param a array of primitive types
 * @return unique array
 */
function toUniquePrimitiveArray(a) {
  var seen = {};
  return a.filter(function(item) {
    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
  });
}

/**
 * Returns new array which is filled with object[property] of objects in array.
 *
 * @param array array of objects
 * @param property to be looked for
 * @return unique array
 */
function convertObjectsToArrayByProperty(array, property) {
  return array.map(function(item) {
    return item[property];
  });
}

/**
 * sorts array by sortProp with Czech comparision
 *
 * @param array array to be sorted
 * @param sortProp property of obj to be sorted by, optional
 * @return sorted array
 *
 */
function sort(array, sortProp){
  try{
    if(array.length > -1 &&  typeof array[0] === 'string' ){
      return array.sort(function(a,b) {return a.toString().localeCompare(b.toString());} );
    }
    return array.sort(function(a,b) {
      return a[sortProp].toString().localeCompare(b[sortProp].toString());
    });
  }catch(x){
    logError(x);
    return array.sort();
  }
}

/**
 * Checks if obj is error free, error is property which is non empty string.
 *
 * @param obj to be searched for errors
 * @return true if is Error free
 */
function isObjErrorFree(obj) {
  if (obj) {
    for (var prop in obj) {
      if (obj[prop] !== '') {
        return false;
      }
    }
  }
  return true;
}

/**
 * Moves files depending on a type.
 *  'Rozpis' moves to corresponding year and week folder
 *  'Statistika' and 'Fakturace' moves Storage folder
 *
 * @param file file to be moved
 * @param type type of file, moves files into different folders
 * @param year decides in which year folder(which has weeks folders inside) is file going to be moved, valid only for type 'Rozpis'
 * @param week decides in which week folder is file going to be moved, valid only for type 'Rozpis'
 * @return null if parameters are invalid
 */
function moveFile_(file, type, year, week) {
  var mainFolder;
  var yearsFolders;
  var yearFolder;
  var weeksFolders;
  var weekFolder;

  switch (type) {
    case 'Rozpis':
      if (year == null || week == null) {
        return null;
      }
      mainFolder = DriveApp.getFolderById(manager.timetablesID);
      yearsFolders = mainFolder.getFoldersByName(year);

      while (yearsFolders.hasNext()) {
        yearFolder = yearsFolders.next();
      }

      if (!yearFolder) {
        yearFolder = mainFolder.createFolder(year);
      }

      weeksFolders = yearFolder.getFoldersByName(week);
      while (weeksFolders.hasNext()) {
        weekFolder = weeksFolders.next();
      }

      if (!weekFolder) {
        weekFolder = yearFolder.createFolder(week);
      }
      weekFolder.addFile(file);
      break;
    case 'Statistika':
    case 'Fakturace':
      mainFolder = DriveApp.getFolderById(manager.storageID);
      mainFolder.addFile(file);
      break;
    default:
      return null;
  }
  DriveApp.getRootFolder().removeFile(file);
}
