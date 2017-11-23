var abilocation="https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/";

function resolve(address) {
	name=address;
	if(window.localStorage.getItem("address_"+address.toLowerCase())!=null) {
			name=window.localStorage.getItem("address_"+address.toLowerCase());
	}
	if(name.length<1) name=address;
	if(name.length>17) name=name.substr(0,17)+"...";
	return name;
}

$.qparams = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}

var extid="fury.network."+Math.random();

if($.qparams("extid")!=null) {
		extid=$.qparams("extid");
}
var node = new document.StromDAOBO.Node({external_id:extid,testMode:true,rpc:"https://demo.stromdao.de/rpc",abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});

// Fill View (HTML) using JQuery
$('.account').html(node.wallet.address);

function open_username(node) {
	$('.account').html(resolve(node.wallet.address));
	node.roleLookup().then(function(rl) {
		$('#brain_frm').hide();
		$('#pk_frm').hide();
		$('#app').show();
		rl.relations(node.wallet.address,43).then(function(tx) {
				document.stromdao_mptoken=tx;				
		});
		rl.relations(node.wallet.address,42).then(function(tx) {
				document.stromdao_sc=tx;
				app("./app_dashboard.html");
		});
		rl.relations(node.wallet.address,41).then(function(tx) {
				document.stromdao_blg=tx;				
		});
		rl.relations(node.wallet.address,45).then(function(tx) {
				document.stromdao_cutkn=tx;				
		});
	});	
}
$('#open_username').click(function() {
	$('#open_username').attr('disabled','disabled');
	var account_obj=new document.StromDAOBO.Account($('#username').val(),$('#password').val());
	account_obj.wallet().then(function(wallet) {
		node.roleLookup().then(function(rl) {
			rl.relations(wallet.address,222).then(function(tx) {
				if(tx=="0x0000000000000000000000000000000000000000") {
					$('#pk_secret').val(node.wallet.privateKey);
					$('#brain_frm').hide();									
					$('#pk_frm').show();
					$('#cancel_pk').click(function() {
							$('#pk_rm').hide();
							$('#brain_frm').show();
					});
					$('#open_pk').click(function() {
						$('#open_pk').attr('disabled','disabled');
						$('#cancel_pk').attr('disabled','disabled');
						account_obj.encrypt($('#pk_secret').val()).then(function(enc) {
							node.stringstoragefactory().then(function(ssf) {
								ssf.build(enc).then(function(ss) {											
									window.localStorage.setItem("ext:"+extid,$('#pk_secret').val());
									node = new document.StromDAOBO.Node({external_id:extid,testMode:true,rpc:"https://fury.network/rpc",abilocation:abilocation	});
									node.roleLookup().then(function(rl2) {
										rl2.setRelation(222,ss).then(function(tx) {
												open_username(node);									
										});
									});
								});
							});
						});
					});
				} else {
					node.stringstorage(tx).then(function(ss) {
						ss.str().then(function(str) {
							account_obj.decrypt(str).then(function(pk) {
																
								window.localStorage.setItem("ext:"+extid,pk);
								node = new document.StromDAOBO.Node({external_id:extid,testMode:true,rpc:"https://fury.network/rpc",abilocation:abilocation});
								$('.account').html(resolve(node.wallet.address));
								node.roleLookup().then(function(rl) {
									rl.relations(node.wallet.address,42).then(function(tx) {
										open_username(node);
									});
								});	
							});
						});
					});
				}
			});
		});
	});
});	

/* Token Code */

