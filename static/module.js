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
		this.file = "module/"+info.module+"/"+info.module+".json";
		button = document.createElement("button");
		button.onclick = function(){modules.tosite(info)};
		subnode = document.createTextNode(this.name);
		button.appendChild(subnode);
		this.node.appendChild(button);

		document.getElementById("navbar-list").appendChild(this.node);
	},

	modulehost:function(info){
		this.state = info;

		this.node = modules.node("tr","content-element");
		this.node.appendChild(modules.node("td","element-status",info.status));
		this.node.appendChild(modules.node("td","element-name",info.name));
		this.node.appendChild(modules.node("td","element-address",info.address));
		this.node.appendChild(modules.node("td","element-time",new Date(info.time*1000).toLocaleString()));
		this.node.appendChild(modules.node("td","element-changed",new Date(info.changed*1000).toLocaleString()));
		this.node.appendChild(modules.node("td","element-info",info.info));

		document.getElementById("content-list").appendChild(this.node);

		this.fetch = function(){
			var _self = this;
			ajax.asyncGet("module/"+modules.modulename+"/hosts/"+_self.state.name+".json", function(request){
				if(request.status != 200){
					_self.node.getElementsByClassName("element-info")[0].textContent = "Failed to fetch";
					return;
				}
				try{
					var data = JSON.parse(request.responseText);
				}
				catch(e){
					_self.node.getElementsByClassName("element-info")[0].textContent = "Failed to parse incoming data";
					return;
				}
				_self.state = data;
				_self.update();
			},
			function(e){
				this.node.getElementsByClassName("element-info")[0].textContent = "Failed to fetch";
			});
		};

		this.update = function(){
			this.node.getElementsByClassName("element-info")[0].textContent = this.state.info;
			this.node.getElementsByClassName("element-status")[0].textContent = this.state.status;
			this.node.getElementsByClassName("element-time")[0].textContent = new Date(this.state.time*1000).toLocaleString();
			this.node.getElementsByClassName("element-changed")[0].textContent = new Date(this.state.changed*1000).toLocaleString();
		};
	},

	tosite:function(modname){
		if ( modname.module == modules.modulename || modname.module == "" ){
			return;
		}
		modules.modulename = modname.module;
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
			data.forEach(function(moduleelement){
				modules.modulestates.push(new modules.modulehost(moduleelement));
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
			modules.tosite(data[0]);
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