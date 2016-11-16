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
				last_name: last_name,
			},
			chicken_survey: {
				chk_burger: "1",
				chk_cake: "1",
				chk_cone: "1",
				chk_dog: "1",
				emoji: "<3"
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
var progress = 0

function resetRemindUserCounter(incoming) {
	clearTimeout(reminder);
	startRemindUserCounter(incoming)
	endGratitudeCounter()
}

function endRemindUserCounter() {
	clearTimeout(reminder);
}

function endGratitudeCounter() {
	clearTimeout(knockknock);
}

function startRemindUserCounter(incoming) {
	console.log("before!!!:  "+ progress)
	bot.getUserProfile(incoming.from).then((user) => {
		reminder = setTimeout(function() {
			const message = Bot.Message.text(`Hey ${user.firstName}!!! Don't be a chicken! COME BACK AND FINISH THE SURVEY.`).addTextResponse(`Finish the survey`).addTextResponse(`Not now`)
			incoming.reply(message)
		}, 20000);
	});
	console.log("after!!!:  "+ progress)
}

function startGratitudeUserCounter(incoming) {
	bot.getUserProfile(incoming.from).then((user) => {
		knockknock = setTimeout(function() {
			const message2 = Bot.Message.text(`Knock Knock`).addTextResponse(`Who’s there`).addTextResponse(`Not now`)
			incoming.reply(message2)
		}, 30000);
	});
	progress = 0
	console.log("PRoGRESS!!!:  "+ progress)
}

bot.onTextMessage(/Who’s there$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		userValidation(user);
		const message = Bot.Message.text(`Bach`).addTextResponse(`Bach who`).addTextResponse(`Not now`)
		incoming.reply(message)
	});
});
bot.onTextMessage(/Bach who$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		userValidation(user);
		const message = Bot.Message.text(`Bach, bach I'm a chicken!`)
		incoming.reply(message)
	});
});
bot.onTextMessage(/Not now|No thanks|Maybe later$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`sorry to bother you.`)
		incoming.reply(message)
	});
	startGratitudeUserCounter(incoming)
});
bot.onTextMessage(/GET CHICKEN!|get chicken!|Get Chicken!$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		const link = Bot.Message.link("https://www.just-eat.ca/delivery/vancouver/chicken/").setPicUrl("http://www.digitalnativescontent.com/wp-content/uploads/2016/01/GHTF-outdoor.jpg").setTitle("").setText("Order Chicken delivery online from Vancouver restaurants.").setAttributionName('GET CHICKEN!').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
		incoming.reply(link)
	});
	startGratitudeUserCounter(incoming)
});
// function startShareUserCounter(incoming) {
// 	bot.getUserProfile(incoming.from).then((user) => {
// 		robindance = setTimeout(function() {
// 		const hifive = Bot.Message.video(`https://r3---sn-uxa0n-t8gs.googlevideo.com/videoplayback?pl=44&id=o-AL5-yeGve6kG6NEH5gBBrsLVni2phTN1sLtd3nxRWGyS&sparams=clen,dur,ei,expire,gir,id,initcwndbps,ip,ipbits,itag,lmt,mime,mm,mn,ms,mv,nh,pl,ratebypass,source,upn&ip=2001:569:7668:3700:c854:d201:6f30:bab2&signature=54151F4A748A402F2426F28B6545A29820180D02.5E0EA43A41CBB596CCFF0AC0D4CC5D1D5B4B2F8F&ei=fp4lWPb5DdOt-APqmLygAg&upn=eJ1j8WyO2oQ&source=youtube&itag=18&clen=3384008&fexp=9444224&key=cms1&mime=video/mp4&gir=yes&expire=1478882014&ratebypass=yes&dur=50.828&ipbits=0&lmt=1400107801534427&title=(Natok24.Com)%20Teen_Titans_Go_Robin_Chicken_Dance&cms_redirect=yes&mm=31&mn=sn-uxa0n-t8gs&ms=au&mt=1478860353&mv=m`)
//           .setAttributionName(' ')
//           .setLoop(true)
//           .setAutoplay(true)
//           .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
// 			incoming.reply(hifive)
// 		}, 360000000);
// 	});
// }
bot.onStartChattingMessage((incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		userValidation(user);
		const message = Bot.Message.text(`Hey ${user.firstName}! I am the Survey Chicken! Would you like to do a quick survey about chicken?`).addTextResponse(`Yes please`).addTextResponse(`No thanks`)
		incoming.reply(message)
	});
});
bot.onTextMessage(/^hi|Hi$/i, (incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
		userValidation(user);
		const message = Bot.Message.text(`Hey ${user.firstName}! I am the Survey Chicken! Would you like to do a quick survey about chicken?`).addTextResponse(`Yes please`).addTextResponse(`No thanks`)
		incoming.reply(message)
	});
});
bot.onTextMessage(/Yes please$/i, (incoming, next) => {
	question001(incoming)
});
bot.onTextMessage(/Never$/i, (incoming, next) => {
	endSurveyBeforeItStarts(incoming)
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
bot.onTextMessage(/Continue$/i, (incoming, next) => {
	question009(incoming)
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
bot.onTextMessage(/Show me$/i, (incoming, next) => {
	question011(incoming)
});
bot.onTextMessage(/^1|2|3|4|5|6|7|8|9|10$/i, (incoming, next) => {
	question012(incoming)
});
bot.onTextMessage(/NO WAY!|YES!|GET CHICKEN!$/i, (incoming, next) => {
	questionLast(incoming)
});
bot.onTextMessage(/Finish the survey$/i, (incoming, next) => {
	checkProgress(incoming)
});
// bot.onTextMessage(/YES!|GET CHICKEN!$/i, (incoming, next) => {
// 	bot.getUserProfile(incoming.from).then((user) => {
// 		const message = Bot.Message.text(`I knew it! Why not order some chicken delivery right now.  Click on the Just Eat app to get started.`)
// 		const link = Bot.Message.link("https://www.just-eat.ca/delivery/vancouver/chicken/").setPicUrl("http://www.digitalnativescontent.com/wp-content/uploads/2016/01/GHTF-outdoor.jpg").setTitle("").setText("Order Chicken delivery online from Vancouver restaurants.").setAttributionName('GET CHICKEN!').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
// 		incoming.reply([link, message])
// 		saveToMongoDb(user.username, incoming.body, "hunger")
// 		removeEmoji(user.username)
// 	});
// 	startShareUserCounter(incoming)
// 	endRemindUserCounter();
// 	endGratitudeCounter()
// 	startGratitudeUserCounter(incoming)
// });
bot.onTextMessage((incoming, next) => {
	bot.getUserProfile(incoming.from).then((user) => {
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
					if (foundResult.chicken_survey.emoji === undefined) {
						if (foundResult.chicken_survey.hunger === "NO WAY!") {
							surveyEndNotHungry(incoming)	
						} else {
							surveyEndHungry(incoming)
						}
					} else {
						const message = Bot.Message.text(`I'm sorry, I don't understand.`)
						incoming.reply(message)
					}
				}
			});
		});
	});
});

