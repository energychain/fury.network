var api="https://demo.stromdao.de/api/";
var coldAPI=api+"cold/";
token="";
var api_account="";
var editor={};
var persist_store={};
var persist_timeout={};
var persist_function=null;
var perm_account="";

$.qparams = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}

var extid="1234";

if($.qparams("extid")!=null) {
		extid=$.qparams("extid");
}
var node = new document.StromDAOBO.Node({external_id:extid,testMode:true,rpc:"https://demo.stromdao.de/rpc",abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/6dc9e073/smart_contracts/"});


node.stromkonto("0x19BF166624F485f191d82900a5B7bc22Be569895").then(function(sko) {
	sko.balancesHaben(node.wallet.address).then(function(haben) {
		sko.balancesSoll(node.wallet.address).then(function(soll) {		
		    console.log(soll,haben);
			if(haben-soll<=0) {
					$('#infoAccount').show();
			} else {
					$('#infoAccount').hide();
			}
		});
	});	
});



function setCold(bucket,obj) {	
	for(var i=0;i<obj.length;i++) {
			obj[i].cmEditor="";		
	}
	$.post(coldAPI+"set/?token="+token,{bucket:bucket,obj:JSON.stringify(obj),token:token},function(data) {			
		
	});	
}
function getCold(account,bucket,cb) {	
	$.get(coldAPI+"get/",{bucket:bucket,token:token,account:account},function(data) {	
		data = JSON.parse(data);		
		if(typeof data.data != "undefined") {
			cb(JSON.parse(data.data));							
		} else {
				cb({});
		}
	});	
}

function saveSession() {
		
}
$('.fshide').hide();
$.post( api+"auth",{extid:node.wallet.address,secret:node.wallet.privateKey.substr(0,10)},function( data ) {
		data=JSON.parse(data);		
		token=data.token;
		$.post(api+"info/"+node.wallet.address+"?token="+token,{token:token},function(info_data) {
			api_account=JSON.parse(info_data);
			cold_account=api_account;

			if($.qparams("inject")!=null) {
					cold_account=$.qparams("inject");
			}	
			if($.qparams("showcase")!=null) {
					cold_account=$.qparams("showcase");
			}
			if(node.storage.getItemSync(cold_account)!=null) {
				cold_account=node.storage.getItemSync(cold_account);
			}
			if($.qparams("extid")!=null) {
					//cold_account=$.qparams("showcase");
					node.storage.setItemSync($.qparams("extid"),node.wallet.address);
			}
			 $('#colabURL').val(location.protocol+"//"+location.host+""+location.pathname+"?inject="+cold_account);
			$('#fsURL').val(location.protocol+"//"+location.host+""+location.pathname+"?showcase="+cold_account);
			perm_account=cold_account;
			getCold(cold_account,"playground",function(store) {	
				var files= [{
						  type: 'html',
						  name: 'html',
						  url: 'playground_base.html'
						},
						{
						  type: 'js',
						  name: 'js',
						  url: 'playground_base.js'
						}	
				];
				if((typeof store !="undefined") && (store.length==files.length)) {
					for(var i=0;i<files.length;i++) {
							if(typeof store[i].content != undefined) {
								files[i].content=store[i].content;
							}
					}		
				}
				var store = files.slice();
				if(($.qparams("showcase")!=null)&&(files.length==2)) {					
					$('#editor_1').html(files[0].content);
					eval(files[1].content);
					$('.fshide').hide();
					$('#editor_1').height("1000px");
					node.roleLookup().then(
						function(rl) {
							console.log("Has Cold Account",cold_account);
							rl.getName(cold_account).then(function(name) {
							  $('#rlname').html(name);
							  $('#rlname').show();
							  if((name!=null)&&(name.length>0)) {								  
								node.storage.setItemSync(name,$.qparams("showcase"));  
							  }
							});
						}	
					);
				} else {
					$('.fshide').show();
					editor=new Jotted(document.querySelector('#editor_1'), {
							files:files,
							 plugins: [
								'stylus',
								{
								  name: 'codemirror',
								  options: {
									lineNumbers: true
								  }
								}
							  ]
					});	 	
						
					editor.on('change', function (res, cb) {					
					  if (!store.some(function (f, i) {
						if (f.type === res.type) {
						  store[i] = res
						  
						  return true
						}
					  })) {
						
						store.push(res)
					  }

					  cb(null, res)
					  persist_store=store;
					  persist_function=function() {				
							setCold("playground",persist_store);
					  };
					  clearTimeout(persist_timeout);
					  persist_timeout=setTimeout(persist_function,5000);
					   
					})
				}
			});
		});
});
$('#subscribe').click(function() {
	if($('#subscribe').attr('aria-pressed')) {
		  OneSignal.push(function() {		  
			OneSignal.sendTags(JSON.parse('{"'+perm_account+'":"1"}'));
		  });
		} else {
		OneSignal.push(function() {
		  OneSignal.deleteTag(node.wallet.address);
		});
		OneSignal.push(["getNotificationPermission", function(permission) {
			if(permission!="granted") {
				OneSignal.push(function() {
				  OneSignal.showHttpPermissionRequest();
				});
			}			
		}]);
	}	
});
