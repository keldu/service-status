var modules = {
	states:[],

	module:function(info){
		this.name = info.name;
		this.info = info.info;
		this.file = info.file;
		this.node = modules.node("div", "module", "", modules.node("img", "module-image"));
		subnode = modules.node("div", "module-text", "", modules.node("div", "module-meta", "", modules.node("h1", "", this.name)));
		subnode.appendChild(modules.node("div", "module-info"));
		this.node.appendChild(subnode);

		this.node.getElementsByClassName("module-meta")[0].appendChild(document.createTextNode(this.info));
		this.node.getElementsByClassName("module-info")[0].textContent = " -- no data yet --";
		this.node.getElementsByClassName("module-image")[0].src = "static/reported.svg";

		document.getElementById("center-box").appendChild(this.node);

		this.fetch = function(){
			var _self = this;
			ajax.asyncGet(this.file, function(request){
				if(request.status != 200){
					_self.node.getElementsByClassName("module-info")[0].textContent = "Failed to fetch";
					return;
				}
				try{
					var data = JSON.parse(request.responseText);
				}
				catch(e){
					_self.node.getElementsByClassName("module-info")[0].textContent = "Failed to parse incoming data";
					return;
				}
				_self.state = data;
				_self.update();
			},
			function(e){
				this.node.getElementsByClassName("module-info")[0].textContent = "Failed to fetch";
			});
		};

		this.update = function(){
			this.node.getElementsByClassName("module-image")[0].src = "static/" + this.state.state + ".svg";
			this.node.getElementsByClassName("module-info")[0].innerHTML = "Last check: " + this.state.last + "<br/>" + this.state.info;
		};
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
			data.forEach(function(module){
				modules.states.push(new modules.module(module));
			});
			modules.update();
		},
		function(e){
			window.alert("Failed to load status information: " + e);
		});

		window.setInterval(modules.update, 10000);
	},

	update:function(){
		modules.states.forEach(function(module){
			module.fetch();
		});
	}
};
