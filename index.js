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

client.on('ready', () => {
  let textChannels = []
  client.channels.cache.forEach(channel => {
    if(channel.type === 'text'){
      textChannels.push(channel.name); // Get all channel names, so to create table in database with channel names
    }
  });
  Database.createTables(sqlite3, textChannels); // creates database with required tables if not created yet.

  client.user.setActivity("FOR CLEAN SERVER", {type: "WATCHING"});

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
    try{ // in case there is no valid @mention id (then do catch == skip this.)

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
          userRegiter.getUserRegistry(sqlite3, message.author, message, "createUser")
        }else if(message.content.toLowerCase().startsWith("!info")){
          userRegiter.getUserRegistry(sqlite3, message.author, message, "getUser")
        }else if(message.content.toLowerCase().startsWith("!help")){
          message.channel.send("You can type `!createUser` or `!editUser` to automatically sign you in next events.\nYou can type `!info` to get ")
        }

        else if(message.content.toLowerCase().startsWith("!achievements")){
          let user = message.author;
          achievements.showLastTen(sqlite3, user, message, true);
        }
        return; // don't run further code as this is dm
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

    // Deal with banned words //
    badWordAlert.checkIfContains(sqlite3, client, message, badWords);

    if(message.content.toLowerCase().startsWith("!upvote") || message.content.toLowerCase().startsWith("!downvote")){
        // message.delete();

        // let role = message.guild.roles.cache.find(r => r.name === "noob");
        // let member = message.mentions.members.first();
        // member.roles.add(role).catch(console.error);


        var voted_users = [];
        voted_users = getAllMentionedUsersOrChannels(message, true);
        // list "voted_users" contains all user ID's who have been upvoted or downvoted in message
        
        //let teeest = message.guild.members.cache.get("id", parseInt(voted_users[0]));
        console.log("###############")
        message.mentions.members.get('id', 317689642545840128);
        // console.log(message.guild.members.cache.get);
        // console.log(message.guild.members.cache.get('id', 317689642545840128));
        
        //console.log(teeest);

        message.content.toLowerCase().startsWith("!upvote") ? positiveVote = true : positiveVote = false;
        // if (message.content.toLowerCase().startsWith("!upvote")){
        //     positiveVote = true;
        // }else{
        //     positiveVote = false;
        // };
      //   let roleName = "noob";
      //   message.guild.roles.cache.forEach(role => {
      //     if(role.name == roleName){
      //         exists = true;
      //         discordRole = role;
      //     }
      // });

      // message.mentions.members.forEach(member => {
      //   console.log(member);
      // })


        for(i = 0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            // userInfo contains id; is_bot?; username; discriminator; avatarID; flags; lastmessageid; lastmessagechannelid
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
        // console.log(users);
        // Database.test(sqlite3, client.users.fetch(users));
    }else if(message.content.toLowerCase().startsWith("!leaderboard")){
      // var isMentionedChannel = false;
      let channels = [];
      message.mentions.channels.forEach(channel => {
        channels.push(channel)
      });

      userPoints.leaderboard(sqlite3, message, channels);
      //if(!isMentionedChannel) userPoints.leaderboard(sqlite3, message);
    
    }else if(message.content.toLowerCase().startsWith("!achievement ")){
      message.delete();
        let votedUsers = getAllMentionedUsersOrChannels(message, true);

        // let description = "";
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
        
    }else if(message.content.toLowerCase().startsWith("!achievements")){
      let user = message.author;
      achievements.showLastTen(sqlite3, user, message, false);




    }else if(message.content.toLowerCase().startsWith("!settings") && owner){

        message.delete();
        const embed = {
            "title": "CURRENT SERVER SETTINGS",
            "description": "",
            "url": "https://discordapp.com",
            "color": 16776966,
            "timestamp": "2020-05-23T09:38:49.916Z",
            "footer": {
              "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
              "text": "footer text"
            },
            "author": {
              "name": message.guild.name,
              "url": "https://discordapp.com",
              "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
            },
            "fields": [
              {
                "name": "Up role at points",
                "value": "32, 64, 82, 91, 1024",
              },
              {
                "name": "Down role at down points",
                "value": "2, 4, 8, 10, 11, 12, ++",
              },
              {
                "name": "Roles",
                "value": "avenger, nooby, rookie, magic, goood, labais"
              }
            ]
          };
        message.author.send({ embed });
        message.author.send("")

      }else if(message.content.startsWith("TET")){
         let member = message.mentions.members.first();
          console.log(member);
      }else if(message.content === "TEST"){
        const embed = {
            "title": "SERVER TOP 10 USERS",
            "description": "",
            "url": "https://discordapp.com",
            "color": 9854828,
            "timestamp": "2020-05-23T09:38:49.916Z",
            "footer": {
              "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png",
              "text": "footer text"
            },
            "thumbnail": {
              "url": message.author.avatarURL() // "https://cdn.discordapp.com/embed/avatars/0.png"
            },
            "image": {
              "url": "https://cdn.discordapp.com/embed/avatars/0.png"
            },
            "author": {
              "name": message.guild.name,
              "url": "https://discordapp.com",
              "icon_url": "https://cdn.discordapp.com/embed/avatars/0.png"
            },
            "fields": [
              {
                "name": "TOP 1",
                "value": "HE IS IN TOP 1"
              },
              {
                "name": "😱",
                "value": "try exceeding some of them!"
              },
              {
                "name": "🙄",
                "value": "an informative error should show up, and this view will remain as-is until all issues are fixed"
              },
              {
                "name": "<:thonkang:219069250692841473>",
                "value": "these last two",
                "inline": true
              },
              {
                "name": "<:thonkang:219069250692841473>",
                "value": "are inline fields",
                "inline": true
              }
            ]
          };
          message.channel.send({ embed });
        }
});
 
