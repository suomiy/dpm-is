/**
 * Loads data for Employess Table.
 *
 * @return dataTable object
 */
function getEmployeesTable() {
  if (!Utils.hasAccessTo(Utils.AccessEnums.EMPLOYEE,Utils.PermissionTypes.VIEW)) {
    return {};
  }

  var editAccessRights = Utils.getMyAccessRights(Utils.PermissionTypes.EDIT);
  var canEditGroups = Utils.hasAccessTo(Utils.AccessEnums.EMPLOYEES_GROUPS,Utils.PermissionTypes.EDIT);
  var employees = Utils.findEmployees([],{},'');
  employees = Utils.sort(Utils.sort(employees, 'name'), 'permission');

  var allPermissions = Utils.getUserRolesInCzech();
  var dt = {
    cols:[
      {id:0, label:'Jméno', type: 'string', stringFilter: 'true'},
      {id:1, label:'Email' , type: 'string', stringFilter: 'true'},
      {id:2, label:'Přezdívka', type: 'string', stringFilter: 'true'},
      {id:3, label:'Vede skupiny', type: 'string', categoryFilter: 'split'},
      {id:4, label:'Náleží do skupin', type: 'string', categoryFilter: 'split'},
      {id:5, label:'Funkce', type: 'string', categoryFilter: 'true'},
      {id:6, label:'', type: 'string'},
      {id:7, label:'' , type: 'string'},
      {id:8, label:'' , type: 'string'},
    ],
    rows:[]
  };

  for(var i = 0; i < employees.length; i++) {
    dt.rows.push({
      c:[
        {v: employees[i].name, p: { style: 'width: 12%;' }},
        {v: employees[i].email, p: { style: 'width: 22%;' }},
        {v: employees[i].nick, p: { style: 'width: 6%;' }},
        {v: employees[i].leadsGroups.join(','), p: { style: 'width: 15%;' }},
        {v: employees[i].isInGroups.join(','), p: { style: 'width: 22%;' }},
        {v: getPositionName_(employees[i],allPermissions), p: { style: 'width: 8%;' }},
        {v: '<div style="width:3em;height:1em;background-color:'+ employees[i].color + ';"/>'},
        {v: isEditable_(employees[i],editAccessRights,canEditGroups) ?
              getEditButtonHtml({instance:'user',email:employees[i].email},500,650) : ''},
        {v: isDeletable_(employees[i],editAccessRights) ?
              getDeleteButtonHtml({instance:'user',email:employees[i].email,name:employees[i].name,nick:employees[i].nick},500,150): ''}
      ]
    });
  }
  return dt;
}
/**
 * Checks if employee is deletable by active user.
 *
 * @param employee employee to be deleted
 * @param accessRights access rights of active user
 * @return true if deletable
 */
function isDeletable_(employee, accessRights) {
  return accessRights.indexOf(employee.permission) > -1 && Utils.getUserEmail() !== employee.email && !Utils.isMainAdmin(employee.email);
}

/**
 * Checks if employee is editable by active user.
 *
 * @param employee employee to be edited
 * @param accessRights access rights of active user
 * @return true if editable
 */
function isEditable_(employee, accessRights, canEditGroups) {
  return (accessRights.indexOf(employee.permission) > -1 || (canEditGroups && employee.permission != Utils.AccessEnums.ADMINISTRATIVE)) && !(employee.email ===
      Utils.getUserEmail() && employee.permission == Utils.AccessEnums.LEADER)
}

/**
 * Returns name of employee role.
 *
 * @param employee employee to be edited
 * @param allPermissions access rights of active user
 * @return name of employee role
 */
function getPositionName_(employee, allPermissions) { //Main Admin has same rights as Admin, his only speciality is that he can't be deleted
  var result = Utils.isMainAdmin(employee.email) ? [{
    name: 'Main Admin'
  }] : allPermissions.filter(function(obj) {
    return obj.permission == employee.permission;
  });
  return result[0].name;
}
