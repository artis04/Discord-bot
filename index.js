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


function getAllMentionedUsersOrChannels(message, getUsers){
  if(getUsers){
    split_string = "<@!";
  }else{
    split_string = "<#";
  }
  // (Discord mentioning works like: <@!CLIENT_ID>   OR <#CHANNEL_ID>)
  var specificID = message.content.split(split_string);
  let mentioned = [];
  for(var i = 1; i < specificID.length; i++){
    try{ // in case there is not valid @mention id (then do catch == skip this.)

      var valid_id = specificID[i].substring(0, specificID[i].indexOf(">"))
      if (!mentioned.includes(valid_id)){  // pervents to spam one user or channel multiple times at once.
        mentioned.push(valid_id);
      }
    }
    catch{}
  }
  return mentioned;
}

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
      embed.setTitle("This is python3 title, today you are going to learn")
      embed.setDescription("coding ans so on also RubY and GzO, java-script and ja12Va");
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
        voted_users = getAllMentionedUsersOrChannels(message, true);

        var voted_users1 = [];

        message.mentions.users.forEach(user => {
          voted_users1.push(user);
        });
        console.log(voted_users);

        // voted_users1[0].forEach(element => {
        //   console.log(element);
        // });
        console.log(voted_users1[0]);
        // list "voted_users" contains all user ID's who have been upvoted or downvoted in message

        /* Checks if user wants to upvote or downvote other user, and creates bool value "positiveVote" */
        message.content.toLowerCase().startsWith("!upvote") ? positiveVote = true : positiveVote = false;
        for(i = 0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            userInfo.then(user => {
                userPoints.addPoints(sqlite3, positiveVote, user, message, roleList);
            }).catch(console.error);
        };

        
    }else if(message.content.toLowerCase().startsWith("!points")){
        let voted_users = getAllMentionedUsersOrChannels(message, true);
        let channels = getAllMentionedUsersOrChannels(message, false);
        let users = [];

        if(voted_users.length === 0){
            voted_users = [message.author.id];
        }
        // changes channels ID to channels name
        let mentionedTextChannels = []
        message.guild.channels.cache.forEach(channel => {
            if(channels.includes(channel.id)){
                mentionedTextChannels.push(channel);
            }
        });

        for(i=0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            userInfo.then(async user => {
                users.push(user);
                if(mentionedTextChannels.length === 0){
                    userPoints.sendUserPoints(sqlite3, user,message, undefined);
                }else{
                    for(i = 0; i < mentionedTextChannels.length; i++){
                        userPoints.sendUserPoints(sqlite3, user, message, mentionedTextChannels[i]);
                    }
                }
            }).catch(console.error);
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
        let votedUsers = getAllMentionedUsersOrChannels(message, true);

        let description = message.content.split("<@!");
        description = description[description.length - 1];
        description = description.substring(20, description.length);

        for(i = 0; i < votedUsers.length; i++){
            var userInfo = client.users.fetch(votedUsers[i]);
            // userInfo contains id; is_bot?; username; discriminator; avatarID; flags; lastmessageid; lastmessagechannelid
            userInfo.then(user => {
                achievements.achievement(sqlite3, description, user, message.author, message);
            }).catch(console.error);
        };
    }else if(message.content.toLowerCase().startsWith("!achievements") || (message.content.toLowerCase().startsWith("!achievement") && !(sensei || owner))){
      let user = message.mentions.users.first();
      if(user === undefined) user = message.author;
      achievements.showLastTen(sqlite3, user, message, false);
  }
});
 
