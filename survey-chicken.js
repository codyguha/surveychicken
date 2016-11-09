'use strict';

let mongodb = require('mongodb');
let util = require('util');
let http = require('http');
let Bot = require('@kikinteractive/kik');

let bot = new Bot({
    username: process.env.BOT_NAME,
    apiKey: process.env.API_KEY,
    baseUrl: process.env.BASE_URL
  });

bot.updateBotConfiguration();

let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);

function saveToMongoDb(u, value, key) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        var target_key = "chicken_survey." + key
        var target = {};
        target[target_key] = value
        results.update({"userInfo.username": `${u}`}, {   $set:  target }); 
    });
}

function saveUserToMongoDb(username, first_name, last_name) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.insert({
            userInfo:{
            	username: username,
                first_name: first_name,
                last_name: last_name,
            },
        })
    })
}

bot.onTextMessage(/hi|Hi$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
	    const message = Bot.Message.text(`Hey ${user.firstName}! I am the surveychicken ! Would you like to do a quick survey about chicken ?`)
	      .addTextResponse(`Yes please`)
	      .addTextResponse(`No thanks`)
    	incoming.reply(message)
    	saveUserToMongoDb(user.username, user.firstName, user.lastName)
  	});
});

bot.onTextMessage(/Yes please$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Awesome lets get started. What would you say your relationship is with fried chicken?`)
          .addTextResponse(`I love it`)
          .addTextResponse(`It's a guilty pleasure`)
          .addTextResponse(`Not really my thing`)
          .addTextResponse(`I’ll die before I eat fried chicken`)
        incoming.reply(message)
        saveToMongoDb(user.username, "text", "relationship")
     });
 });