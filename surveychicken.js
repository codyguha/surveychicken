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
let server = http.createServer(bot.incoming()).listen(process.env.PORT || 8080);

function saveUserToMongoDb(username, first_name, last_name) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err) throw err;
		var results = db.collection('results');
		results.insert({
			user: {
				username: username,
				first_name: first_name,
				last_name: last_name
			},
			chicken_survey: {
				platform: "kik",
				chk_burger: "1",
				chk_cake: "1",
				chk_cone: "1",
				chk_dog: "1",
				emoji: "<3",
        contact: "user@user.com"
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
		results.update({
			"user.username": `${u}`
		}, {
			$set: target
		});
	});
}

function removeEmoji(u) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err) throw err;
		var results = db.collection('results');
		results.update({
			"user.username": `${u}`
		}, {
			$unset: {
				"chicken_survey.emoji": ""
			}
		});
	});
}
function removeContact(u) {
  mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
    if (err) throw err;
    var results = db.collection('results');
    results.update({
      "user.username": `${u}`
    }, {
      $unset: {
        "chicken_survey.contact": ""
      }
    });
  });
}

function burgerValidation(u) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err) throw err;
		var results = db.collection('results');
		results.update({
			"user.username": `${u}`
		}, {
			$unset: {
				"chicken_survey.chk_burger": ""
			}
		});
	});
}

function cakeValidation(u) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err) throw err;
		var results = db.collection('results');
		results.update({
			"user.username": `${u}`
		}, {
			$unset: {
				"chicken_survey.chk_cake": ""
			}
		});
	});
}

function coneValidation(u) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err) throw err;
		var results = db.collection('results');
		results.update({
			"user.username": `${u}`
		}, {
			$unset: {
				"chicken_survey.chk_cone": ""
			}
		});
	});
}

function dogValidation(u) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		if (err) throw err;
		var results = db.collection('results');
		results.update({
			"user.username": `${u}`
		}, {
			$unset: {
				"chicken_survey.chk_dog": ""
			}
		});
	});
}

function userValidation(user) {
	mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
		var results = db.collection('results');
		results.find({
			"user.username": user.username
		}).toArray(function(err, found) {
			if (found[0] === undefined) {
				saveUserToMongoDb(user.username, user.firstName, user.lastName)
			}
		});
	});
}
var reminder;
var knockknock;
var progress;

function endRemindUserCounter() {
	clearTimeout(reminder);
}

function endGratitudeCounter() {
	clearTimeout(knockknock);
}

function startRemindUserCounter(incoming) {
	bot.getUserProfile(incoming.from).then((user) => {
		reminder = setTimeout(function() {
			const message = Bot.Message.text(`Hey ${user.firstName}!!! Don't be a chicken! Come back and finish the survey.`).addTextResponse(`Continue`).addTextResponse(`Not now`)
			incoming.reply(message)
		}, 120000);
	});
}

function startGratitudeUserCounter(incoming) {
	bot.getUserProfile(incoming.from).then((user) => {
		knockknock = setTimeout(function() {
			const message2 = Bot.Message.text(`Knock Knock`).addTextResponse(`Who’s there?`).addTextResponse(`Not now`)
			incoming.reply(message2)
		}, 3600000);
	});
}

