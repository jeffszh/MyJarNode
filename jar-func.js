var spawn = require('child_process').spawn;

module.exports = function (RED) {
	function JarFuncNode(config) {
		RED.nodes.createNode(this, config);
		var node = this;
		node.name = config.name;
		node.jar = config.jar;
		this.topic = config.topic;
		this.activeProcesses = {};

		var options = ["-jar", node.jar];
		child = spawn("java", options, {encoding: "binary"});

		// child.stdout.on('data', function (data) {
		// 	try {
		// 		// data = iconv.decode(data, encoding);
		// 		console.log("jar stdout: " + data);
		// 		try {
		// 			var msg = JSON.parse(data);
		// 			node.send(msg);
		// 			node.status({});
		// 		} catch (e) {
		// 			console.log("jar other text: [" + data + "]");
		// 		}
		// 	} catch (error) {
		// 		node.error("error: " + error);
		// 		node.status({fill: "red", shape: "ring", text: "error"});
		// 	}
		// });

		var remaining = '';
		child.stdout.on('data', function (data) {
			try {
				// data = iconv.decode(data, encoding);
				remaining += data;
				var index = remaining.indexOf('\n');
				while (index > -1) {
					var line = remaining.substring(0, index);
					remaining = remaining.substring(index + 1);
					console.log("jar out: " + line);
					try {
						var msg = JSON.parse(line);
						node.send(msg);
						node.status({});
					} catch (e) {
					}
					index = remaining.indexOf('\n');
				}
			} catch (error) {
				node.error("error: " + error);
				node.status({fill: "red", shape: "ring", text: "error"});
			}
		});

		// var Lazy=require("lazy");
		// new Lazy(child.stdout)
		// 	.lines
		// 	.forEach(
		// 		function(line) {
		// 			console.log("line=" + line.toString());
		// 		}
		// 	);

		child.stderr.on('data', function (data) {
			// data = iconv.decode(data, encoding);
			node.error("error: " + data);
			node.status({fill: "red", shape: "ring", text: "error"});
		});
		child.on('close', function (code, signal) {
			console.log("close jar: " + code + ", " + signal);
		});
		child.on('error', function (code) {
			node.error("error: " + code);
			node.status({fill: "red", shape: "ring", text: "error"});
		});
		node.activeProcesses[child.pid] = child;

		this.on("input", function (msg) {
			try {
				node.status({fill: "green", shape: "dot", text: "executing..."});
				child.stdin.write(JSON.stringify(msg) + "\n");
			} catch (error) {
				node.error("error: " + error);
				node.status({fill: "red", shape: "ring", text: "error"});
			}
		});
		this.on("close", function () {
			for (var pid in node.activeProcesses) {
				if (node.activeProcesses.hasOwnProperty(pid)) {
					if (node.activeProcesses[pid].tout) {
						clearTimeout(node.activeProcesses[pid].tout);
					}
					var process = node.activeProcesses[pid];
					node.activeProcesses[pid] = null;
					process.kill();
				}
			}
			node.activeProcesses = {};
			node.status({});
		});
	}

	RED.nodes.registerType("jar-func", JarFuncNode);
}
