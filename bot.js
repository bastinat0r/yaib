var irc = require('irc');
var util = require('util');
var timers = require('timers');
var exec = require('child_process').exec;
var parse_title = require('./parse_title.js');
var ical = require('ical');
var twittersearch = require('./search.js');
var n39Status = require('./n39SpaceApi.js');

var botname = process.argv[2] ? process.argv[2] : "bastinat0r_bot";

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

registerCommand('status', /^\!status/gi, function(from, to, message) {
	n39Status.getStatus(function(str) {
		bot.say(to, str); 
	});
});

registerCommand('!rekursion', /^\!rekursion/gi, function(from, to, message) {
	bot.say(to, 'Gib \'!rekursion\' ein, um Rekursion erklärt zu bekommen!');
});

registerCommand('!troll', /^\!troll/gi, function(from, to, message) {
	message = "" + message.replace(/^\!troll[\s]*/gi, '');
	var re = message.split(/;/gi);
	if(re[0].length < 4 || !re[1])
		return;
	util.puts(message);
	util.puts(re);
	var re2 = new RegExp(re.shift(), 'gi');
	registerCommand(re, re2, function(from, to, message) {
		bot.say(to, re.join(";"));
	});
});

registerCommand('!coffee', /^\!(coffee|kaff[e]+)/gi, function(from, to, message) {
	bot.say(to, 'Richtig heißer, kochend schwarzer Kaffee!');
});
registerCommand('!kekse', /^\!kekse/gi, function(from, to, message) {
	bot.say(to, 'Kekse für alle!');
});
registerCommand('!fortune', /^\!fortune/gi, function(from, to, message) {
	exec('fortune', function(err, stdout, stderr) {
		bot.say(to, stdout);
	});
});

registerCommand('jehova', /jehova/gi, function(from, to, message) {
	bot.say(to, 'Ich sagte keiner wirft einen Stein, selbst wenn – und das betone ich ausdrücklich – selbst wenn jemand Jehova sagt!');
});

registerCommand('windows', /windows/gi, function(from, to, message) {
	bot.say(to, 'Wer "Windows" sagt, braucht nicht mit Steinen zu werfen!');
});

registerCommand('debian', /debian/gi, function(from, to, message) {
	bot.say(to, 'Wo "Debian" gesagt wird, sind Trolle nicht weit!');
});

registerCommand('freebsd', /free(\-)?bsd/gi, function(from, to, message) {
	bot.say(to, 'Das hat dir der Teufel gesagt!');
});

registerCommand('!message', /^\!message\s/gi, function(from, to, message) {
	var str = "" + message.replace(/^\!message\s/gi, '');
	str = "" + str.replace(/['"`]/g, '');
	name = "" + from.replace(/['"`]/g, '');
	bot.say(to, 'Displaying on LED-Display: ' + str);
	send_message(name, str);
});


registerCommand('!upcoming', /^\!upcoming/gi, function(from, to, message) {
	getEvents(function(events) {
		for(var i in events) {
			bot.say(to, events[i].start + ' - ' + events[i].summary);
		};
	});
});
	
registerCommand('!next', /^\!next/gi, function(from, to, message) {
	getEvents(function(events) {
		bot.say(to, events[0].start + ' - ' + events[0].summary);
		bot.say(to, events[0].description);
	});
});
	
registerCommand('!tweets', /^\!tweets/gi, function(from, to, message) {
	twittersearch.request('netz39', function(answer) {
		bot.say(to, twittersearch.parseAnswer(answer));
	});
});

registerCommand('!knockknock', /^\!knockknock/gi, function(from, to, message) {
	bot.say(to, 'Who \'s there?');
});

registerCommand('test', /^\!test/gi, function(from, to, message) {
	bot.say(to, 'worx');
});

registerCommand('ubuntu', /[xk]?ubuntu/gi, function(from, to, message) {
	bot.say(to, 'Yodeling Yeti for the win!');
});

registerCommand('cloud', /cloud/gi, function(from, to, message) {
	bot.say(to, 'BINGO!');
});

registerCommand('solaris', /solaris/gi, function(from, to, message) {
	bot.say(to, 'Seitdem Oracle Sun gekauft hat, ist die Welt ein dunkler Ort!');
});

registerCommand('!forkme', /^\!forkme/, function(from, to, message) {
	bot.say(to, 'Fork me @ https://github.com/bastinat0r/yaib/');
});

registerCommand('gnu', /gnu/gi, function(from, to, message) {
	bot.say(to, 'GNU is not UNIX!');
});

registerCommand('os2', /os[\/]?2/, function(from, to, message) {
	bot.say(to, 'OS/2 ist ein halbes OS');
});

registerCommand('ios', /[\.\!\s\?](ios|osx)[\.\!\s\u]/gi, function(from, to, message) {
	bot.say(to, 'FANBOOOOOYS!');
});

registerCommand('android', /android/gi, function(from, to, message) {
	bot.say(to, 'Commander Data, mit seiner 1Bit Speicherkapazität …');
});

registerCommand('fedora', /fedora/gi, function(from, to, message) {
	bot.say(to, 'Federboa?');
});

registerCommand('gentoo', /gentoo/gi, function(from, to, message) {
	bot.say(to, 'Habt ihr auch den richtigen Bart dafür?');
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


bot.on('message', function(from, to, message) {
	if(from != botname) {
		if(to == botname) {
			to = from;
		}
		url = "" + message.match(/http[s]?:\/\/[\S]*/gi);
		if(url != "") {
			parse_title.from_url(url, function(title) {
				bot.say(to, title);
			});
		}

		for(var i in commands) {
			if(commands[i].re.test(message)) {
				if(/^\!/g.test(i) || Math.random() > 0.5)
					commands[i].fn(from, to, message);
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
