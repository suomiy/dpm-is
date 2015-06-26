/**
 * Helper function to create main HTML. It can return html, string or arrays of objects we need to include in our page.
 *
 * @param resource string describing wanted resource 
 * @param param object as {files: [..], group: [..]} with objects for faster execution
 * @return requested resource or null if resource not found
 */
function getResource(resource, param) {
  switch (getProp('sheetsRedirectPart')) {
    case 'isInGroups':
      switch (resource) {
        case 'includeBool':
          var email = Utils.getUserEmail();            
          var actors = Utils.findGroupActors([], {
            employeeEmail: email
          });
          return setAndLook(email, actors, 'shRFRes')
        case 'name':
          return 'Náležíte do těchto skupin : ';
        case 'getGroups':
          return getData('shRFRes');
        case 'links':
          return getLinks(param.files, param.group, Utils.getUserEmail());
        case 'sendsEmails':
          return false;
        default:
          return null;
      }
    case 'leadsGroups':
      switch (resource) {
        case 'includeBool':
          var email = Utils.getUserEmail();
          var leaders = Utils.findGroupLeaders([], {
            employeeEmail: email
          });
          return setAndLook(email, leaders, 'shRFRes2')
        case 'name':
          return 'Vedete tyto skupiny : ';
        case 'getGroups':
          return getData('shRFRes2');
        case 'links':
          return getLinks(param.files, param.group);
        case 'sendsEmails':
          return true;
        default:
          return null;
      }
    case 'admin':
      switch (resource) {
        case 'includeBool':
          return Utils.getUserPermission() == Utils.AccessEnums.ADMIN;
        case 'name':
          return 'Všechny skupiny : ';
        case 'getGroups':
          return Utils.getUserPermission() == Utils.AccessEnums.ADMIN ? Utils.findGroupsAsArray() : []; // precaution against too many F5s
        case 'links':
          return getLinks(param.files, param.group);          
        case 'sendsEmails':
          return true;
        default:
          return null;
      }
    default:
      return null;
  }
}

/**
 * Function for telling if the user can see this part of html, it is called from scriptlet.
 * Sets array to user properties.
 *
 * @param email email of active user
 * @param array array of groups this user belongs to
 * @param prop id for setting user properties, should be unique
 * @return boolean if user found in array of groups
 */
function setAndLook(email, array, prop) {
  var emails = Utils.convertObjectsToArrayByProperty(array, 'employeeEmail');
  var groups = Utils.convertObjectsToArrayByProperty(array, 'group');

  saveData(prop, groups);

  return emails.indexOf(email) > -1;
}

/**
 * Gets links for group in format for scriptlets to assemble the page 
 * sets array to user properties
 *
 * @param files all files this function searches in
 * @param group group we want to have links of
 * @param owner it takes all files without owner, if this parameter set, takes files with this owner too
 * @return array of links
 */
function getLinks(files, group, owner) {
  var result = [];
  for (var i = 0; i < files.length; i++) {
    if (files[i].group == group && (owner == null || files[i].owner == '' || files[i].owner == null || files[i].owner == owner)) {
      result.push(files[i]);
    }
  }
  return result;
}

/**
 * Wrapper function for saving data 
 */
function saveData(fieldName, obj) {
  Utils.setUserObjProp(fieldName + sessionId, obj);
}

/**
 * Wrapper function for getting data
 */
function getData(fieldName) {
  return Utils.getUserObjProp(fieldName + sessionId);
}

/**
 * Wrapper function for saving data associated it with this spreadsheet 
 */
function saveScriptData(fieldName, obj) {
  PropertiesService.getDocumentProperties().setProperty(fieldName, JSON.stringify(obj));
}

/**
 * Wrapper function for getting data associated it with this spreadsheet 
 */
function getScriptData(fieldName) {
  var data = PropertiesService.getDocumentProperties().getProperty(fieldName);
  return data ? JSON.parse(data) : null;
}

/**
 * Wrapper function.
 */
function getProp(prop) {
  return Utils.getUserProp(prop  + sessionId);
}

/**
 * Wrapper function.
 */
function setProp(prop, value) {
  Utils.setUserProp(prop + sessionId, value);
}

/**
 * Sets runtime properties
 *
 * @param params object with properties to set
 */
function setRuntimeProperties(params){
  var renewProps = {};
  
  propItems.forEach(function(prop){
     var value = (params && params[prop] != null) ? params[prop] : '';     
     renewProps[prop + sessionId] = value;
     
  });
  Utils.setUserProps(renewProps);
}

/**
 * Checks if props are set corectly
 *
 * @return true if props are correctly set, false otherwise
 */
function checkIfPropsFull(){
  var result = true;
  
  for(var item in propItems){
    if(!getProp(item)){
      result = false;
      break;
    }
  }
  
  return result;
}


// log all users except admin, for debugging purposes
function temporaryTestingLog(email, message){
  email = email ? email : Utils.getUserEmail();
  var value =  PropertiesService.getScriptProperties().getProperty('testLog');
  
  if(Utils.isSuperAdmin(email)){
    Utils.log('\n' + value);
  }else{
    var msg = '[' + new Date().toString().replace(/(.*\d{2}:\d{2}:\d{2}).*/, '$1') + '] [' + email + ']  week: ' + message + '\n';
    value = value ? value + msg : msg;
    PropertiesService.getScriptProperties().setProperty('testLog', value);
  }  
}
 

/**
 * Maps obj properties to string as url parameters.
 *
 * @param obj object to convert
 * @return parameter part of html
 */
function constructUrlParameters(obj) {
  var value = '';

  for (var prop in obj) {
    if (value) {
      value += '&';
    } else {
      value = '?';
    }
    value += prop + '=' + rfc3986EncodeURIComponent(obj[prop]);
  }
  return value;
}

/**
 * Encodes URI component.
 *
 * @param str string to encode
 * @return rfc3986 URI component
 */
function rfc3986EncodeURIComponent(str) {
  var v = '';
  try {
    v = encodeURIComponent(str).replace(/[!'()*]/g, function(v) {
      return escape(v);
    });
  } catch (e) {}
  return v;
} 
 
/* props settings variables*/
var propItems = ['year', 'week', 'sheetsRedirectPart', 'sheetsRedirectFiles', 'shRFRes', 'shRFRes2'];// 'colors', 'nicks', 'actors', 'clientsNames', 'clientsSpecial', 'defaultTariff',
var sessionId = 'sheetsRedirect_' + Utils.getUserEmail(); 

