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

Database.createTables(sqlite3, client);  // creates database with required tables if not created yet.

client.login(config.token);
//console.log(client.channels.cache.for);
// client.channels.cache.forEach(channel => {
//     if(channel.type === 'text'){
//         textChannels.push(channel.name);
//     }
//     console.log(textChannels);
// });
// console.log(client.channels.cache);

function getAllMentionedUsers(message){
    var usersId = message.content.split("<@!");  // mentioned user id's  (Discord mentioning works like: <@!CLIENT_ID>)
    let mentionedPersons = [];
    for(var i = 1; i < usersId.length; i++){
        try{ // in case there is no valid @mention user id (then do catch == skip this.)

            var valid_id = usersId[i].substring(0, usersId[i].indexOf(">"))
            if (!mentionedPersons.includes(valid_id)){  // pervents to spam one user multiple times at once.
                mentionedPersons.push(valid_id);
            }
        }
        catch{}
    }
    return mentionedPersons;
}


client.on('message', message => {
    var ownerOrSensei = false;


    // console.log(client.guilds.channels);
    // console.log(message.guild.channels.guild);
    textChannels = [];
    message.guild.channels.cache.forEach(channel => {
        if(channel.type === 'text'){
            textChannels.push(channel.name);
        }
        // console.log(textChannels);
    });

    console.log(message.guild.channels.cache);
    //709855212315213884

    // client.guilds.channel.cache.forEach((guild) => {
    //     console.log(guild.name);
    // });
    // const listedChannels = []; 
    // console.log(message.guild.channels.forEach(element => {
    //    console.log(element); 
    // }));
    // message.guild.channels.forEach(channel => { 
    //     if(channel.permissionsFor(message.author).has('VIEW_CHANNEL')) listedChannels.push(channel.name);
    // });
    // message.channel.send(`You have access to: ${listedChannels.join(',')}`);

    /*
    let channelNames = []
    message.channels.forEach(channel => {
        if(channel.permissionFor(message.author).has('VIEW_CHANNEL')) {
            channelNames.push(channel.name);
        }
    });
    console.log(channelNames);

*/
    // console.log(message.channels);
    for(i=0;i<message.guild.channels.length;i++){
        console.log(message.guild.channels[i].type);
    }

    if(message.member.roles.cache.find(role => role.name === "Owner") || message.member.roles.cache.find(role => role.name === "Sensei")) {
        ownerOrSensei = true;  // checks if message was sent from owner or Sensei (Role named Owner or Sensei)
    }

    if(message.content.toLowerCase().startsWith("!upvote") || message.content.toLowerCase().startsWith("!downvote")){
        var voted_users = [];
        voted_users = getAllMentionedUsers(message);
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
                Database.addPoints(sqlite3, user.id, user.username, positiveVote);
            }).catch(console.error);
        };


    }else if(message.content.toLowerCase().startsWith("!points")){
        let voted_users = getAllMentionedUsers(message);
        console.log(voted_users);

        for(i=0; i < voted_users.length; i++){
            var userInfo = client.users.fetch(voted_users[i]);
            userInfo.then(async user => {
                Database.sendUserPoints(sqlite3, user, message, user);
            }).catch(console.error);
        }
    }
});
