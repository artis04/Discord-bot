const Discord = require("discord.js");
const config = require("./config.json");
const Database = require("./Database.js");
const sqlite3 = require('sqlite3').verbose();
const client = new Discord.Client();

/*
<!-- Cool Commands -->
 message.guild.name
 client.runtime
 */

client.login(config.token);

client.on('ready', () => {
    let textChannels = []
    client.channels.cache.forEach(channel => {
        if(channel.type === 'text'){
            textChannels.push(channel.name);
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

client.on('message', message => {
    var ownerOrSensei = false;
    if(message.member.roles.cache.find(role => role.name === "Owner") || message.member.roles.cache.find(role => role.name === "Sensei")) {
        ownerOrSensei = true;  // checks if message was sent from owner or Sensei (Role named Owner or Sensei)
    }

    if(message.content.toLowerCase().startsWith("!upvote") || message.content.toLowerCase().startsWith("!downvote")){
        var voted_users = [];
        voted_users = getAllMentionedUsersOrChannels(message, true);
        console.log(voted_users);

        // list "voted_users" contains all user ID's who have been upvoted or downvoted in message

        if (message.content.toLowerCase().startsWith("!upvote")){
            positiveVote = true;
        }else{
            positiveVote = false;
        };
     
        for(i = 0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            // userInfo contains id; is_bot?; username; discriminator; avatarID; flags; lastmessageid; lastmessagechannelid
            userInfo.then(user => {
                Database.addPoints(sqlite3, user.id, user.username, positiveVote, user);
            }).catch(console.error);
        };


    }else if(message.content.toLowerCase().startsWith("!points")){
        let voted_users = getAllMentionedUsersOrChannels(message, true);
        let channels = getAllMentionedUsersOrChannels(message, false);

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
                if(mentionedTextChannels.length === 0){
                    Database.sendUserPoints(sqlite3, user,message, undefined);
                }else{
                    for(i = 0; i < mentionedTextChannels.length; i++){
                        Database.sendUserPoints(sqlite3, user, message, mentionedTextChannels[i]);
                    }
                }
            }).catch(console.error);
        }
    }
});
 
