var invalid_port_used="$invalid_port_used";var disable=false;var serv_array=[["TCP","20","21","20","21","FTP","1"],["TCP","80","80","80","80","HTTP","1"],["TCP","23566","23566","23566","23566","ICUII","1"],["TCP","6670","6670","6670","6670","IP_Phone","1"],["TCP","1720","1720","1720","1720","NetMeeting","1"],["TCP","119","119","119","119","News","1"],["TCP","1723","1723","1723","1723","PPTP","1"],["TCP/UDP","27960","27960","27960","27960","QuakeII/III","1"],["TCP/UDP","6970","7170","6970","7170","Real-Audio","1"],["TCP","23","23","23","23","Telnet","1"]];function show_servip(){var b=document.forms[0];var a=new Array();a=lan_ip.split(".");b.SV_IP1.value=a[0];b.SV_IP2.value=a[1];b.SV_IP3.value=a[2]}function check_list_length(a){if(a==64){alert("$forward_length_64");return false}}function check_forwarding_edit(b){if(forward_array_num==0){location.href="edit_fail.htm";return false}var c=0;var a;if(count==0){if(b.RouteSelect.checked==true){c++;a=parseInt(b.RouteSelect.value)}}else{for(i=0;i<=count;i++){if(b.RouteSelect[i].checked==true){c++;a=parseInt(b.RouteSelect[i].value)}}}if(c==0){location.href="edit_fail.htm";return false}else{b.select_edit.value=parseInt(forward_table[a]);b.select_edit_num.value=parseInt(item_count[a]);b.submit_flag.value="forwarding_editnum_range";b.action="/apply.cgi?/forwarding_edit.htm timestamp="+ts;b.submit();return true}}function check_forwarding_del(b){if(forward_array_num==0){location.href="del_fail.htm";return false}var c=0;var a;if(count==0){if(b.RouteSelect.checked==true){c++;a=parseInt(b.RouteSelect.value)}}else{for(i=0;i<=count;i++){if(b.RouteSelect[i].checked==true){c++;a=parseInt(b.RouteSelect[i].value)}}}if(c==0){location.href="del_fail.htm";return false}else{b.select_del.value=parseInt(forward_table[a]);b.select_del_num.value=parseInt(item_count[a]);b.submit_flag.value="forwarding_del_range";b.submit();return true}}function Check_add(cf){cf.serflag.value=0;if(check_list_length(count+1)==false){return false}cf.service_ip.value=cf.SV_IP1.value+"."+cf.SV_IP2.value+"."+cf.SV_IP3.value+"."+cf.SV_IP4.value;if(checkipaddr(cf.service_ip.value)==false||is_sub_or_broad(cf.service_ip.value,lan_ip,lan_subnet)==false){alert("$invalid_ip");return false}cf.service_ip.value=address_parseInt(cf.service_ip.value);if(isSameSubNet(cf.service_ip.value,lan_subnet,lan_ip,lan_subnet)==false){alert("$diff_lan_this_subnet");return false}if(isSameIp(cf.service_ip.value,lan_ip)==true){alert("$invalid_ip");return false}var selectService=cf.svs_gm.options[cf.svs_gm.selectedIndex].value;var s=cf.svs_gm.selectedIndex;for(i=1;i<=forward_array_num;i++){var str=eval("forwardingArray"+i).replace(/&#92;/g,"\\").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#34;/g,'"').replace(/&#39;/g,"'").replace(/&#35;/g,"#").replace(/&#38;/g,"&");var each_info=str.split(" ");each_info[0]=each_info[0].replace(/&harr;/g," ");if(each_info[0]==serv_array[s][5]){alert("$forwarding_ser_name_dup");return false}}var input_ip=cf.service_ip.value;cf.hidden_protocol.value=serv_array[s][0];cf.hidden_external_portstart.value=serv_array[s][1];cf.hidden_external_portend.value=serv_array[s][2];cf.hidden_internal_portstart.value=serv_array[s][3];cf.hidden_internal_portend.value=serv_array[s][4];cf.hidden_service_name.value=serv_array[s][5];var input_sername=serv_array[s][5];var input_sertype=serv_array[s][0];var input_external_start_port=serv_array[s][1];var input_external_end_port=serv_array[s][2];var input_internal_start_port=serv_array[s][3];var input_internal_end_port=serv_array[s][4];for(i=1;i<=forward_array_num;i++){var str=eval("forwardingArray"+i).replace(/&#92;/g,"\\").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#34;/g,'"').replace(/&#39;/g,"'").replace(/&#35;/g,"#").replace(/&#38;/g,"&");var each_info=str.split(" ");sertype=each_info[1];ext_startport=each_info[2];ext_endport=each_info[3];int_startport=each_info[4];int_endport=each_info[5];forwardingip=each_info[6];serflag=each_info[7];if(sertype=="UDP"&&serflag=="1"){}else{if(sertype=="TCP/UDP"||sertype==input_sertype||input_sertype=="TCP/UDP"){var ext_bigger_port=parseInt(ext_endport)>parseInt(ext_startport)?parseInt(ext_endport):parseInt(ext_startport);var ext_smaller_port=parseInt(ext_endport)>parseInt(ext_startport)?parseInt(ext_startport):parseInt(ext_endport);var int_bigger_port=parseInt(int_endport)>parseInt(int_startport)?parseInt(int_endport):parseInt(int_startport);var int_smaller_port=parseInt(int_endport)>parseInt(int_startport)?parseInt(int_startport):parseInt(int_endport);if(!(ext_bigger_port<parseInt(input_external_start_port)||parseInt(input_external_end_port)<ext_smaller_port)){alert("$ports_error_conflict");return false}if(forwardingip==input_ip&&!(int_bigger_port<parseInt(input_internal_start_port)||parseInt(input_internal_end_port)<int_smaller_port)){if(!(parseInt(input_internal_start_port)==int_smaller_port||int_bigger_port==parseInt(input_internal_end_port))){alert("$ports_error_conflict");return false}}}}}for(i=1;i<=trigger_array_num;i++){var str=eval("triggeringArray"+i).replace(/&#92;/g,"\\").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#34;/g,'"').replace(/&#39;/g,"'").replace(/&#35;/g,"#").replace(/&#38;/g,"&");var each_info=str.split(" ");constart_port=each_info[6];conend_port=each_info[7];if(!(parseInt(conend_port)<parseInt(input_external_start_port)||parseInt(input_external_end_port)<parseInt(constart_port))||!(parseInt(conend_port)<parseInt(input_internal_start_port)||parseInt(input_internal_end_port)<parseInt(constart_port))){alert(invalid_port_used);return false}}for(i=1;i<=upnp_array_num;i++){var str=eval("upnpArray"+i);var each_info=str.split(";");upnp_int=each_info[2];upnp_ext=each_info[3];upnp_ip=each_info[4];if((parseInt(upnp_ext)>=parseInt(input_external_start_port)&&parseInt(upnp_ext)<=parseInt(input_external_end_port)&&input_ip!=upnp_ip)||(parseInt(upnp_ext)>=parseInt(input_internal_start_port)&&parseInt(upnp_ext)<=parseInt(input_internal_end_port)&&input_ip!=upnp_ip)){alert(invalid_port_used);return false}}if(usb_router_flag==1){if(check_readyshare_port(input_external_start_port,input_external_end_port,"WAN")==false||check_readyshare_port(input_internal_start_port,input_internal_end_port,"WAN")==false){alert(invalid_port_used);return false}}if((!(parseInt(remote_port)<parseInt(input_external_start_port)||parseInt(input_external_end_port)<parseInt(remote_port))&&remote_port!="")||(!(parseInt(remote_port)<parseInt(input_internal_start_port)||parseInt(input_internal_end_port)<parseInt(remote_port))&&remote_port!="")){alert(invalid_port_used);return false}if(((input_sertype.toLowerCase()==vpn_tun_type||input_sertype=="TCP/UDP")&&vpn_tun_port!=""&&(!(parseInt(vpn_tun_port)<parseInt(input_external_start_port)||parseInt(input_external_end_port)<parseInt(vpn_tun_port))||!(parseInt(vpn_tun_port)<parseInt(input_internal_start_port)||parseInt(input_internal_end_port)<parseInt(vpn_tun_port))))||(input_sertype.toLowerCase()==vpn_type||input_sertype=="TCP/UDP")&&vpn_port!=""&&(!(parseInt(vpn_port)<parseInt(input_external_start_port)||parseInt(input_external_end_port)<parseInt(vpn_port))||!(parseInt(vpn_port)<parseInt(input_internal_start_port)||parseInt(input_internal_end_port)<parseInt(vpn_port)))){alert(invalid_port_used);return false}if(cf.hidden_service_name.value=="NetMeeting"){cf.serflag.value=1}else{cf.serflag.value=0}cf.submit_flag.value="forwarding_hidden_add";cf.submit();return true}function remove_space_commas(d){var c="";for(i=0;i<d.length;i++){if(d.charAt(i)==" "){continue}else{c=c+d.charAt(i)}}var a=c.split(",");var b="";for(i=0;i<a.length;i++){if(a[i]==""){continue}else{b=b+a[i]+","}}b=b.substring(0,b.length-1);return b}function port_rerange(b){var l=b.split(",");for(i=0;i<l.length;i++){var h=l[i].split("-");if(h.length==2){if(parseInt(h[0],10)==parseInt(h[1],10)){l[i]=h[0]}if(parseInt(h[0],10)>parseInt(h[1],10)){l[i]=h[1]+"-"+h[0]}}}for(i=0;i<l.length-1;i++){var a=l[i];var d=i;for(j=i+1;j<l.length;j++){var f=a.split("-");var g=l[j].split("-");if(f.length==1){if(g.length==1){if(parseInt(f[0])>parseInt(g[0])){if(parseInt(f[0])-parseInt(g[0])==1){l[j]=g[0]+"-"+f[0];l[d]="65535"}a=l[j];d=j}else{if(parseInt(f[0])==parseInt(g[0])){l[j]="65535"}else{if(parseInt(g[0])-parseInt(f[0])==1){l[d]=f[0]+"-"+g[0];a=l[d];l[j]="65535"}}}}else{if(g.length==2){if(parseInt(f[0])>parseInt(g[1])){if(parseInt(f[0])-parseInt(g[1])==1){l[j]=g[0]+"-"+f[0];l[d]="65535"}a=l[j];d=j}else{if(parseInt(g[0])-parseInt(f[0])==1){l[d]=f[0]+"-"+g[1];a=l[d];l[j]="65535"}else{if(parseInt(f[0])>=parseInt(g[0])&&parseInt(f[0])<=parseInt(g[1])){a=l[j];l[d]="65535";d=j}}}}}}if(f.length==2){if(g.length==1){if(parseInt(f[0])>parseInt(g[0])){if(parseInt(f[0])-parseInt(g[0])==1){l[j]=g[0]+"-"+f[1];l[d]="65535"}a=l[j];d=j}else{if(parseInt(g[0])-parseInt(f[1])==1){l[d]=f[0]+"-"+g[0];a=l[d];l[j]="65535"}else{if(parseInt(f[0])<=parseInt(g[0])&&parseInt(f[1])>=parseInt(g[0])){l[j]="65535"}}}}if(g.length==2){if(parseInt(f[0])>parseInt(g[1])){if(parseInt(f[0])-parseInt(g[1])==1){l[j]=g[0]+"-"+f[1];l[d]="65535"}a=l[j];d=j}else{if(parseInt(g[0])-parseInt(f[1])==1){l[d]=f[0]+"-"+g[1];a=l[d];l[j]="65535"}else{if(parseInt(f[1])>=parseInt(g[0])&&parseInt(f[1])<=parseInt(g[1])){l[d]=f[0]+"-"+g[1];a=l[d];l[j]="65535"}else{if(parseInt(f[0])>=parseInt(g[0])&&parseInt(f[1])<=parseInt(g[1])){a=l[j];l[d]="65535";d=j}}}}}}}if(i!=d){var e=l[i];l[i]=l[d];l[d]=e}}var c="";for(i=0;i<l.length;i++){if(l[i]=="65535"){continue}else{c=c+l[i]+","}}return c}function forwarding_range_check(c){if(c==""){return false}for(i=0;i<c.length;i++){if(isValidForwardPort(c.charCodeAt(i))==false){return false}}var a=c.split(",");for(i=0;i<a.length;i++){var b=a[i].split("-");if(b.length==1){if(parseInt(a[i],10)<1||parseInt(a[i],10)>65534){return false}}else{if(b.length==2){if(b[0]==""||b[1]==""){return false}if(parseInt(b[0],10)<1||parseInt(b[0],10)>65534){return false}if(parseInt(b[1],10)<1||parseInt(b[1],10)>65534){return false}}else{return false}}}return true}function check_forwarding_add_range(cf,flag){cf.serflag.value=0;if(cf.portname.value==""){alert("$invalid_ser_name");return false}for(i=0;i<cf.portname.value.length;i++){if(isValidChar_space(cf.portname.value.charCodeAt(i))==false){alert("$invalid_ser_name");return false}}cf.portname.value=cf.portname.value.replace(/ /g,"&harr;");for(i=1;i<=forward_array_num;i++){var str=eval("forwardingArray"+i).replace(/&#92;/g,"\\").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#34;/g,'"').replace(/&#39;/g,"'").replace(/&#35;/g,"#").replace(/&#38;/g,"&");var each_info=str.split(" ");each_info[0]=each_info[0].replace(/&harr;/g," ");if(flag=="edit"){if(each_info[0]==cf.portname.value&&!(select_editnum<=i&&i<parseInt(select_editnum)+parseInt(edit_num))&&each_info[7]==0){alert("$forwarding_ser_name_dup");return false}}else{if(each_info[0]==cf.portname.value){alert("$forwarding_ser_name_dup");return false}}}cf.service_ip.value=cf.server_ip1.value+"."+cf.server_ip2.value+"."+cf.server_ip3.value+"."+cf.server_ip4.value;if(checkipaddr(cf.service_ip.value)==false||is_sub_or_broad(cf.service_ip.value,lan_ip,lan_subnet)==false){alert("$invalid_ip");return false}cf.service_ip.value=address_parseInt(cf.service_ip.value);if(isSameSubNet(cf.service_ip.value,lan_subnet,lan_ip,lan_subnet)==false){alert("$diff_lan_this_subnet");return false}if(isSameIp(cf.service_ip.value,lan_ip)==true){alert("$invalid_ip");return false}var str_exter_port=remove_space_commas(cf.exter_port.value);if(forwarding_range_check(str_exter_port)==false){alert("$ports_error_external");return false}var str_internal_port="";if(cf.same_range.checked==true){cf.hidden_port_range.value="1";str_internal_port=str_exter_port}else{cf.hidden_port_range.value="0";str_internal_port=remove_space_commas(cf.internal_port.value);if(forwarding_range_check(str_internal_port)==false){alert("$ports_error_internal");return false}}var ext_start_port="";var ext_end_port="";var int_start_port="";var int_end_port="";var ext_each=str_exter_port.split(",");var int_each=str_internal_port.split(",");if(ext_each.length!=int_each.length){alert("$ports_error_mismatch");return false}for(i=0;i<ext_each.length;i++){var tmp_ext=ext_each[i].split("-");var tmp_int=int_each[i].split("-");if(tmp_ext.length!=tmp_int.length){alert("$ports_error_mismatch");return false}if(tmp_ext.length==1){ext_start_port=ext_start_port+tmp_ext[0]+",";ext_end_port=ext_end_port+tmp_ext[0]+",";int_start_port=int_start_port+tmp_int[0]+",";int_end_port=int_end_port+tmp_int[0]+","}else{if((parseInt(tmp_ext[1])-parseInt(tmp_ext[0]))!=(parseInt(tmp_int[1])-parseInt(tmp_int[0]))){alert("$ports_error_mismatch");return false}ext_start_port=ext_start_port+tmp_ext[0]+",";ext_end_port=ext_end_port+tmp_ext[1]+",";int_start_port=int_start_port+tmp_int[0]+",";int_end_port=int_end_port+tmp_int[1]+","}}var input_sertype=cf.srvtype.value;var input_ip=cf.service_ip.value;var input_ext_start_port=ext_start_port.split(",");var input_ext_end_port=ext_end_port.split(",");var input_int_start_port=int_start_port.split(",");var input_int_end_port=int_end_port.split(",");for(k=0;k<input_ext_start_port.length-1;k++){for(i=1;i<=forward_array_num;i++){var str=eval("forwardingArray"+i).replace(/&#92;/g,"\\").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#34;/g,'"').replace(/&#39;/g,"'").replace(/&#35;/g,"#").replace(/&#38;/g,"&");var each_info=str.split(" ");sertype=each_info[1];ext_startport=each_info[2];ext_endport=each_info[3];int_startport=each_info[4];int_endport=each_info[5];forwardingip=each_info[6];serflag=each_info[7];if(sertype=="UDP"&&serflag=="1"){}else{if(sertype=="TCP/UDP"||sertype==input_sertype||input_sertype=="TCP/UDP"){var ext_bigger_port=parseInt(ext_endport)>parseInt(ext_startport)?parseInt(ext_endport):parseInt(ext_startport);var ext_smaller_port=parseInt(ext_endport)>parseInt(ext_startport)?parseInt(ext_startport):parseInt(ext_endport);var int_bigger_port=parseInt(int_endport)>parseInt(int_startport)?parseInt(int_endport):parseInt(int_startport);var int_smaller_port=parseInt(int_endport)>parseInt(int_startport)?parseInt(int_startport):parseInt(int_endport);var input_ext_bigger_port=parseInt(input_ext_end_port[k])>parseInt(input_ext_start_port[k])?parseInt(input_ext_end_port[k]):parseInt(input_ext_start_port[k]);var input_ext_smaller_port=parseInt(input_ext_end_port[k])>parseInt(input_ext_start_port[k])?parseInt(input_ext_start_port[k]):parseInt(input_ext_end_port[k]);var input_int_bigger_port=parseInt(input_int_end_port[k])>parseInt(input_int_start_port[k])?parseInt(input_int_end_port[k]):parseInt(input_int_start_port[k]);var input_int_smaller_port=parseInt(input_int_end_port[k])>parseInt(input_int_start_port[k])?parseInt(input_int_start_port[k]):parseInt(input_int_end_port[k]);if(flag=="edit"){if(!(select_editnum<=i&&i<parseInt(select_editnum)+parseInt(edit_num))&&(!(ext_bigger_port<input_ext_smaller_port||input_ext_bigger_port<ext_smaller_port))){alert("$ports_error_conflict");return false}if(!(select_editnum<=i&&i<parseInt(select_editnum)+parseInt(edit_num))&&forwardingip==input_ip&&!(int_bigger_port<input_int_smaller_port||int_smaller_port>input_int_bigger_port)){if(!(input_int_smaller_port==int_smaller_port||int_bigger_port==input_int_bigger_port)){alert("$ports_error_conflict");return false}}}else{if(flag=="add"){if(!(ext_bigger_port<input_ext_smaller_port||input_ext_bigger_port<ext_smaller_port)){alert("$ports_error_conflict");return false}if(forwardingip==input_ip&&!(int_bigger_port<input_int_smaller_port||int_smaller_port>input_int_bigger_port)){if(!(input_int_smaller_port==int_smaller_port||int_bigger_port==input_int_bigger_port)){alert("$ports_error_conflict");return false}}}}}}}for(i=1;i<=trigger_array_num;i++){var str=eval("triggeringArray"+i).replace(/&#92;/g,"\\").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&#40;/g,"(").replace(/&#41;/g,")").replace(/&#34;/g,'"').replace(/&#39;/g,"'").replace(/&#35;/g,"#").replace(/&#38;/g,"&");var each_info=str.split(" ");triggeringip=each_info[2];consertype=each_info[5];constart_port=each_info[6];conend_port=each_info[7];if(!(parseInt(conend_port)<parseInt(input_ext_start_port[k])||parseInt(input_ext_end_port[k])<parseInt(constart_port))||!(parseInt(conend_port)<parseInt(input_int_start_port[k])||parseInt(input_int_end_port[k])<parseInt(constart_port))){if((consertype=="TCP/UDP"||input_sertype=="TCP/UDP"||input_sertype==consertype)&&(triggeringip=="any"||input_ip!=triggeringip)){alert(invalid_port_used);return false}}}for(i=1;i<=upnp_array_num;i++){var str=eval("upnpArray"+i);var each_info=str.split(";");upnp_protocal=each_info[1];upnp_int=each_info[2];upnp_ext=each_info[3];upnp_ip=each_info[4];if((parseInt(upnp_ext)>=parseInt(input_ext_start_port)&&parseInt(upnp_ext)<=parseInt(input_ext_end_port))||(parseInt(upnp_ext)>=parseInt(input_int_start_port)&&parseInt(upnp_ext)<=parseInt(input_int_end_port))){if((upnp_protocal=="TCP/UDP"||input_sertype=="TCP/UDP"||input_sertype==upnp_protocal)&&input_ip!=upnp_ip){alert(invalid_port_used);return false}}}if(usb_router_flag==1){if(input_sertype!="UDP"){if(check_readyshare_port(input_ext_start_port[k],input_ext_end_port[k],"WAN")==false||check_readyshare_port(input_int_start_port[k],input_int_end_port[k],"WAN")==false){alert(invalid_port_used);return false}}}if(endis_remote=="1"&&cf.srvtype.value!="UDP"){if((!(parseInt(remote_port)<parseInt(input_ext_start_port[k])||parseInt(input_ext_end_port[k])<parseInt(remote_port))&&remote_port!="")||(!(parseInt(remote_port)<parseInt(input_int_start_port[k])||parseInt(input_int_end_port[k])<parseInt(remote_port))&&remote_port!="")){alert(invalid_port_used);return false}}if((parseInt(input_ext_start_port[k])<=123&&parseInt(input_ext_end_port[k])>=123&&endis_ntp=="1"&&cf.srvtype.value!="TCP")||(parseInt(input_int_start_port[k])<=123&&parseInt(input_int_end_port[k])>=123&&endis_ntp=="1"&&cf.srvtype.value!="TCP")){alert(invalid_port_used);return false}if((parseInt(input_ext_start_port[k])<=1900&&parseInt(input_ext_end_port[k])>=1900&&endis_upnp=="1"&&cf.srvtype.value!="TCP")||(parseInt(input_int_start_port[k])<=1900&&parseInt(input_int_end_port[k])>=1900&&endis_upnp=="1"&&cf.srvtype.value!="TCP")){alert(invalid_port_used);return false}if((parseInt(input_ext_start_port[k])<=5050&&parseInt(input_ext_end_port[k])>=5050&&info_get_wanproto=="bigpond"&&cf.srvtype.value!="TCP")||(parseInt(input_int_start_port[k])<=5050&&parseInt(input_int_end_port[k])>=5050&&info_get_wanproto=="bigpond"&&cf.srvtype.value!="TCP")){alert(invalid_port_used);return false}if(((cf.srvtype.value.toLowerCase()==vpn_tun_type||cf.srvtype.value=="TCP/UDP")&&vpn_tun_port!=""&&(!(parseInt(vpn_tun_port)<parseInt(input_ext_start_port[k])||parseInt(input_ext_end_port[k])<parseInt(vpn_tun_port))||!(parseInt(vpn_tun_port)<parseInt(input_int_start_port[k])||parseInt(input_int_end_port[k])<parseInt(vpn_tun_port))))||((cf.srvtype.value.toLowerCase()==vpn_type||cf.srvtype.value=="TCP/UDP")&&vpn_port!=""&&(!(parseInt(vpn_port)<parseInt(input_ext_start_port[k])||parseInt(input_ext_end_port[k])<parseInt(vpn_port))||!(parseInt(vpn_port)<parseInt(input_int_start_port[k])||parseInt(input_int_end_port[k])<parseInt(vpn_port))))){alert(invalid_port_used);return false}if(cf.srvtype.value=="TCP"||cf.srvtype.value=="TCP/UDP"){if(parseInt(input_ext_end_port[k])>="1720"&&parseInt(input_ext_start_port[k])<="1720"){cf.serflag.value=1}}}cf.port_start.value=ext_start_port;cf.port_end.value=ext_end_port;cf.hidden_port_int_start.value=int_start_port;cf.hidden_port_int_end.value=int_end_port;if(typeof(apply_flag)!="undefined"){apply_flag=1}cf.submit();return true}function int_port_value(){var a=document.forms[0];if(a.same_range.checked==true){a.internal_port.value=a.exter_port.value}}function click_arrange_by_ip(){var d=document.getElementById("pf_record");var b=d.tBodies[0];var e=b.rows;var f=new Array();for(var c=0;c<e.length;c++){f[c]=e[c]}f.sort(compareCols(5,"int"));var a=document.createDocumentFragment();for(var c=0;c<f.length;c++){if(c%2==1){f[c].className="even_line"}else{f[c].className="odd_line"}f[c].cells[1].innerHTML=c+1;f[c].cells[1].className="subhead";a.appendChild(f[c])}b.appendChild(a)}function show_devices(){var xmlhttp,xmlDoc;var msg='<TABLE id="attach_device" border=1 cellpadding=2 cellspacing=0 width=100%><TR><TD nowrap align=center><span class="subhead"> &nbsp; </span></TD><TD nowrap align=center><span class="subhead">$lan_mark_ip</span></TD><TD nowrap align=center><span class="subhead">$lan_mark_name</span></TD></TR>';if(window.XMLHttpRequest){xmlhttp=new XMLHttpRequest()}else{xmlhttp=new ActiveXObject("Microsoft.XMLHTTP")}xmlhttp.onreadystatechange=function(){if(xmlhttp.readyState==4&&xmlhttp.status==200){eval(xmlhttp.responseText);len=device.length;for(var j=0;j<len;j++){var str_name=device[j]["name"];str_name=str_name.replace(/&#38;/g,"&");attach_name_array[i]=str_name;attach_ip_array[i]=device[j]["ip"];msg+='<TR><TD nowrap align=center><input type="radio" name="MacSelect" id="mac_select'+(i+1)+'" value="'+i+'" onclick="ipaddr_value('+i+')"></TD><TD nowrap align=center>'+attach_ip_array[i]+"</TD><TD nowrap align=center>"+attach_name_array[i]+"</TD></TR>";i++}msg+="</table>";document.getElementById("devices").innerHTML=msg}};xmlhttp.open("GET","DEV_device_info.htm?ts="+new Date().getTime(),true);xmlhttp.send()}function ipaddr_value(a){var c=document.forms[0];var b=attach_ip_array[a].split(".");c.server_ip1.value=b[0];c.server_ip2.value=b[1];c.server_ip3.value=b[2];c.server_ip4.value=b[3]}function back_reload_page(a){console.log("back_flag=%s",top.back_flag);if(top.back_flag==1){location.href=a;top.back_flag=0}};