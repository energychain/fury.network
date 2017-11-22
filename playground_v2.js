var ipfs_service="https://ipfs.io/ipfs/";
var storage=function() {};
var persist_timeout={};
$.qparams = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return decodeURI(results[1]) || 0;
    }
}


function setCold(bucket,obj) {	
	const ipfs = new Ipfs();

	ipfs.on('ready', () => {
		var data=[];
		data.push({path:"/fury.network"});
		
		for(var i=0;i<obj.length;i++) {		
			if(obj[i].file=="playground_base.html") obj[i].file="index.html";
			if(obj[i].file=="playground_base.js") obj[i].file="base.js";		
			data.push({content:new ipfs.types.Buffer(obj[i].content,'utf-8'),path:"/fury.network/"+obj[i].file});
			//data.push({content:obj[i].content,path:"/fury.network/"+obj[i].file});
			obj[i].cmEditor="";							
		}
		

			
		
		ipfs.files.add(data, function (err, files) {
			console.log(err,files);
				window.localStorage.setItem(extid+"_"+bucket,files[0].hash);	
				var ld_cnt=0;	
				for(var i=0;i<files.length;i++) {
					$.get(ipfs_service+files[i].hash,function(data) {
							ld_cnt++;
					});	
				}
				$('#fsURL').val(ipfs_service+files[0].hash+"/");
				$('#colabURL').val("https://fury.network/?hash="+files[0].hash+"&extid="+extid);
				setInterval(function() {
					if(ld_cnt==files.length) {
						location.replace("./?hash="+files[0].hash+"&extid="+extid);
					}
				},100);
				console.log(ipfs_service+files[0].hash);
		});			
	}); 
}

function renderEditor(files,store) {
	
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
	  document.persist_store=store;
	})	
	
	$( "#editor_1" ).trigger( "change" );
	
}

function persist_function() {
	setCold("playground",document.persist_store);	  	
}
function init() {
	var base="./";
	
	if($.qparams("base")!=null) {
			base=$.qparams("base");
	}
	var files= [{
						  type: 'html',
						  name: 'html',
						  url: base+'/playground_base.html'
						},
						{
						  type: 'js',
						  name: 'js',
						  url: base+'/playground_base.js'
						}	
				];		
	if($.qparams("hash")!=null) {
			files[0].url=ipfs_service+$.qparams("hash")+"/index.html";
			files[1].url=ipfs_service+$.qparams("hash")+"/base.js";
			$.get(files[0].url,function(data) {
				files[0].content=data;
				$.get(files[1].url,function(data) {
					files[1].content=data;
					console.log(files);
					var store = files.slice();			
					renderEditor(files,store);
					persist_store=store;
					//persist_function();
				});
			});
	} else {
		var store = files.slice();			
		renderEditor(files,store);
		persist_store=store;
		//persist_function();
	}
					
}
$('#persist').click(function() {
 $("#editor_1").toggle();
 persist_function();		
});
var extid="fury.network."+Math.random();
var hash_q="?";

if($.qparams("hash")!=null) {
	hash_q="&hash="+$.qparams("hash");
	$('#fsURL').val(ipfs_service+$.qparams("hash")+"/");
	$('#colabURL').val("https://fury.network/?hash="+$.qparams("hash")+"&extid="+extid);
}
if($.qparams("base")!=null) {
	hash_q+="&base="+$.qparams("base");
}

if($.qparams("extid")!=null) {
		extid=$.qparams("extid");
} else {
		location.href="?extid=fury.guest."+Math.random()+hash_q;
}

init();

