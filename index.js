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

// Database.createTables(sqlite3, client);  // creates database with required tables if not created yet.

client.login(config.token);
//console.log(client.channels.cache.for);
// client.channels.cache.forEach(channel => {
//     if(channel.type === 'text'){
//         textChannels.push(channel.name);
//     }
//     console.log(textChannels);
// });
// console.log(client.channels.cache);



client.on('ready', () => {
    let textChannels = []
    client.channels.cache.forEach(channel => {
        if(channel.type === 'text'){
            textChannels.push(channel.name);
        }
    })
    Database.createTables(sqlite3, textChannels);
});


function getAllMentionedUsersOrChannels(message, persons){
    if(persons){
        split_string = "<@!";
    }else{
        split_string = "<#";
    }
    // (Discord mentioning works like: <@!CLIENT_ID>   OR <#CHANNEL_ID>)
    var specificID = message.content.split(split_string);
    let mentioned = [];
    for(var i = 1; i < specificID.length; i++){
        try{ // in case there is no valid @mention user id (then do catch == skip this.)

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
    
    // console.log(message.channels);
    for(i=0;i<message.guild.channels.length;i++){
        console.log(message.guild.channels[i].type);
    }

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
     
        let textChannels = []
        message.guild.channels.cache.forEach(channel => {
            if(channel.type === 'text'){
                textChannels.push(channel.name);
            }
        });
        
        for(i = 0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            // userInfo contains id; is_bot?; username; discriminator; avatarID; flags; lastmessageid; lastmessagechannelid
            userInfo.then(user => {
                Database.addPoints(sqlite3, user.id, user.username, positiveVote, textChannels, user);
            }).catch(console.error);
        };


    }else if(message.content.toLowerCase().startsWith("!points")){
        console.log(message.content);
        let voted_users = getAllMentionedUsersOrChannels(message, true);
        let channels = getAllMentionedUsersOrChannels(message, false);
        console.log(voted_users);
        console.log(channels);

        let mentionedTextChannels = []
        message.guild.channels.cache.forEach(channel => {
            if(channels.includes(channel.id)){
                mentionedTextChannels.push(channel.name);
            }

        });
        console.log(client.users.fetch(voted_users[0]));


        for(i=0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            userInfo.then(async user => {
                for(i = 0; i < channels.length; i++){
                    
                }

                Database.sendUserPoints(sqlite3, user, message, user, textChannels);
            }).catch(console.error);
        }
    }
});
