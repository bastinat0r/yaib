var http = require('http');
var https = require('https');
var util = require('util');
var Shred = require('shred');


var shred = new Shred();

function parse_title(html, cb) {
		html = "" + html.replace(/[\r\n]/g, '');
		title =  html.match(/<\s*title[^>]*>.*<\s*\/\s*title[^>]*>/gi);
		if(title == null)
			return;
		title = ("" + title).replace(/<[\s\/]*title[^>]*>/gi, '');
		cb(title);
};

function from_url(url, cb) {
	util.puts(url);
	var req =shred.get({
		url : url,
		timeout : 10000,
		on : {
			200 : function(response) {
				parse_title(response.content.body, cb);
			},
			response : function(response) {
				cb('statuscode: ' + response.status)
			}
		}
	});
/*	if(/https:\/\//gi.test(url)) {
		https.get(url, function(res) {
			data = "";
			res.on('data', function(chunk) {
				data = data + chunk;
			});
			res.on('end', function() {
				parse_title(data, cb); 
			});
		}).on('error', function(e) {
			util.puts(e);
		});
	};
	if(/http:\/\//gi.test(url)) {
		http.get(url, function(res) {
			data = "";
			res.on('data', function(chunk) {
				data = data + chunk;
			});
			res.on('end', function() {
				parse_title(data, cb); 
			});
		}).on('error', function(e) {
			util.puts(e);
		});;
	};
*/
};

exports.from_html = parse_title;
exports.from_url = from_url;
