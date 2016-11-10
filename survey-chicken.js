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

function saveUserToMongoDb(username, first_name, last_name) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.insert({
            user:{
            	username: username,
                first_name: first_name,
                last_name: last_name,
            },
            chicken_survey:{
            	chk_burger: "1",
            	chk_cake: "1",
            	chk_cone: "1",
            	chk_dog: "1"
            }
        })
    })
}

function saveToMongoDb(u, value, key) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        var target_key = "chicken_survey." + key
        var target = {};
        target[target_key] = value
        results.update({"user.username": `${u}`}, {   $set:  target }); 
    });
}

function removeEmoji(u) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.update({"user.username": `${u}`}, {   $unset:  {"chicken_survey.emoji": ""} }); 
    });
}

function burgerValidation(u) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.update({"user.username": `${u}`}, {   $unset:  {"chicken_survey.chk_burger": ""} }); 
    });
}
function cakeValidation(u) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.update({"user.username": `${u}`}, {   $unset:  {"chicken_survey.chk_cake": ""} }); 
    });
}
function coneValidation(u) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.update({"user.username": `${u}`}, {   $unset:  {"chicken_survey.chk_cone": ""} }); 
    });
}
function dogValidation(u) {
    mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
        if (err) throw err;
        var results = db.collection('results');
        results.update({"user.username": `${u}`}, {   $unset:  {"chicken_survey.chk_dog": ""} }); 
    });
}

bot.onTextMessage(/^hi|Hi$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {	
			var results = db.collection('results');
			results.find({
		        "user.username": user.username
		    }).toArray(function(err, found) {
		        var foundResult = found[0]
		        if (foundResult === undefined) {
		        	saveUserToMongoDb(user.username, user.firstName, user.lastName)
		        } 
		    });
		});
	    const message = Bot.Message.text(`Hey ${user.firstName}! I am the surveychicken ! Would you like to do a quick survey about chicken ?`)
	      .addTextResponse(`Yes please`)
	      .addTextResponse(`No thanks`)
    	incoming.reply(message)	
  	});
});

bot.onTextMessage(/Yes please$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Awesome lets get started. First off, how often do you eat Chicken?`)
          .addTextResponse(`On a regular basis`)
          .addTextResponse(`Once and a while`)
          .addTextResponse(`Rarely`)
          .addTextResponse(`Never`)
        incoming.reply(message)
    });
});

bot.onTextMessage(/Never$/i, (incoming, next) => {
    incoming.reply(Bot.Message.text(`Ok I’m glad we got that out the way.  I suppose there is no point in bugging you with more questions about your chicken preferences.`))
    saveToMongoDb(user.username, incoming.body, "frequency")
});

bot.onTextMessage(/On a regular basis|Once and a while|Rarely$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`When you shop for chicken at the grocery story what is most important to you?`)
          .addTextResponse(`Value`)
          .addTextResponse(`Quality`)
          .addTextResponse(`Fair treatment of Animals`)
          .addTextResponse(`Freshness`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "frequency")
    });
});

bot.onTextMessage(/Value|Quality|Fair treatment of Animals|Freshness$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`What is your favorite way to prepare Chicken at home?`)
          .addTextResponse(`Pan Fry it`)
          .addTextResponse(`Deep Fry it`)
          .addTextResponse(`Bake it`)
          .addTextResponse(`BBQ it`)
          .addTextResponse(`Roast it`)
          .addTextResponse(`Other`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "buy_based_on")
    });
});


bot.onTextMessage(/Pan Fry it|Deep Fry it|Bake it|BBQ it|Roast it|Other$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`What is your preferred side dish to have with chicken?`)
          .addTextResponse(`Potatoes`)
          .addTextResponse(`Salad`)
          .addTextResponse(`Rice`)
          .addTextResponse(`Vegetables`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "favorite_preparation")
    });
});

bot.onTextMessage(/Potatoes$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Yes! I love Potatoes too. How do you like your potatoes?`)
          .addTextResponse(`Mashed`)
          .addTextResponse(`Roasted`)
          .addTextResponse(`Fries`)
          .addTextResponse(`Baked`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "side_dish")
    });
});

bot.onTextMessage(/Salad$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Keeping it healthy with a salad, I like that. What type of salad goes best with chicken?`)
          .addTextResponse(`Greek`)
          .addTextResponse(`Ceaser`)
          .addTextResponse(`Green`)
          .addTextResponse(`Coleslaw`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "side_dish")
    });
});

bot.onTextMessage(/Rice$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Rice is nice. What type of rice goes best with chicken?`)
          .addTextResponse(`Brown`)
          .addTextResponse(`Basmati`)
          .addTextResponse(`White`)
          .addTextResponse(`Flavoured - Coconut, etc`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "side_dish")
    });
});

