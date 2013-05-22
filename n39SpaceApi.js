var http = require('http');
var util = require('util');

function getStatus(cb) {
	http.get('http://spaceapi.n39.eu/json', function(res) {
		var data = "";
		res.on('data', function(chunk) {
			data = data + chunk;
		});
		res.on('end', function() {
			data = JSON.parse(data);
			var str = "";
			if(data.open) {
				str = "Netz39 is open";
			} else {
				str = "Netz39 is closed";
			}
			str = str + " since " + (new Date(data.lastchange * 1000)).toLocaleString();
			cb(str);
		});
	}).on('error', function(err) {
		util.puts(err);
	});
}

exports.getStatus = getStatus;