function startJoke(incoming) {
  endRemindUserCounter();
  bot.getUserProfile(incoming.from).then((user) => {
    const message2 = Bot.Message.text(`Knock Knock`).addTextResponse(`Who’s there?`).addTextResponse(`Not now`)
    incoming.reply(message2)
  });
}
bot.onTextMessage(/Who’s there\?$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Bach`).addTextResponse(`Bach who?`).addTextResponse(`Not now`)
		incoming.reply(message)
	});
});
bot.onTextMessage(/Bach who\?$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
    const message2 = Bot.Message.text(`Bach, bach I'm a chicken!;) LOL - see I knew I could make you smile. What would you like to do next?`).addTextResponse(`Take a survey`).addTextResponse(`Tell me another joke`).addTextResponse(`Not now`)
		incoming.reply(message2)
	});
});
bot.onTextMessage(/Not now|Maybe later$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Ok. Text "hi" or "GET CHICKEN!" when you have time to chat.`)
		incoming.reply(message)
	});
});

function anotherJoke(incoming){
  endRemindUserCounter();
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Jeopardy time!`)
    .addTextResponse(`What goes peck, peck, peck, Boom?`)
    .addTextResponse(`What Is chicken teriyaki?`)
    .addTextResponse(`Why did the chicken cross the road halfway?`)
    .addTextResponse(`What do you get when a chicken lays an egg on top of a barn?`)
    .addTextResponse(`Who tells chicken jokes?`)
    incoming.reply(message)
  });
}
bot.onTextMessage(/What goes peck, peck, peck, Boom\?$/i, (incoming, next) => {
      const message = Bot.Message.text(`A chicken in a mine field.`)
        .addTextResponse(`What Is chicken teriyaki?`)
        .addTextResponse(`Why did the chicken cross the road halfway?`)
        .addTextResponse(`What do you get when a chicken lays an egg on top of a barn?`)
        .addTextResponse(`Who tells chicken jokes?`)
        .addTextResponse(`Enough already`)
    incoming.reply(message)
});
bot.onTextMessage(/What Is chicken teriyaki\?$/i, (incoming, next) => {
      const message = Bot.Message.text(`The name of the oldest living kamikaze pilot.`)
        .addTextResponse(`What goes peck, peck, peck, Boom?`)
        .addTextResponse(`Why did the chicken cross the road halfway?`)
        .addTextResponse(`What do you get when a chicken lays an egg on top of a barn?`)
        .addTextResponse(`Who tells chicken jokes?`)
        .addTextResponse(`Enough already`)
    incoming.reply(message)
});
bot.onTextMessage(/Why did the chicken cross the road halfway\?$/i, (incoming, next) => {
      const message = Bot.Message.text(`She wanted to lay it on the line.`)
        .addTextResponse(`What goes peck, peck, peck, Boom?`)
        .addTextResponse(`What Is chicken teriyaki?`)
        .addTextResponse(`What do you get when a chicken lays an egg on top of a barn?`)
        .addTextResponse(`Who tells chicken jokes?`)
        .addTextResponse(`Enough already`)
    incoming.reply(message)
});
bot.onTextMessage(/Who tells chicken jokes\?$/i, (incoming, next) => {
      const message = Bot.Message.text(`Comedihens!`)
        .addTextResponse(`What goes peck, peck, peck, Boom?`)
        .addTextResponse(`What Is chicken teriyaki?`)
        .addTextResponse(`Why did the chicken cross the road halfway?`)
        .addTextResponse(`What do you get when a chicken lays an egg on top of a barn?`)
        .addTextResponse(`Enough already`)
    incoming.reply(message)
});
bot.onTextMessage(/What do you get when a chicken lays an egg on top of a barn\?$/i, (incoming, next) => {
      const message = Bot.Message.text(`An eggroll!`)
        .addTextResponse(`What goes peck, peck, peck, Boom?`)
        .addTextResponse(`What Is chicken teriyaki?`)
        .addTextResponse(`Why did the chicken cross the road halfway?`)
        .addTextResponse(`Who tells chicken jokes?`)
        .addTextResponse(`Enough already`)
    incoming.reply(message)
});

