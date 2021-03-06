var irc = require('irc');
var util = require('util');
var timers = require('timers');
var exec = require('child_process').exec;
var parse_title = require('./parse_title.js');
var ical = require('ical');
var twittersearch = require('./search.js');
var n39Status = require('./n39SpaceApi.js');
var gimmicks = require('./gimmicks.js').list;

var botname = process.argv[2] ? process.argv[2] : "bastinat0r_bot";


var trollprob = 1;

var bot = new irc.Client('irc.freenode.net', botname, {
	channels: ['#bastinta0rbottest', '#netz39']
});
var commands = {};

bot.on('error', function(e) {
	util.puts(JSON.stringify(e));
});

function registerCommand(name, re, fn) {
	commands[name] = {
		re : re,
		fn : fn
	}
}

registerCommand('!trollup', /^\!trollup/i, function(from, to, message) {
	trollprob = trollprob * 1.3;
	if(trollprob > 1)
		trollprob = 1;
	bot.say(to, 'Trollwahrscheinlichkeit: ' + trollprob.toFixed(2));
});

registerCommand('!trolldown', /^\!trolldown/i, function(from, to, message) {
	trollprob = trollprob * 0.7;
	bot.say(to, 'Trollwahrscheinlichkeit: ' + trollprob.toFixed(2));
});

registerCommand('!hase', /^\!hase/i, function(from, to, message) {
	bot.say(to,'(\\_/)')
	bot.say(to,'(o.o)')
	bot.say(to,'(")(")')
});

registerCommand('!apokalypse', /^\!apo[ck]alypse/i, function(from, to, message) {
	bot.say(to, 'You have ' + (Math.pow(2, 31) - (new Date()).getTime() / 1000).toFixed(3) + 's left till the world as we know it will come to an end! Cthulu is coming.   ^(;,;)^');
});

registerCommand('!status', /^\!status/i, function(from, to, message) {
	n39Status.getStatus(function(str) {
		bot.say(to, str); 
	});
});

registerCommand('!rekursion', /^\!rekursion/i, function(from, to, message) {
	bot.say(to, 'Gib \'!rekursion\' ein, um Rekursion erklärt zu bekommen!');
});

registerCommand('!trigger', /^\!trigger/i, function(from, to, message) {
	bot.say(to, 'PENG!');
});
/*
registerCommand('!troll', /^\!troll/i, function(from, to, message) {
	message = "" + message.replace(/^\!troll[\s]*//*gi, '');
	var re = message.split(/;/i);
	if(re[0].length < 4 || !re[1])
		return;
	util.puts(message);
	util.puts(re);
	var re2 = new RegExp(re.shift(), 'gi');
	registerCommand(re, re2, function(from, to, message) {
		bot.say(to, re.join(";"));
	});
});
*/

registerCommand('!coffee', /^\!(coffee|kaff[e]+)/i, function(from, to, message) {
	bot.say(to, 'Richtig heißer, kochend schwarzer Kaffee!');
});
registerCommand('!kekse', /^\!keks[e]?/i, function(from, to, message) {
	bot.say(to, 'Hat irgendjemand die Kekfe gefehn? Ich finde fie nicht. *Schmatzgeräusch*');
});
registerCommand('!fortune', /^\!fortune/i, function(from, to, message) {
	exec('fortune -s /usr/share/games/fortunes de off', function(err, stdout, stderr) {
		bot.say(to, stdout);
	});
});


