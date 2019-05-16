var modules = {
	site:"",
	modulename:"",

	states:[],
	modulestates:[],

	module:function(info){
		this.name = info.name;
		this.info = info.info;
		this.modulename = info.module;
		this.node = document.createElement("li");
		button = document.createElement("button");
		button.onclick = function(){modules.tosite(info.module)};
		subnode = document.createTextNode(this.name);
		button.appendChild(subnode);
		this.node.appendChild(button);

		document.getElementById("navbar-list").appendChild(this.node);
	},

	modulehost:function(info){
		this.node = modules.node("tr","content-element");
		this.node.appendChild(modules.node("td","",info.status));
		this.node.appendChild(modules.node("td","",info.name));
		this.node.appendChild(modules.node("td","",info.address));
		this.node.appendChild(modules.node("td","",info.info));

		document.getElementById("content-list").appendChild(this.node);

		this.fetch = function(){
			return;
		};
	},

	tosite:function(modname){
		if ( modname == modules.modulename || modname == "" ){
			return;
		}
		modules.modulename = modname;
		modules.modulestates=[];
		table = document.getElementById("content-list");
		document.querySelectorAll('.content-element').forEach(function(ele){
			table.removeChild(ele);
		});

		ajax.asyncGet("module/"+modules.modulename+"/"+modules.modulename+".json", function(request){
			if(request.status != 200){
				window.alert("Failed to fetch module/"+modules.modulename+"/"+modules.modulename+".json, HTTP " + request.status);
				return;
			}
			try{
				var data = JSON.parse(request.responseText);
			}
			catch(e){
				window.alert("Failed to parse module json file: " + e);
				return;
			}
			data.forEach(function(modname){
				modules.modulestates.push(new modules.modulehost(modname));
			});
			modules.updatemodule();
		},
		function(e){
			window.alert("Failed to load status information: " + e);
		});
		window.setInterval(modules.updatemodule, 10000);
	},

	node:function(tag, cname, text, child){
		var node = document.createElement(tag);
		if(cname){
			node.className = cname;
		}
		if(text){
			node.textContent = text;
		}
		if(child){
			node.appendChild(child);
		}
		return node;
	},

	init:function(){
		ajax.asyncGet("info.json", function(request){
			if(request.status != 200){
				window.alert("Failed to fetch info.json - HTTP " + request.status);
				return;
			}
			try{
				var data = JSON.parse(request.responseText);
			}
			catch(e){
				window.alert("Failed to parse info.json: " + e);
				return;
			}
			if(data.length > 0){

			}else{
				return;
			}
			data.forEach(function(info){
				modules.states.push(new modules.module(info));
			});
			modules.tosite(data[0].module);
		},
		function(e){
			window.alert("Failed to load status information: " + e);
		});

	},

	updatemodule:function(){
		modules.modulestates.forEach(function(info){
			info.fetch();
		});
	}
};