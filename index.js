const Discord = require("discord.js");
const config = require("./config.json");
const Database = require("./Database.js");
const userPoints = require("./points.js");
const userRegiter = require("./userRegister.js");
const badWordAlert = require("./badWordAlert.js");
const automatedRoles = require("./automatedRoles.js");
const achievements = require("./achievements.js");
const sqlite3 = require('sqlite3').verbose();
const client = new Discord.Client();


client.login(config.token);
let badWords = badWordAlert.makeList(); // swear and inpolite words
let roleList = automatedRoles.makeList(); // automatic role giving roles and points
let eventChannel;

client.on('ready', () => {
  let textChannels = []

  client.channels.cache.forEach(channel => {
    if(channel.type === 'text'){
      textChannels.push(channel.name); // Get all channel names, so to create table in database with channel names
    }
    if(channel.name === 'events' && channel.type === 'text'){
      eventChannel = channel;
    }
  });
  Database.createTables(sqlite3, textChannels); // creates database with required tables if not created yet.

  client.user.setActivity("best server", {type: "WATCHING"});

});

client.on('message', async message => {

    if(message.channel.type === "dm"){ // dm messages
        if(message.content.toLowerCase().startsWith("!createuser") || message.content.toLowerCase().startsWith("!edituser")){
          userRegiter.getUserRegistry(sqlite3, message);
        }else if(message.content.toLowerCase().startsWith("!help")){
          message.channel.send("You can type `!createUser` or `!editUser` to automatically send you notification about events which you might like.");
        }

        else if(message.content.toLowerCase().startsWith("!achievements")){
          let user = message.author;
          achievements.showLastTen(sqlite3, user, message, true);
        }
        return; // don't run further code as this is dm
    }

    /* Test purpuse */
    if(message.content === "jahoo"){
      let embed = new Discord.MessageEmbed();
      embed.setTitle("Hello all interested in programming")
      embed.setDescription("this is description abdulaziz");
      // message.channel.send({ embed });
      eventChannel.send({ embed })
    }
    /* ============ */


    if(message.channel === eventChannel){
      userRegiter.checkForInterest(sqlite3, client, message);
      return;
    }

    let owner = false;
    let sensei = false;
    try{
        if(message.member.roles.cache.find(role => role.name === "Owner")){
            owner = true; 
        }else if(message.member.roles.cache.find(role => role.name === "Sensei")){
            sensei = true;
        }
    }catch{}

    /* Deal with banned words */
    badWordAlert.checkIfContains(sqlite3, client, message, badWords);

    if(message.content.toLowerCase().startsWith("!upvote") || message.content.toLowerCase().startsWith("!downvote")){
        message.delete();

        var voted_users = [];
        message.mentions.users.forEach(user => {
          if(user != message.author){
            voted_users.push(user);
          }else{
            message.channel.send(`<@${message.author.id}> Unfortunately you can't vote yourself :)`);
          }
        });

        /* Checks if user wants to upvote or downvote other user, and creates bool value "positiveVote" */
        message.content.toLowerCase().startsWith("!upvote") ? positiveVote = true : positiveVote = false;
        for(i = 0; i < voted_users.length; i++){
            userPoints.addPoints(sqlite3, positiveVote, voted_users[i], message, roleList);
        };

    }else if(message.content.toLowerCase().startsWith("!points")){
        var voted_users = [];
        let mentionedTextChannels = []

        message.mentions.users.forEach(user => {
          voted_users.push(user);
        });

        message.mentions.channels.forEach(channel => {
          mentionedTextChannels.push(channel);
        });

        if(voted_users.length === 0){
          voted_users = [message.author];
      }

        for(i=0; i < voted_users.length; i++){
          if(mentionedTextChannels.length === 0){
            userPoints.sendUserPoints(sqlite3, voted_users[i], message, undefined);
          }else{
            for(j = 0; j < mentionedTextChannels.length; j++){
              userPoints.sendUserPoints(sqlite3, voted_users[i], message, mentionedTextChannels[j]);
            }
          }
        }

    }else if(message.content.toLowerCase().startsWith("!leaderboard")){
      let channels = [];
      message.mentions.channels.forEach(channel => {
        channels.push(channel);
      });

      let count = 0;
      do{
        userPoints.leaderboard(sqlite3, message, channels[count]);
        count ++;
      }while(count < channels.length)
      
    }else if(message.content.toLowerCase().startsWith("!achievement ") && (sensei || owner)){
      message.delete();
      let voted_users = [];
      message.mentions.users.forEach(user => {
        voted_users.push(user);
      });

      let description = message.content.split("<@!");
      description = description[description.length - 1];
      description = description.substring(20, description.length);

      for(i = 0; i < voted_users.length; i++){
        achievements.achievement(sqlite3, description, voted_users[i], message.author, message);
      };
    }else if(message.content.toLowerCase().startsWith("!achievements") || (message.content.toLowerCase().startsWith("!achievement") && !(sensei || owner))){
      let user = message.mentions.users.first();
      if(user === undefined) user = message.author;
      achievements.showLastTen(sqlite3, user, message, false);
  }
});
 
