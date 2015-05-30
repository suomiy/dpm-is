/**
 * Checks if webApp got right parameters and deletes Tariff
 *
 * @return object which designates success or failure
 */
function deleteTariff() {     
  var shortcut =  getProp('shortcut'); 
  var msg = {}; 
  
  Utils.validate(msg,shortcut,{actions:['notNull'],actionObjs:[{}] ,
     actionErrors:[{err:'System Error : no parameter'}]     
    });
     
  Utils.validate(msg,Utils.AccessEnums.TARIFF,{actions:['canEdit'],actionObjs:[{}],
     actionErrors:[{err:'Cenové pásmo není v systému nebo nemáte právo ho smazat'}]     
    });
    
  if(Utils.isObjErrorFree(msg)){ 
    if(Utils.deleteTariff({shortcut: shortcut})){
        msg.message ='Cenové pásmo ' + shortcut + ' bylo úspěšně smazáno.';
    }else{
        msg.err = 'Cenové pásmo bylo již smazáno.';
    }         
  }
      
  return msg;
}