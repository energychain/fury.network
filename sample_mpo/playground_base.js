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

$('#go3').on('click',function() {
	// Create Instance with external ID 1234 and existing private Key (relink)
	
	$('#result3').show();
	$('#resultTable3').html("<tr><th>Block #</th><th>Reading</th></tr>");
	
	node.mpr().then(function(mpr) {					
			mpr.history($('#meterpointaddress3').val(),10000).then(function(o) {				
				o=o.reverse();	
				for(var i=0;i<o.length;i++) {
						$('#resultTable3').append("<tr><td>"+o[i].blockNumber+"</td><td>"+parseInt(o[i].power,16)+"</td></tr>");
				}
			});
	});	
});


