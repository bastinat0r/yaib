var irc = require('irc');
var util = require('util');
var timers = require('timers');
var exec = require('child_process').exec;
var parse_title = require('./parse_title.js');
var ical = require('ical');
var twittersearch = require('./search.js');

var botname = process.argv[2] ? process.argv[2] : "bastinat0r_bot";

var bot = new irc.Client('irc.freenode.net', botname, {
	channels: ['#bastinta0rbottest', '#netz39']
});

bot.on('error', function(e) {
	util.puts(JSON.stringify(e));
});

bot.on('message', function(from, to, message) {
	if(/^\!coffee/gi.test(message)) {
		bot.say(to, 'Coffee to the world');
	}
	if(/^\!fortune/gi.test(message)) {
		exec('fortune', function(err, stdout, stderr) {
			bot.say(to, stdout);
		});
	}
	if(/jehova/gi.test(message)) {
		bot.say(to, 'Ich sagte keiner wirft einen Stein, selbst wenn – und das betone ich ausdrücklich – selbst wenn jemand Jehova sagt!');
	}

	if(/^\!message\s/gi.test(message)) {
		var str = "" + message.replace(/^\!message\s/gi, '');
		str = "" + str.replace(/['"`]/g, '');
		name = "" + from.replace(/['"`]/g, '');
		bot.say(to, 'Displaying on LED-Display: ' + str);
		send_message(name, str);
	};

	url = "" + message.match(/http[s]?:\/\/[\S]*/gi);
	if(url != "") {
		parse_title.from_url(url, function(title) {
			bot.say(to, title);
		});
	}

	if(/^\!upcoming/gi.test(message)) {
		getEvents(function(events) {
			for(var i in events) {
				bot.say(to, events[i].start + ' - ' + events[i].summary);
			};
		});
	};
	
	if(/^\!next/gi.test(message)) {
		getEvents(function(events) {
			bot.say(to, events[0].start + ' - ' + events[0].summary);
			bot.say(to, events[0].description);
		});
	};
	
	if(/^\!tweets/gi.test(message)) {
		twittersearch.request('netz39', function(answer) {
			bot.say(to, twittersearch.parseAnswer(answer));
		});
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
