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
		this.fetch = function(){
		}
	},

	tosite:function(modname){
		if ( modname == modules.modulename && modname == "" ){
			return;
		}
		modules.modulename = modname;
		modules.modulestates=[];
		document.getElementById("content-table").innerHTML = "";
		ajax.asyncGet("module/"+modules.modulename+"/"+modules.modulename+".json", function(request){
			if(request.status != 200){
				window.alert("Failed to fetch module/"+modules.modulename+"/"+modules.modulename+".json, HTTP " + request.status);
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
				modules.modulename = data[0].module;
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
				window.alert("Failed to fetch info.json, HTTP " + request.status);
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
				modules.modulename = data[0].module;
			}else{
				return;
			}
			alert(modules.modulename)
			data.forEach(function(info){
				modules.states.push(new modules.module(info));
			});
			modules.tosite(modules.modulename);
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