function endSurveyBeforeItStarts(incoming){
	bot.getUserProfile(incoming.from).then((user) => {
		incoming.reply(Bot.Message.text(`Ok I’m glad we got that out the way.  I suppose there is no point in bugging you with more questions about your chicken preferences.`))
		saveToMongoDb(user.username, incoming.body, "frequency")
	});
	endRemindUserCounter();
	endGratitudeUserCounter(incoming)
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
	resetRemindUserCounter(incoming)
}
function question003(incoming){
	progress = 3
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`What is your favorite way to prepare chicken at home?`).addTextResponse(`Pan fry it`).addTextResponse(`Deep fry it`).addTextResponse(`Bake it`).addTextResponse(`BBQ it`).addTextResponse(`Roast it`).addTextResponse(`Other`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "buy_based_on")
	});
	resetRemindUserCounter(incoming)
}
function question004(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`What is your preferred side dish to have with chicken?`).addTextResponse(`Potatoes`).addTextResponse(`Salad`).addTextResponse(`Rice`).addTextResponse(`Vegetables`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "favorite_preparation")
	});
	resetRemindUserCounter(incoming)
}
function question005a(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Yes! I love Potatoes too. How do you like your potatoes?`).addTextResponse(`Mashed`).addTextResponse(`Roasted`).addTextResponse(`Fries`).addTextResponse(`Baked`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	resetRemindUserCounter(incoming)
}
function question005b(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Keeping it healthy with a salad, I like that. What type of salad goes best with chicken?`).addTextResponse(`Greek`).addTextResponse(`Ceaser`).addTextResponse(`Green`).addTextResponse(`Coleslaw`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	resetRemindUserCounter(incoming)
}
function question005c(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Rice is nice. What type of rice goes best with chicken?`).addTextResponse(`Brown`).addTextResponse(`Basmati`).addTextResponse(`White`).addTextResponse(`Flavoured - Coconut, etc`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	resetRemindUserCounter(incoming)
}
function question005d(incoming){
	progress = 4
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Gotta get those vegetables in. What vegetable goes best with chicken?`).addTextResponse(`Broccoli`).addTextResponse(`Carrots`).addTextResponse(`Spinach`).addTextResponse(`Green Beans`).addTextResponse(`Asparagus`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish")
	});
	resetRemindUserCounter(incoming)
}
function question006(incoming){
	progress = 5
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Where do you most typically consume Chicken outside of your home?`).addTextResponse(`At a family style restaurant`).addTextResponse(`At fast food establishment`).addTextResponse(`At a fine dining restaurant`).addTextResponse(`At a grocery or convienience store`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "side_dish_detail")
	});
	resetRemindUserCounter(incoming)
}
function question007(incoming){
	progress = 6
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`If a preferred chicken option is not available which of the following would you typically choose?`).addTextResponse(`Beef`).addTextResponse(`Seafood`).addTextResponse(`Pork`).addTextResponse(`Vegetarian option`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "location_preference")
	});
	resetRemindUserCounter(incoming)
}
function question008(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Thanks for your input so far.  Are you ok to continue and answer a couple more questions?`).addTextResponse(`Continue`).addTextResponse(`Maybe later`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "backup_option")
	});
	resetRemindUserCounter(incoming)
}
function question009(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`You're awesome. Let’s get specific. What is your relationship with fried chicken?`).addTextResponse(`I love it`).addTextResponse(`It's a guilty pleasure`).addTextResponse(`Not really my thing`).addTextResponse(`I’ll die before I eat fried chicken`)
		incoming.reply(message)
	});
	resetRemindUserCounter(incoming)
}
function question010a(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Guilty pleasure you say, tell me more.`).addTextResponse(`After a night of hard partying`).addTextResponse(`A treat if I’ve been eating good for a while`).addTextResponse(`It’s a personal matter`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
	});
	resetRemindUserCounter(incoming)
}
function question010a(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Guilty pleasure you say, tell me more.`).addTextResponse(`After a night of hard partying`).addTextResponse(`A treat if I’ve been eating good for a while`).addTextResponse(`It’s a personal matter`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
	});
	resetRemindUserCounter(incoming)
}
function question010b(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`So fried chicken isnt on your menu. Can you tell me more?`).addTextResponse(`I’m trying to eat healthy these days`).addTextResponse(`Its not convienient to make at home`).addTextResponse(`Its not convienient to purchase`).addTextResponse(`I just dont like the taste`).addTextResponse(`I’m not going to get into it`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "relationship")
	});
	resetRemindUserCounter(incoming)
}
function question010c(incoming){
	progress = 7
	bot.getUserProfile(incoming.from).then((user) => {
		if (incoming.body === "I love it") {
			saveToMongoDb(user.username, incoming.body, "relationship")
			saveToMongoDb(user.username, incoming.body, "relationship_detail")
			resetRemindUserCounter(incoming)
		} else {
			saveToMongoDb(user.username, incoming.body, "relationship_detail")
		}
		const message = Bot.Message.text(`I'm going to show you 4 fried chicken entrés. Rate how appetizing these fried chicken dishes look(1 being very low and 10 being very high). Tap the image to get closer look.`).addTextResponse(`Show me`).addTextResponse(`NO WAY!`)
		incoming.reply(message)
	});
	resetRemindUserCounter(incoming)
}

