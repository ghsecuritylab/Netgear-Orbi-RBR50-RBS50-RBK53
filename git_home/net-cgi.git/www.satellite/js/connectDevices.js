(function(a){a(function(){a.refreshAttachedDevices=function(){if(!a(".running").length){a.submit_wait(".main:first",a.PAGE_WAITING_DIV)}a.getData("refresh_dev.aspx",function(d){var b="",c=0,e;a("tbody",".wiredDevices:first").html("");if(d.device.length>0){for(c=0;c<d.device.length;c++){b="<tr>";b+='<td><span class="tdLabel">'+lan_mark_ip+"</span>"+d.device[c].ip+"</td>";b+='<td><span class="tdLabel">'+lan_mark_name+"</span>"+d.device[c].name+"</td>";b+='<td><span class="tdLabel">'+qos_mac+"</span>"+d.device[c].mac.toUpperCase()+"</td>";b+='<td><span class="tdLabel">'+trigger_contype+"</span>"+d.device[c].type+"</td>";b+="</tr>";a("tbody",".wiredDevices:first").append(b)}}a(".running").remove()})};a.refreshAttachedDevices()})}(jQuery));