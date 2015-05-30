/**
 * Loads data for Events Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
function getEventsTable() {
  if(!Utils.hasAccessTo(Utils.AccessEnums.EVENT,Utils.PermissionTypes.VIEW)){
    return {};
  }
  
  var events = Utils.findEvents();
  var canDelete = Utils.hasAccessTo(Utils.AccessEnums.EVENT,Utils.PermissionTypes.EDIT);  
  var dt = {
    cols:[
      {id:0, label:'Název StringFilter', type: 'string', isNumber:false, isDate:false},
      {id:1, label:'' , type: 'string', isNumber:false, isDate:false}
    ],
    rows:[]
  };
  
  for(var i = 0; i < events.length; i++) {   
    dt.rows.push({
      c:[
        {v: events[i].name},
        {v: canDelete ? getDeleteButtonHtml({instance: ('event'),name:events[i].name},500,150) : ''}
      ]
    });
  }
  
  return dt;
}