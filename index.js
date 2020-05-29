const Discord = require("discord.js");
const config = require("./config.json");
const Database = require("./Database.js");
const userRegiter = require("./userRegister.js");
const userPoints = require("./points.js");
const badWordAlert = require("./badWordAlert.js");
const automatedRoles = require("./automatedRoles.js");
const sqlite3 = require('sqlite3').verbose();
const client = new Discord.Client();


client.login(config.token);
let badWords = badWordAlert.makeList(); // swear and inpolite words

client.on('ready', () => {
    let textChannels = []
    client.channels.cache.forEach(channel => {
        if(channel.type === 'text'){
            textChannels.push(channel.name); // Get all channel names, so to create table in database with channel names
        }
    });
    Database.createTables(sqlite3, textChannels); // creates database with required tables if not created yet.
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
        if(message.content === "!createUser"){
            userRegiter.getUserRegistry(sqlite3, message.author, message)
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
        var voted_users = [];
        voted_users = getAllMentionedUsersOrChannels(message, true);
        // list "voted_users" contains all user ID's who have been upvoted or downvoted in message

        message.content.toLowerCase().startsWith("!upvote") ? positiveVote = true : positiveVote = false;
        // if (message.content.toLowerCase().startsWith("!upvote")){
        //     positiveVote = true;
        // }else{
        //     positiveVote = false;
        // };
     
        for(i = 0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            // userInfo contains id; is_bot?; username; discriminator; avatarID; flags; lastmessageid; lastmessagechannelid
            userInfo.then(user => {
                userPoints.addPoints(sqlite3, positiveVote, user, message);
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
        console.log(users);
        // Database.test(sqlite3, client.users.fetch(users));
    }else if(message.content.toLowerCase().startsWith("!leaderboard")){
        Database.leaderboard(sqlite3, message);
    }else if(message.content.toLowerCase().startsWith("!achievement")){
        let votedUsers = getAllMentionedUsersOrChannels(message, true);

        // let description = "";
        let description = message.content.split("<@!");
        description = description[description.length - 1];
        description = description.substring(20, description.length);

        for(i = 0; i < votedUsers.length; i++){
            var userInfo = client.users.fetch(votedUsers[i]);
            // userInfo contains id; is_bot?; username; discriminator; avatarID; flags; lastmessageid; lastmessagechannelid
            userInfo.then(user => {
                Database.achievement(sqlite3, description, user, message.author);
            }).catch(console.error);
        };
        
        // for(i = 0; i < votedUsers; i++){
        //     client.users.fetch(votedUsers[i]).then(user => {
        //         console.log(user)
        //         Database.achievement(sqlite3, description, user, message.author);
        //     });
        // }
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




    }else if(message.content === "TEST"){
        // const roles = require("./roles.json");
        // let points = 1024;
        // let rolename = "";
        // for(i in roles){
        //     if(points.toString() === i){
        //         rolename = roles[parseInt(i)];
        //     }
        // }
        // console.log(rolename);


        //const roles = require("./roles.txt");
        
        let roles = [];
        let upvotes = [];
        let downvotes = [];

        let indicator = "";

        var fs = require('fs');
        var words = fs.readFileSync('roles.txt').toString().split("\n"); // Googles banned words
        for(i in words) {
            words[i] = words[i].replace("\r", "");
            if(words[i] === "===upvotes==="){
                indicator = "up";
            }else if(words[i] === "===downvotes==="){
                indicator = "down";
            }else if(words[i] === "===roles==="){
                indicator = "roles";
            }
            if(indicator === "up"){
                upvotes.push(words[i]);
            }else if(indicator === "down"){
                downvotes.push(words[i]);
            }else{
                roles.push(words[i]);
            }
        }
        console.log(upvotes);
        console.log(downvotes);
        console.log(roles);
        

    //     message.guild.roles.create({
    //         data: {
    //             name: 'suppper',
    //             color: 'BLUE',
    //             permissions: [separatelyj]
                
    //     },
    //     reacon: "new role for 32 points",
    // }).then(console.log)
    //     .catch(console.error);
    //     console.log(roles[32]);
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
 