bot.onTextMessage(/GET CHICKEN!|get chicken!|Get Chicken!$/i, (incoming, next) => {
	chickenDelivery(incoming)
});
bot.onStartChattingMessage((incoming, next) => {
	welcomeUser(incoming)
});
bot.onTextMessage(/^hi|Hi$/i, (incoming, next) => {
	welcomeUser(incoming)
});
bot.onTextMessage(/Take a survey$/i, (incoming, next) => {
	question001(incoming)
});
bot.onTextMessage(/Tell me a joke$/i, (incoming, next) => {
  startJoke(incoming)
});
bot.onTextMessage(/Tell me another joke$/i, (incoming, next) => {
  anotherJoke(incoming)
});
bot.onTextMessage(/Enough already$/i, (incoming, next) => {
  enoughJokes(incoming)
});
bot.onTextMessage(/Never$/i, (incoming, next) => {
	endSurveyBeforeItStarts(incoming)
});
bot.onTextMessage(/Continue the chicken survey$/i, (incoming, next) => {
  question002(incoming)
});
bot.onTextMessage(/On a regular basis|Once and a while|Rarely$/i, (incoming, next) => {
	question002(incoming)
});
bot.onTextMessage(/Value|Quality|Fair treatment of animals|Freshness$/i, (incoming, next) => {
	question003(incoming)
});
bot.onTextMessage(/Pan fry it|Deep fry it|Bake it|BBQ it|Roast it|Other$/i, (incoming, next) => {
	question004(incoming)
});
bot.onTextMessage(/Potatoes$/i, (incoming, next) => {
	question005a(incoming)
});
bot.onTextMessage(/Salad$/i, (incoming, next) => {
	question005b(incoming)
});
bot.onTextMessage(/Rice$/i, (incoming, next) => {
	question005c(incoming)
});
bot.onTextMessage(/Vegetables$/i, (incoming, next) => {
	question005d(incoming)
});
bot.onTextMessage(/Mashed|Roasted|Fries|Baked|Greek|Ceaser|Green|Coleslaw|Brown|Basmati|White|Flavoured - Coconut, etc|Broccoli|Carrots|Spinach|Green Beans|Asparagus$/i, (incoming, next) => {
	question006(incoming)
});
bot.onTextMessage(/At a family style restaurant|At fast food establishment|At a fine dining restaurant|At a grocery or convienience store$/i, (incoming, next) => {
	question007(incoming)
});
bot.onTextMessage(/Beef|Seafood|Pork|Vegetarian option$/i, (incoming, next) => {
	question008(incoming)
});
bot.onTextMessage(/It's a guilty pleasure$/i, (incoming, next) => {
	question010a(incoming)
});
bot.onTextMessage(/Not really my thing|I’ll die before I eat fried chicken$/i, (incoming, next) => {
	question010b(incoming)
});
bot.onTextMessage(/I love it|I’m not going to get into it|After a night of hard partying|A treat if I’ve been eating good for a while|It’s a personal matter|I’m trying to eat healthy these days|Its not convienient to make at home|Its not convienient to purchase|I just dont like the taste$/i, (incoming, next) => {
	question010c(incoming)
});
bot.onTextMessage(/Ok, lets do it$/i, (incoming, next) => {
	question011(incoming)
});
bot.onTextMessage(/1\) This looks gross|2\) Not my first choice|3\) I’m on the fence|4\) This looks eatable|5\) This looks delicious$/i, (incoming, next) => {
	question012(incoming)
});
bot.onTextMessage(/Yes$/i, (incoming, next) => {
	question013(incoming)
});
bot.onTextMessage(/Yes please$/i, (incoming, next) => {
  chickenDeliverySurvey(incoming)
});
bot.onTextMessage(/No thanks$/i, (incoming, next) => {
  questionLast(incoming)
});
bot.onTextMessage(/NO WAY!|Not really$/i, (incoming, next) => {
  questionLast(incoming)
});
bot.onTextMessage(/Continue$/i, (incoming, next) => {
	checkProgress(incoming)
});
bot.onTextMessage(/Do not contact me$/i, (incoming, next) => {
  bot.getUserProfile(incoming.from).then((user) => {
    saveToMongoDb(user.username, incoming.body, "contact_me_using")
  });
  surveyEnd(incoming)
});
bot.onTextMessage(/Email|Twitter|Facebook|Linkedin$/i, (incoming, next) => {
  bot.getUserProfile(incoming.from).then((user) => {
    saveToMongoDb(user.username, incoming.body, "contact_me_using")
     removeContact(user.username)
  });
  if (incoming.body === "Email"){
      getEmail(incoming)
  } else if (incoming.body === "Twitter") {
      getTwitter(incoming)
  } else if (incoming.body === "Facebook") {
      getFacebook(incoming)
  } else if (incoming.body === "Linkedin") {
      getLinkedin(incoming)
  }
});
bot.onTextMessage((incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
			var results = db.collection('results');
			results.find({
				"user.username": user.username
			}).toArray(function(err, found) {
				var foundResult = found[0]
				if (foundResult === undefined) {
          donotUnderstand(incoming)
				} else {
					if (foundResult.chicken_survey.emoji === undefined) {
            saveToMongoDb(user.username, incoming.body, "emoji")
						getContact(incoming)
					} else if (foundResult.chicken_survey.contact === undefined) {
            saveToMongoDb(user.username, incoming.body, "contact")
            surveyEnd(incoming)
          } else {
            donotUnderstand(incoming)
          }
				}
			});
		});
	});
});

