'use strict';

let mongodb = require('mongodb');
let util = require('util');
let http = require('http');
let Bot = require('@kikinteractive/kik');


mongodb.MongoClient.connect(process.env.MONGODB_URI, function(err, db) {

  if (err) throw err;

  var results = db.collection('results');

  // results.insert(seedData, function(err, result) {

  //   if (err) throw err;
  // });

   let bot = new Bot({
    username: process.env.BOT_NAME,
    apiKey: process.env.API_KEY,
    baseUrl: process.env.BASE_URL
  });

  bot.updateBotConfiguration();

  // bot.onTextMessage(/Hi$/i, (incoming, next) => {
  //   bot.getUserProfile(incoming.from)
  //     .then((user) => {
  //       const message = Bot.Message.text(`Hey ${user.firstName}! I am the surveychicken ! Would you like to do a quick survey about chicken ?`)
  //         .addTextResponse(`Chicken Survey`)
  //         .addTextResponse(`No thanks`)
  //       results.insert({user: user.username})
  //       incoming.reply(message)
  //     });
  // });
  
  bot.onStartChattingMessage((incoming) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Hey ${user.firstName}! I am the surveychicken ! Would you like to do a quick survey about chicken ?`)
          .addTextResponse(`Yes please`)
          .addTextResponse(`No thanks`)
        incoming.reply(message)
        results.insert({user: user.username})
      });
    
  });

  bot.onScanDataMessage((incoming) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Hey ${user.firstName}! I am the surveychicken ! Would you like to do a quick survey about chicken ?`)
          .addTextResponse(`Yes please`)
          .addTextResponse(`No thanks`)
        incoming.reply(message)
        results.insert({user: user.username})
      });
  });

  bot.onTextMessage(/hi|Hi$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Hey ${user.firstName}! I am the surveychicken ! Would you like to do a quick survey about chicken ?`)
          .addTextResponse(`Yes please`)
          .addTextResponse(`No thanks`)
        incoming.reply(message)
        results.insert({user: user.username})
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
        return incoming.reply(message)
      });
  });

  bot.onTextMessage(/I love it$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`What is your favourite way to eat fried chicken?`)
          .addTextResponse(`I make it myself`)
          .addTextResponse(`KFC is my go to`)
          .addTextResponse(`Any fried chicken is good chicken`)
          .addTextResponse(`It's a secret and I’m not telling you`)
        results.update({
          user: user.username
        }, {
          $set: { 
            "chicken_survey.relationship": incoming.body
          }
        })
        return incoming.reply(message);
      });
  });

  bot.onTextMessage(/It's a guilty pleasure$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Guilty pleasure you say, tell me more.`)
          .addTextResponse(`After a night of hard partying`)
          .addTextResponse(`A treat if I’ve been eating good for while`)
          .addTextResponse(`It’s a personal matter`)
        results.update({
          user: user.username
        }, {
          $set: {
            "chicken_survey.relationship": incoming.body
          }
        })
        return incoming.reply(message)
      });
  });

  bot.onTextMessage(/Not really my thing|I’ll die before I eat fried chicken$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`So your not a fan eh? Tell us more.`)
          .addTextResponse(`Chicken is God’s creature and shouldn’t be eaten`)
          .addTextResponse(`Fried food is gross`)
          .addTextResponse(`I’m not going to get into it`)
        results.update({
          user: user.username
        }, {
          $set: {
            "chicken_survey.relationship": incoming.body
          }
        })
        return incoming.reply(message)
      });
  });

  bot.onTextMessage(/^After a night of hard partying|I’m not going to get into it|Fried food is gross|Chicken is God’s creature and shouldn’t be eaten|A treat if I’ve been eating good for while|It’s a personal matter|I make it myself|KFC is my go to|Any fried chicken is good chicken|It's a secret and I’m not telling you$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`What is your current mood?`)
          .addTextResponse(`😀`)
          .addTextResponse(`😊`)
          .addTextResponse(`😞`)
          .addTextResponse(`😠`)
        results.update({
          user: user.username
        }, {
          $set: {
            "chicken_survey.detail": incoming.body
          }
        })
        return incoming.reply(message);
      });
  });

  bot.onTextMessage(/^😀|😊|😞|😠$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const pic1 = Bot.Message.picture(`http://fiber-international.com/wp-content/uploads/2015/04/800x600-chicken.jpg`)
          .setAttributionName('Chicken Parmesan')
          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
        const pic2 = Bot.Message.picture(`http://assets.bwbx.io/images/ieMg5BCeWkWU/v1/-1x-1.jpg`)
          .setAttributionName('Double Down')
          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
        const pic3 = Bot.Message.picture(`https://i.ytimg.com/vi/G8hbFO-r2nQ/maxresdefault.jpg`)
          .setAttributionName('Fried Drumsticks')
          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
        const pic4 = Bot.Message.picture(`http://www.urbanmommies.com/wp-content/uploads/McDonalds-Chicken-Nuggets.jpg`)
          .setAttributionName('Chicken Nuggets')
          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
        const message = Bot.Message.text(`Which of these would you like to be eating right now?`)
          .addTextResponse('Chicken Parmesan')
          .addTextResponse('Double Down')
          .addTextResponse('Fried Drumsticks')
          .addTextResponse('Chicken Nuggets')
        results.update({
          user: user.username
        }, {
          $set: {
            "chicken_survey.mood": incoming.body
          }
        })
        return incoming.reply([pic1, pic2, pic3, pic4, message]);
      });
  });

  bot.onTextMessage(/^Chicken Parmesan|Double Down|Fried Drumsticks|Chicken Nuggets$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Have we made you hungry answering these questions?`)
          .addTextResponse(`YES!`)
          .addTextResponse(`no, I ate`)
        results.update({
          user: user.username
        }, {
          $set: {
            "chicken_survey.preference": incoming.body
          }
        })
        return incoming.reply(message)
      });
  });

  bot.onTextMessage(/No thanks$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`ok ${user.firstName}! say "Hi" agian sometime `)
        incoming.reply(message)
      });
  });

 bot.onTextMessage(/no, I ate|YES!$/i, (incoming, next) => {
    bot.getUserProfile(incoming.from)
      .then((user) => {
        const message = Bot.Message.text(`Thanks for your time. Say "hi" to take the chicken survey agian.`)
        const hifive = Bot.Message.video(`http://media.giphy.com/media/uXNYDeQ20XWSs/giphy.gif`)
          .setAttributionName(' ')
          .setLoop(true)
          .setAutoplay(true)
          .setAttributionIcon('http://icons.iconarchive.com/icons/icons8/ios7/128/Animals-Chicken-icon.png')
        results.update({
          user: user.username
        }, {
          $set: {
            "chicken_survey.hungry": incoming.body
          }
        })
      return incoming.reply([hifive, message])
    });
  });

  let server = http
    .createServer(bot.incoming())
    .listen(process.env.PORT || 8080);
});