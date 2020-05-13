const Discord = require("discord.js");
const config = require("./config.json");
const Database = require("./Database.js");
const sqlite3 = require('sqlite3').verbose();
const client = new Discord.Client();


Database.create(sqlite3);  // creates database with required tables if not created yet.

client.login(config.token);

client.on('message', message => {
    var msg = message.content;

    if(msg.toLowerCase().startsWith("!upvote") || msg.toLowerCase().startsWith("!downvote")){
        var voted = [];
        var person = msg.split("<@!");  // mentioned user id's

        for(var i = 1; i<person.length; i++){
            try{ // in case there is no valid @mention user id
                voted.push(person[i].substring(0, person[i].indexOf(">")));
            }
            catch{}
        }
        // list "Voted" contains all user ID's who have been upvoted or downvoted in one message
        console.log(voted); 
        
        // user_details = client.users.fetch(voted[0]);
        // console.log(user_details);
        client.users.fetch(voted[0]);
        console.log(client.user.username);
        
        // message.channel.send(voted[0]);

        Database.points(sqlite3, voted[0], "ArtisDD");


    }


});