function refreshTokenInfo() {
$('#issueToken').attr('disabled','disabled');
if(document.stromdao_mptoken!=null) {
	$('#tt_address').html(node.storage.getItemSync("time_token"));
	$('#pt_address').html(node.storage.getItemSync("power_token"));
	node.mptoken(document.stromdao_mptoken).then(function(mpt) {
			mpt.power_token().then(function(power_token) {
					node.storage.setItemSync("power_token",power_token);
			});
			mpt.time_token().then(function(time_token) {
					node.storage.setItemSync("time_token",time_token);
			});
			mpt.issue().then(function(tx) {
				if(node.storage.getItemSync("time_token")!=null) {
					node.erc20token(node.storage.getItemSync("time_token")).then(function(e20) {
							$('.tt_address').html(node.storage.getItemSync("time_token"));
							e20.balanceOf(node.wallet.address).then(function(tx) {
									$('#tt_hold').html(tx);
							});
							e20.totalSupply().then(function(tx) {
									$('#tt_ts').html(tx);
							});
					});
				}		
				if(node.storage.getItemSync("power_token")!=null) {
					node.erc20token(node.storage.getItemSync("power_token")).then(function(e20) {
							$('.pt_address').html(node.storage.getItemSync("power_token"));
							e20.balanceOf(node.wallet.address).then(function(tx) {
									$('#pt_hold').html(tx);
							});
							e20.totalSupply().then(function(tx) {
									$('#pt_ts').html(tx);
									$('#issueToken').removeAttr('disabled');
									if(node.storage.getItemSync("xtoken")==null) {
										$('#createX').removeAttr('disabled');
									}
							});
					});
				}
													
					});
		});
		} else {
				// createToken();
		}
	}


function open_token() {
	
	var tkn=$('#token_contract').val();
	$('#tkn_addr').html(tkn);
	
	node.erc20token(tkn).then(function(token) {		
			token.totalSupply().then(function(b) {
					$('#tkn_supply').html(b);
			});
			token.balanceOf(node.wallet.address).then(function(b) {
				$('#tkn_hold').html(b);
				$('#transferAmount').val(b);
				if(b>0) {
				$('#tkn_tansfer').show();
				}
			});
			$('#tkn_tbl').show();
			
	});
	$('#transfer_tokens').click(function() {
		$('#transfer_tokens').attr('disabled','disabled');
		node.erc20token($('#token_contract').val()).then(function(token) {	
			token.transfer($('#transferTo').val(),$('#transferAmount').val()).then(function(tx) {
				console.log(tx);
				$('#transfer_tokens').removeAttr('disabled');
				open_token();
			});
		});
	});
}

/* Wallet Code  */
function view_token() {
	
	var tkn=$('#view_contract').val();
	$('#view_addr').html(tkn);
	
	node.erc20token(tkn).then(function(token) {		
			token.totalSupply().then(function(b) {
					$('#view_supply').html(b);
			});
			token.balanceOf($('#view_address').val()).then(function(b) {
				$('#view_hold').html(b);			
			});
			$('#view_tbl').show();
			
	});
}	

/* Your APP Goes here */

function app() {
	$('#meterpointaddress').val(node.wallet.address);
	
	
	$('#go').on('click',function() {
		// Create Instance with external ID 1234 and existing private Key (relink)
		$('#go').attr('disabled','disabled');
		$('#result').show();

		node.mpr().then(function(mpr) {
				mpr.storeReading($('#reading').val()).then(function(o) {			
									 console.log(o);		
									 $('#go').removeAttr('disabled');		
				});
		});	
	});

	node.mpr().then(function(mpr) {
		mpr.readings(node.wallet.address).then(function(o) {
				$('#reading').val(o.power);
		});
	});

	$('#go2').on('click',function() {
		
		$('#result2').show();

		node.mpr().then(function(mpr) {
				mpr.readings($('#meterpointaddress').val()).then(function(o) {				
						d=new Date((o.time.toString())*1000);
						$('#ts').html(d.toLocaleString());
						$('#power').html(o.power.toString());				
				});
		});	
	});

	$('#issueToken').click(function() {
		refreshTokenInfo();
	});
	
	$('#open_token').click(function() {open_token()});
	$('#view_token').click(function() {view_token()});
	refreshTokenInfo();

}