registerCommand('!message', /^\!message\s/i, function(from, to, message) {
	var str = "" + message.replace(/^\!message\s/i, '');
	str = "" + str.replace(/['"`]/g, '');
	name = "" + from.replace(/['"`]/g, '');
	bot.say(to, 'Displaying on LED-Display: ' + str);
	send_message(name, str);
});


registerCommand('!upcoming', /^\!upcoming/i, function(from, to, message) {
	getEvents(function(events) {
		for(var i in events) {
			bot.say(to, events[i].start + ' - ' + events[i].summary);
		};
	});
});
	
registerCommand('!next', /^\!next/i, function(from, to, message) {
	getEvents(function(events) {
		bot.say(to, events[0].start + ' - ' + events[0].summary);
		bot.say(to, events[0].description);
	});
});
	
registerCommand('!tweets', /^\!tweets/i, function(from, to, message) {
	twittersearch.request('netz39', function(answer) {
		bot.say(to, twittersearch.parseAnswer(answer));
	});
});

registerCommand('!knockknock', /^\!knockknock/i, function(from, to, message) {
	bot.say(to, 'Who \'s there?');
});

registerCommand('!test', /^\!test/i, function(from, to, message) {
	util.puts(from + ' => ' + to + ' : ' + message);
	bot.say(to, 'worx');
});

registerCommand('!forkme', /^\!forkme/, function(from, to, message) {
	bot.say(to, 'Fork me @ https://github.com/bastinat0r/yaib/');
});

registerCommand('!=', /^\!\=/, function(from, to, message) {
	message = message.slice(2);
	message = message.split(/\s/);
	util.puts(util.inspect(message));
	message = message.join('');
	if(/^[\dπ][\d\+\-\*\/\.π()]+[\dπ]$/g.test(message)) {
		try {
			var π = Math.PI;
			bot.say(to, eval(message));
		} catch (e)
		{
			util.puts(e)
		}
	}
});


var help = "";
for(var i in commands) {
	if(/^\!/.test(i))
		help = help + ' ' + i;
}

registerCommand('!help', /^\!(help|commands|usage)/, function(from, to, message) {
	bot.say(from, help);
	bot.say(from, 'Please rember you can query me directly, without spamming the channel!');
});

var fs = require('fs');
var http = require('http');

var srv = http.createServer(function(req, res) {
	if(req.method == 'GET') {
		res.writeHead(200);
		fs.readFile('irc.log', function(err, data) {
			if(err) {
				util.puts(err);
			}
			else {
				res.write(data);
			}
			res.end();
		});
	} else if(req.method == 'PUT') {
		var data ="";
		req.on('data', function(chunk) {
			data = data + chunk;
		});
		req.on('end', function() {
			try{
				var o = JSON.parse(data);
				/*
				 * {
				 * 	re : regex,
				 * 	text : [string],
				 * }
				 *
				 */
				if(o.re && o.text) {
					o.re = new RegExp(o.re, 'i');
					o.text = [("" + o.text)];
					gimmicks.push(o);
					res.writeHead(200);
					res.end('ok');
				}
			} catch (e) {
				util.puts(e);
				res.writeHead(400);
				res.end();
			}
		});
		
	} else {
		res.writeHead(500);
		res.end();
	}
});
srv.listen(3001, '0.0.0.0');

bot.on('message', function(from, to, message) {
	if(from != botname) {
		if(to == botname) {
			to = from;
		}
		url = "" + message.match(/http[s]?:\/\/[\S]*/i);
		if(url != "") {
			parse_title.from_url(url, function(title) {
				bot.say(to, title);
			});
		}

		fs.appendFile('irc.log', from + '>' + to + ' : ' + message + '\n');

		for(var i in commands) {
			if(commands[i].re.test(message)) {
				if(/^\!/g.test(i) || Math.random() > 0.5) {
					commands[i].fn(from, to, message);
				}
			}
		}
		for(var i in gimmicks) {
			if(gimmicks[i].re.test(message)) {
				if(Math.random() < trollprob || !gimmicks[i].troll) {
					var text = "" + gimmicks[i].text[Math.floor(Math.random()*gimmicks[i].text.length)];
					setTimeout(function() {
						bot.say(to, text);
					}, 2000);
				}
			}
		}
	}
});

function send_message(name, str) {
		exec('../newsprog/newsprog -f sevenrowfancy_normal -m flash \'' + name + '\'');
		setTimeout(send_str, 3000, str);
}

function send_str(str) {
		exec('../newsprog/newsprog -f sevenrownormal_normal -m hold \'' + str + '\'');
		if(str != "") {
			setTimeout(send_str, 60000, "");
		}
}

timers.setTimeout(function() {
	bot.join('#bastinat0rbottest');
	bot.join('#netz39');
}, 1000);

function getEvents(cb) {
	ical.fromURL('http://grical.org/s/?query=%23netz39&view=ical', {}, function(err, data) {
		var events = [];
		for(var k in data){
			if (data.hasOwnProperty(k)) {
				if(data[k].start)
					if((new Date(data[k].start)).getTime() < (new Date()).getTime() + 1000* 3600* 24 * 30)
						events.push(data[k]);
			}
		}
		events.sort(function(a,b) { return (new Date(a.start)).getTime() - (new Date(b.start)).getTime(); });
		cb(events);
	});
}