function restartOneOutOfTenSection(incoming) {
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`I'm going to show you 4 fried chicken entrés. Rate how appetizing these fried chicken dishes look(1 being very low and 10 being very high). Tap the image to get closer look.`).addTextResponse(`Show me`).addTextResponse(`NO WAY!`)
		incoming.reply(message)
	});
	resetRemindUserCounter(incoming)
}

function question011(incoming){
	progress = 8
	bot.getUserProfile(incoming.from).then((user) => {
		const pic1 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_burger.jpg`).setAttributionName('Fried Chicken Burger').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1').addTextResponse('2').addTextResponse('3').addTextResponse('4').addTextResponse('5').addTextResponse('6').addTextResponse('7').addTextResponse('8').addTextResponse('9').addTextResponse('10')
		incoming.reply(pic1);
		burgerValidation(user.username)
		console.log("PRoGRESS!!!:  "+ progress)
	});
	resetRemindUserCounter(incoming)
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
					const message = Bot.Message.text(`I'm sorry, I don't understand.`)
					incoming.reply(message)
				} else {
					if (foundResult.chicken_survey.chk_burger === undefined) {
						const pic2 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_cake.jpg`).setAttributionName('Fried Chicken Cake').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1').addTextResponse('2').addTextResponse('3').addTextResponse('4').addTextResponse('5').addTextResponse('6').addTextResponse('7').addTextResponse('8').addTextResponse('9').addTextResponse('10')
						incoming.reply(pic2);
						cakeValidation(user.username)
						saveToMongoDb(user.username, incoming.body, "chk_burger")
						resetRemindUserCounter(incoming)
						console.log("PRoGRESS!!!:  "+ progress)
					} else if (foundResult.chicken_survey.chk_cake === undefined) {
						const pic3 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_cone.jpg`).setAttributionName('Fried Chicken Cone').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1').addTextResponse('2').addTextResponse('3').addTextResponse('4').addTextResponse('5').addTextResponse('6').addTextResponse('7').addTextResponse('8').addTextResponse('9').addTextResponse('10')
						incoming.reply(pic3);
						coneValidation(user.username)
						saveToMongoDb(user.username, incoming.body, "chk_cake")
						resetRemindUserCounter(incoming)
						console.log("PRoGRESS!!!:  "+ progress)
					} else if (foundResult.chicken_survey.chk_cone === undefined) {
						const pic4 = Bot.Message.picture(`https://raw.githubusercontent.com/codyguha/survey-images/master/kikfriedchicken/FriedCH_dog.jpg`).setAttributionName('Fried Chicken Dog').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png').addTextResponse('1').addTextResponse('2').addTextResponse('3').addTextResponse('4').addTextResponse('5').addTextResponse('6').addTextResponse('7').addTextResponse('8').addTextResponse('9').addTextResponse('10')
						incoming.reply(pic4);
						dogValidation(user.username)
						saveToMongoDb(user.username, incoming.body, "chk_cone")
						resetRemindUserCounter(incoming)
						console.log("PRoGRESS!!!:  "+ progress)
					} else if (foundResult.chicken_survey.chk_dog === undefined) {
						const message = Bot.Message.text(`Has this survey made you hungry?`).addTextResponse(`YES!`).addTextResponse(`NO WAY!`)
						incoming.reply(message)
						saveToMongoDb(user.username, incoming.body, "chk_dog")
						console.log("PRoGRESS!!!:  "+ progress)
						resetRemindUserCounter(incoming)
					} else {
						const message = Bot.Message.text(`I'm sorry, I don't understand.`)
						incoming.reply(message)
						resetRemindUserCounter(incoming)
					}
				}
			});
		});
	});
}
function questionLast(incoming){
	progress = 9
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Thanks for taking some time to chat with us.  We enjoyed learning more about your chicken preferences. Please let us know what you thought of this survey by selecting an emoji that best represents your experience chatting with Survey Chicken`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "hunger")
		removeEmoji(user.username)
	});
	resetRemindUserCounter(incoming)
}
function surveyEndNotHungry(incoming){
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`ALL DONE! Say "hi" to do the survey agian or yell "GET CHICKEN!" to GET CHICKEN NOW!`)
		incoming.reply(message)
		saveToMongoDb(user.username, incoming.body, "emoji")
	});
	endRemindUserCounter();
	startGratitudeUserCounter(incoming)
}
function surveyEndHungry(incoming){
	bot.getUserProfile(incoming.from).then((user) => {
		const message = Bot.Message.text(`Why not order some chicken delivery right now.  Click on the Just Eat app to get started.`)
		const link = Bot.Message.link("https://www.just-eat.ca/delivery/vancouver/chicken/").setPicUrl("http://www.digitalnativescontent.com/wp-content/uploads/2016/01/GHTF-outdoor.jpg").setTitle("").setText("Order Chicken delivery online from Vancouver restaurants.").setAttributionName('GET CHICKEN!').setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
		incoming.reply([link, message])
		saveToMongoDb(user.username, incoming.body, "emoji")
	});
	endRemindUserCounter();
	startGratitudeUserCounter(incoming)
}

function checkProgress(incoming){
	if (progress === 0) {

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
	} else if (progress === 9) {
		questionLast(incoming)
	} 
}