bot.onTextMessage(/Vegetables$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Gotta get those Vegetables in. What veggie goes best with chicken?`)
          .addTextResponse(`Broccoli`)
          .addTextResponse(`Carrots`)
          .addTextResponse(`Spinach`)
          .addTextResponse(`Green Beans`)
          .addTextResponse(`Asparagus`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "side_dish")
    });
});

bot.onTextMessage(/Mashed|Roasted|Fries|Baked|Greek|Ceaser|Green|Coleslaw|Brown|Basmati|White|Flavoured - Coconut, etc|Broccoli|Carrots|Spinach|Green Beans|Asparagus$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Where do you most typically consume Chicken outside of your home?`)
          .addTextResponse(`At a family style restaurant`)
          .addTextResponse(`At Fast Food establishment`)
          .addTextResponse(`At a fine dining restaurant`)
          .addTextResponse(`At a Grocery or Convienience Store`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "side_dish_detail")
    });
});

bot.onTextMessage(/At a family style restaurant|At Fast Food establishment|At a fine dining restaurant|At a Grocery or Convienience Store$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`If a preferred Chicken option is not available which of the following would you typically choose?`)
          .addTextResponse(`Beef`)
          .addTextResponse(`Seafood`)
          .addTextResponse(`Pork`)
          .addTextResponse(`Vegetarian option`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "location_preference")
    });
});

bot.onTextMessage(/Beef|Seafood|Pork|Vegetarian option$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Thanks for your input so far.  Are you ok to continue and answer a couple more questions?`)
          .addTextResponse(`Continue`)
          .addTextResponse(`No`)
          .addTextResponse(`Maybe later`)
        incoming.reply(message)
        saveToMongoDb(user.username, incoming.body, "backup_option")
    });
});

bot.onTextMessage(/Continue$/i, (incoming, next) => {
   bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`You're awesome. Let’s get specific. What is your relationship with Fried Chicken?`)
          .addTextResponse(`I love it`)
          .addTextResponse(`It's a guilty pleasure`)
          .addTextResponse(`Not really my thing`)
          .addTextResponse(`I’ll die before I eat fried chicken`)
        incoming.reply(message)
    });
});

bot.onTextMessage(/It's a guilty pleasure$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Guilty pleasure you say, tell me more.`)
          .addTextResponse(`After a night of hard partying`)
          .addTextResponse(`A treat if I’ve been eating good for a while`)
          .addTextResponse(`It’s a personal matter`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
    });
});

bot.onTextMessage(/Not really my thing|I’ll die before I eat fried chicken$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from)
	  .then((user) => {
	    const message = Bot.Message.text(`So fried chicken isnt on your menu. Can you tell me more?`)
	      .addTextResponse(`I’m trying to eat healthy these days`)
	      .addTextResponse(`Its not convienient to make at home`)
	      .addTextResponse(`Its not convienient to purchase`)
	      .addTextResponse(`I just dont like the taste`)
	      .addTextResponse(`I’m not going to get into it`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
	 });
});

