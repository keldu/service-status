var modules = {
	state:[],
	moduleToHost:[],
	site:"",
	type:"",

	hostRow:function(host) {

	},

	tableHeader:function(mods) {

		mods.forEach(function(item,index){

		});
	},

	availability:function(statuscode) {

	},

	createTable:function(data) {
		var content = document.getElementById("content");
		while(content.lastChild){
			content.remove(content.lastChild);
		}
		content.appendChild(modules.node("table","content-table"));

		modules.tableHeader(data.modules);
		data.modules.forEach(function(item,index){
			modules.hostRow(item);
		});

	},

	node:function(tag,id,cname,text,child){
		var node = document.createElement(tag);
		if(id){
			node.id = id;
		}
		if(classname){
			node.className = cname;
		}
		if(text){
			node.textContent = text;
		}
		if(child){
			node.appendChild(child);
		}

		return node;
	}
	/* Button callbacks BEGIN */

	setHost:function(data, targetHost){
		if( (targetHost == modules.site && modules.type =="host" ) || modules.site == ""){
			return;
		}
		modules.type = "host";
		modules.site = targetHost;

		ajax.asyncGet("hosts/"+targetHost+".json",function(request){
			if(request.status != "200"){
				window.alert("Failed to fetch");
				modules.state = [];
				moduleToHost = [];
				modules.site = "";
				modules.type = "";
				return;
			}
			try {
				var json_data = JSON.parse(request.responseText);
				modules.state.hosts[modules.site] = json_data;
			}
			catch(e){
				window.alert("Failed to parse host json: " + e);
				modules.state = [];
				moduleToHost = [];
				modules.site = "";
				modules.type = "";
				return;
			}
		},
		function(e){
			window.alert("Failed to parse host json: " + e);
		});
	}

	setModule:function(data,targetModule){
		if( (targetModule == modules.site && modules.type == "module" ) || modules.site == ""){
			return;
		}
		modules.type = "module";
		modules.site = targetModule;

		ajax.asyncGet("modules/"+targetModule+".json",function(request){
			if(request.status != "200"){
				window.alert("Failed to fetch");
				modules.state = [];
				moduleToHost = [];
				modules.site = "";
				modules.type = "";
				return;
			}
			try {
				var json_data = JSON.parse(request.responseText);
				modules.state.modules[modules.site] = json_data;
			}
			catch(e){
				window.alert("Failed to parse module json: " + e);
				modules.state = [];
				moduleToHost = [];
				modules.site = "";
				modules.type = "";
				return;
			}
		},
		function(e){
			window.alert("Failed to parse module json: " + e);
		});
	}

	setHome:function(data){
		if ( modules.site == "home" && modules.type == "home" ){
			return;
		}
		modules.site = "home";
		modules.type = "home";

		ajax.asyncGet("monitor.json",function(request){
			if(request.status != "200"){
				window.alert("Failed to fetch");
				modules.state = [];
				moduleToHost = [];
				modules.site = "";
				modules.type = "";
				return;
			}
			try {
				var json_data = JSON.parse(request.responseText);
				modules.state = json_data;
			}
			catch(e){
				window.alert("Failed to parse monitor.json: " + e);
				modules.state = [];
				moduleToHost = [];
				modules.site = "";
				modules.type = "";
				return;
			}
		},
		function(e){
			window.alert("Failed to parse monitor.json: " + e);
		});
	}

	/* Button callbacks END */

	init:function() {
		ajax.asyncGet("monitor.json",function(request){
			if(request.status != "200"){
				window.alert("Failed to fetch");
				return;
			}
			try {
				var json_data = JSON.parse(request.responseText);
				modules.state = json_data;
				modules.initReferences(json_data);
			}
			catch(e){
				window.alert("Failed to parse monitor.json: " + e);
				modules.state = [];
				modules.moduleToHost = [];
				return;
			}
			modules.setHome(modules.state);
		},
		function(e){
			window.alert("Failed to parse monitor.json: " + e);
		});
	}

	initReferences:function(data){
		modules.moduleToHost = [];
		if(data.host){
			data.host.forEach(function(shost,index){
				window.alert(index);
			});
		}
	}
};