function welcomeUser(incoming) {
	bot.getUserProfile(incoming.from).then((user) => {
		userValidation(user);
		const message = Bot.Message.text(`Hey ${user.firstName}! I’m the host here at Survey Chicken.  If you get lost, or if you want a fresh start just text “Hi” and I’ll take you back to the beginning. What would you like to do first?`).addTextResponse(`Take a survey`).addTextResponse(`Tell me a joke`)
		incoming.reply(message)
	});
	progress = 0
}

function donotUnderstand(incoming) {
  bot.getUserProfile(incoming.from).then((user) => {
    userValidation(user);
    const message = Bot.Message.text(`What would you like to do?`).addTextResponse(`Take a survey`).addTextResponse(`Tell me a joke`)
    incoming.reply(message)
  });
  progress = 0
  endRemindUserCounter();
}
function enoughJokes(incoming) {
  bot.getUserProfile(incoming.from).then((user) => {
    userValidation(user);
    const message = Bot.Message.text(`That was fun. What would you like to do next?`).addTextResponse(`Take a survey`).addTextResponse(`Not now`)
    incoming.reply(message)
  });
  progress = 0
}

function endSurveyBeforeItStarts(incoming){
	bot.getUserProfile(incoming.from).then((user) => {
		incoming.reply(Bot.Message.text(`Ok I’m glad we got that out the way.  I suppose there is no point in bugging you with more questions about your chicken preferences.  Do you want to continue the survey anyways?`).addTextResponse(`Continue the chicken survey`).addTextResponse(`Not now`))
		saveToMongoDb(user.username, incoming.body, "frequency")
	});
	endRemindUserCounter();
	startGratitudeUserCounter(incoming)
	progress = 0
}
function question001(incoming){
	progress = 1
	const message = Bot.Message.text(`Awesome, lets get started. First off, how often do you eat chicken?`).addTextResponse(`On a regular basis`).addTextResponse(`Once and a while`).addTextResponse(`Rarely`).addTextResponse(`Never`)
	incoming.reply(message)
	startRemindUserCounter(incoming)
}
function question002(incoming){
	progress = 2
	bot.getUserProfile(incoming.from).then((user) => {
		const message2 = Bot.Message.text(`Great! Next question... When you shop for chicken at the grocery store what is most important to you?`).addTextResponse(`Value`).addTextResponse(`Quality`).addTextResponse(`Fair treatment of animals`).addTextResponse(`Freshness`)
		incoming.reply(message2)
		saveToMongoDb(user.username, incoming.body, "frequency")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question003(incoming){
	progress = 3
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`What is your favorite way to prepare chicken at home?`).addTextResponse(`Pan fry it`).addTextResponse(`Deep fry it`).addTextResponse(`Bake it`).addTextResponse(`BBQ it`).addTextResponse(`Roast it`).addTextResponse(`Other`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "buy_based_on")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question004(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`What is your preferred side dish to have with chicken?`).addTextResponse(`Potatoes`).addTextResponse(`Salad`).addTextResponse(`Rice`).addTextResponse(`Vegetables`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "favorite_preparation")
	});
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question005a(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Yes! I love Potatoes too. How do you like your potatoes?`).addTextResponse(`Mashed`).addTextResponse(`Roasted`).addTextResponse(`Fries`).addTextResponse(`Baked`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question005b(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Keeping it healthy with a salad, I like that. What type of salad goes best with chicken?`).addTextResponse(`Greek`).addTextResponse(`Ceaser`).addTextResponse(`Green`).addTextResponse(`Coleslaw`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question005c(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Rice is nice. What type of rice goes best with chicken?`).addTextResponse(`Brown`).addTextResponse(`Basmati`).addTextResponse(`White`).addTextResponse(`Flavoured - Coconut, etc`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question005d(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Gotta get those vegetables in. What vegetable goes best with chicken?`).addTextResponse(`Broccoli`).addTextResponse(`Carrots`).addTextResponse(`Spinach`).addTextResponse(`Green Beans`).addTextResponse(`Asparagus`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question006(incoming){
	progress = 5
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Where do you most typically consume chicken outside of your home?`).addTextResponse(`At a family style restaurant`).addTextResponse(`At fast food establishment`).addTextResponse(`At a fine dining restaurant`).addTextResponse(`At a grocery or convienience store`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish_detail")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question007(incoming){
	progress = 6
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`If a preferred chicken option is not available which of the following would you typically choose?`).addTextResponse(`Beef`).addTextResponse(`Seafood`).addTextResponse(`Pork`).addTextResponse(`Vegetarian option`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "location_preference")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question008(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Thanks for your input so far.  Are you ok to continue and answer a couple more questions?`).addTextResponse(`Continue`).addTextResponse(`Maybe later`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "backup_option")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question009(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`You're awesome. Let’s get specific. What is your relationship with fried chicken?`).addTextResponse(`I love it`).addTextResponse(`It's a guilty pleasure`).addTextResponse(`Not really my thing`).addTextResponse(`I’ll die before I eat fried chicken`)
		incoming.reply(message)
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question010a(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Guilty pleasure you say, tell me more.`).addTextResponse(`After a night of hard partying`).addTextResponse(`A treat if I’ve been eating good for a while`).addTextResponse(`It’s a personal matter`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question010b(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`So fried chicken isnt on your menu. Can you tell me more?`).addTextResponse(`I’m trying to eat healthy these days`).addTextResponse(`Its not convienient to make at home`).addTextResponse(`Its not convienient to purchase`).addTextResponse(`I just dont like the taste`).addTextResponse(`I’m not going to get into it`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question010c(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		if (incoming.body === "I love it") {
			saveToMongoDb(user.username, incoming.body, "relationship")
			saveToMongoDb(user.username, incoming.body, "relationship_detail")
		} else {
			saveToMongoDb(user.username, incoming.body, "relationship_detail")
		}
		const message = Bot.Message.text(`Ok cool. In the next set of questions I’m going to show you some pictures of fried chicken entrees.  Use the answers provided to tell me what you think.`).addTextResponse(`Ok, lets do it`).addTextResponse(`NO WAY!`)
		incoming.reply(message)
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}

function restartOneOutOfTenSection(incoming) {
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Ok cool. In the next set of questions I’m going to show you some pictures of fried chicken entrees.  Use the answers provided to tell me what you think.`).addTextResponse(`Ok, lets do it`).addTextResponse(`NO WAY!`)
		incoming.reply(message)
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}

function question011(incoming){
	progress = 8
	bot.getUserProfile(incoming.from).then((user) => {
		const pic1 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_burger.jpg`).setAttributionName('Fried Chicken Burger').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1) This looks gross').addTextResponse('2) Not my first choice').addTextResponse('3) I’m on the fence').addTextResponse('4) This looks eatable').addTextResponse('5) This looks delicious')
		incoming.reply(pic1);
		burgerValidation(user.username)
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function question012(incoming){
	bot.getUserProfile(incoming.from).then((user) => {
		progress = 8
		mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {
			var results = db.collection('results');
			results.find({
				"user.username": user.username
			}).toArray(function(err, found) {
				var foundResult = found[0]
				if (foundResult === undefined) {
					donotUnderstand(incoming)
          endRemindUserCounter()
          startRemindUserCounter(incoming)
				} else {
          endRemindUserCounter()
          startRemindUserCounter(incoming)
					if (foundResult.chicken_survey.chk_burger === undefined) {
						const pic2 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_cake.jpg`).setAttributionName('Fried Chicken Cake').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1) This looks gross').addTextResponse('2) Not my first choice').addTextResponse('3) I’m on the fence').addTextResponse('4) This looks eatable').addTextResponse('5) This looks delicious')
						incoming.reply(pic2);
						cakeValidation(user.username)
						saveToMongoDb(user.username, incoming.body, "chk_burger")
					} else if (foundResult.chicken_survey.chk_cake === undefined) {
						const pic3 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_cone.jpg`).setAttributionName('Fried Chicken Cone').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1) This looks gross').addTextResponse('2) Not my first choice').addTextResponse('3) I’m on the fence').addTextResponse('4) This looks eatable').addTextResponse('5) This looks delicious')
						incoming.reply(pic3);
						coneValidation(user.username)
						saveToMongoDb(user.username, incoming.body, "chk_cake")
					} else if (foundResult.chicken_survey.chk_cone === undefined) {
						const pic4 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_dog.jpg`).setAttributionName('Fried Chicken Dog').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1) This looks gross').addTextResponse('2) Not my first choice').addTextResponse('3) I’m on the fence').addTextResponse('4) This looks eatable').addTextResponse('5) This looks delicious')
						incoming.reply(pic4);
						dogValidation(user.username)
						saveToMongoDb(user.username, incoming.body, "chk_cone")
					} else if (foundResult.chicken_survey.chk_dog === undefined) {
						const message = Bot.Message.text(`Has this survey made you hungry?`).addTextResponse(`Yes`).addTextResponse(`Not really`)
						incoming.reply(message)
						saveToMongoDb(user.username, incoming.body, "chk_dog")
					} else {
						donotUnderstand(incoming)
					}
				}
			});
		});
	});
}
function question013(incoming){
  progress = 9
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Ok would you like me to suggest some local take out options?`).addTextResponse(`Yes please`).addTextResponse(`No thanks`)
    incoming.reply(message)
    saveToMongoDb(user.username, incoming.body, "hunger")
  });
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function questionLast(incoming){
	progress = 15
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`…and we are done! Thanks for the chat. Let me know what you thought by selecting an emoji.`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "hunger")
		removeEmoji(user.username)
	});
	endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function getContact(incoming){
  progress = 16
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Sweet. If you would like to stay in the “coop", I mean loop, on Survey Chicken updates just leave me your contact info and I’ll keep you posted.`)
    .addTextResponse(`Do not contact me`)
    .addTextResponse(`Email`)
    .addTextResponse(`Twitter`)
    .addTextResponse(`Facebook`)
    .addTextResponse(`Linkedin`)
		incoming.reply(message)
	});
	endRemindUserCounter()
	startRemindUserCounter(incoming)
}
function getEmail(incoming){
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Awesome, and what is your email adress?`)
    incoming.reply(message)
  });
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function getTwitter(incoming){
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Awesome, and what is your Twitter handle?`)
    incoming.reply(message)
  });
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function getLinkedin(incoming){
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Awesome, and what is your Linkden profile address?`)
    incoming.reply(message)
  });
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function getFacebook(incoming){
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Awesome, and what is your Facebook profile address?`)
    incoming.reply(message)
  });
  endRemindUserCounter()
  startRemindUserCounter(incoming)
}
function surveyEnd(incoming){
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Thank you that is all I wanted to know. I will be in touch if I recieve any updates. Text "hi" to do the survey agian or text "GET CHICKEN!" to get chicken delivered right now!`)
    incoming.reply(message)
  });
  endRemindUserCounter()
  startGratitudeUserCounter(incoming)
}
function chickenDeliverySurvey(incoming){
  progress = 10
  bot.getUserProfile(incoming.from).then((user) => {
    const message = Bot.Message.text(`Why not order some delivery right now.  You can click on the Just Eat link above or select continue to pass.`).addTextResponse(`Continue`)
    const link = Bot.Message.link("https://www.just-eat.ca/delivery/vancouver/chicken/").setPicUrl("http://www.digitalnativescontent.com/wp-content/uploads/2016/01/GHTF-outdoor.jpg").setTitle("").setText("Order Chicken delivery online from Vancouver restaurants.").setAttributionName('GET CHICKEN!').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
    incoming.reply([link, message])
  });
}
function chickenDelivery(incoming){
  progress = 10
  bot.getUserProfile(incoming.from).then((user) => {
    const link = Bot.Message.link("https://www.just-eat.ca/delivery/vancouver/chicken/").setPicUrl("http://www.digitalnativescontent.com/wp-content/uploads/2016/01/GHTF-outdoor.jpg").setTitle("").setText("Order Chicken delivery online from Vancouver restaurants.").setAttributionName('GET CHICKEN!').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
    incoming.reply([link, message])
  });
}

function checkProgress(incoming){
  console.log("checked progress outputs!!!:  " + progress)
	if (progress === 0) {
		question001(incoming)
	} else if (progress === 1) {
		question001(incoming)
	} else if (progress === 2) {
		question002(incoming)
	} else if (progress === 3) {
		question003(incoming)
	} else if (progress === 4) {
		question004(incoming)
	} else if (progress === 5) {
		question006(incoming)
	} else if (progress === 6) {
		question007(incoming)
	} else if (progress === 7) {
		question009(incoming)
	} else if (progress === 8) {
		restartOneOutOfTenSection(incoming)
	} else if (progress === 10) {
    questionLast(incoming)
  } else if (progress === 15) {
		questionLast(incoming)
	} else if (progress === 16) {
    getContact(incoming)
  }
}