bot.onTextMessage(/I love it|I’m not going to get into it|After a night of hard partying|A treat if I’ve been eating good for a while|It’s a personal matter|I’m trying to eat healthy these days|Its not convienient to make at home|Its not convienient to purchase|I just dont like the taste$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
      	if (incoming.body === "I love it") {
      		saveToMongoDb(user.username, incoming.body, "relationship")
      		saveToMongoDb(user.username, incoming.body, "relationship_detail")
      	} else {
      		saveToMongoDb(user.username, incoming.body, "relationship_detail")
      	}
        const pic1 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_burger.jpg`)
          .setAttributionName('Fried Chicken Burger')
          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
        const message = Bot.Message.text(`On a scale of 1 - 10 (1 being very low and 10 being very high) rate how appetizing this fried chicken dish looks.`)
          .addTextResponse('1')
          .addTextResponse('2')
          .addTextResponse('3')
          .addTextResponse('4')
          .addTextResponse('5')
          .addTextResponse('6')
          .addTextResponse('7')
          .addTextResponse('8')
          .addTextResponse('9')
          .addTextResponse('10')
		incoming.reply([pic1, message]);
		burgerValidation(user.username)
    });
});


bot.onTextMessage(/^1|2|3|4|5|6|7|8|9|10$/i, (incoming, next) => {
	  	bot.getUserProfile(incoming.from)
	      	.then((user) => {
				mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {	
					var results = db.collection('results');
					results.find({
			          "user.username": user.username
			        }).toArray(function(err, found) {
			          var foundResult = found[0]
			          	if (foundResult === undefined) {
			          		const message = Bot.Message.text(`I'm sorry, I don't understand.`)
							incoming.reply(message)
						} else {
							if (foundResult.chicken_survey.chk_burger === undefined){
			          			const pic1 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_cake.jpg`)
						          .setAttributionName('Fried Chicken Cake')
						          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
						        const message = Bot.Message.text(`On a scale of 1 - 10 (1 being very low and 10 being very high) rate how appetizing this fried chicken dish looks.`)
						          .addTextResponse('1')
						          .addTextResponse('2')
						          .addTextResponse('3')
						          .addTextResponse('4')
						          .addTextResponse('5')
						          .addTextResponse('6')
						          .addTextResponse('7')
						          .addTextResponse('8')
						          .addTextResponse('9')
						          .addTextResponse('10')
								incoming.reply([pic1, message]);
								cakeValidation(user.username)
			    				saveToMongoDb(user.username, incoming.body, "chk_burger")
							} else if (foundResult.chicken_survey.chk_cake === undefined){
			          			const pic1 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_cone.jpg`)
						          .setAttributionName('Fried Chicken Cone')
						          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
						        const message = Bot.Message.text(`On a scale of 1 - 10 (1 being very low and 10 being very high) rate how appetizing this fried chicken dish looks.`)
						          .addTextResponse('1')
						          .addTextResponse('2')
						          .addTextResponse('3')
						          .addTextResponse('4')
						          .addTextResponse('5')
						          .addTextResponse('6')
						          .addTextResponse('7')
						          .addTextResponse('8')
						          .addTextResponse('9')
						          .addTextResponse('10')
								incoming.reply([pic1, message]);
								cakeValidation(user.username)
			    				saveToMongoDb(user.username, incoming.body, "chk_cake")
							} else if (foundResult.chicken_survey.chk_cone === undefined){
			          			const pic1 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_dog.jpg`)
						          .setAttributionName('Fried Chicken Dog')
						          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
						        const message = Bot.Message.text(`On a scale of 1 - 10 (1 being very low and 10 being very high) rate how appetizing this fried chicken dish looks.`)
						          .addTextResponse('1')
						          .addTextResponse('2')
						          .addTextResponse('3')
						          .addTextResponse('4')
						          .addTextResponse('5')
						          .addTextResponse('6')
						          .addTextResponse('7')
						          .addTextResponse('8')
						          .addTextResponse('9')
						          .addTextResponse('10')
								incoming.reply([pic1, message]);
								dogValidation(user.username)
			    				saveToMongoDb(user.username, incoming.body, "chk_cake")
							} else if (foundResult.chicken_survey.chk_dog === undefined){
			          			const message = Bot.Message.text(`Has this survey made you hungry?`)
						          .addTextResponse(`YES!`)
						          .addTextResponse(`not at all`)
								incoming.reply(message)
			    				saveToMongoDb(user.username, incoming.body, "chk_dog")
							}else {
								const message = Bot.Message.text(`I'm sorry, I don't understand.`)
								incoming.reply(message)
							}
						}
			    });
			});
		});
});

bot.onTextMessage(/not at all|YES!$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Thanks for taking some time to chat with us.  We enjoyed learning more about your chicken preferences.  Please let us know what you thought of this survey by selecting an emoji that best represents your experience chatting with Survey Chicken`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "hunger")
		removeEmoji(user.username)
    });
});

bot.onTextMessage((incoming, next) => {
	bot.getUserProfile(incoming.from)
      .then((user) => {
			mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {	
				var results = db.collection('results');
				results.find({
		          "user.username": user.username
		        }).toArray(function(err, found) {
		          var foundResult = found[0]
		          	if (foundResult === undefined) {
		          		const message = Bot.Message.text(`I'm sorry, I don't understand.`)
						incoming.reply(message)
					} else {
						if (foundResult.chicken_survey.emoji === undefined){
		          			const message = Bot.Message.text(`Thanks thats it. Say "hi" again sometime.`)
							incoming.reply(message)
		    				saveToMongoDb(user.username, incoming.body, "emoji")
						} else {
							const message = Bot.Message.text(`I'm sorry, I don't understand.`)
							incoming.reply(message)
						}
					}
		    });
		});
	});
});

