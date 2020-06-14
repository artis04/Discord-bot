var sweraAlert = function sweraAlert(sqlite3, client, message){
    let db = new sqlite3.Database('./database.db');
    
    /* Creates message link, which is ".com/channels/server_id/channle_id/message_id" */
    let messageLink = "https://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;

    db.get(`SELECT id FROM swearTickets ORDER BY id DESC`, function(error, lastRow){
        if(error) return console.error;

        /* I'm using lastRow id to create ticket id's */
        let lastRowId = "";
        lastRow === undefined ? lastRowId = 1 : lastRowId = lastRow.id + 1;

        /* Create new row in "swearTickets" table */
        let sql = `INSERT INTO swearTickets (userID, message, link) VALUES(?, ?, ?)`;
        db.run(sql, [message.author.id, message.content, messageLink], function(error) {
            if(error) return console.error;

            /* Send warning message to messages author */
            myMessage =`
***Don't swear or use bad words!*** 
We have already informed all ABWPU (Anti Bad Word Patrol Units) about this incident, they will review this case #${("0000" + lastRowId).substring(lastRowId.toString().length)} as soon as possible 
**deleting message won't help, we already sent proofs of this message to owner** 
btw your message content:
${message.content}
${messageLink}`;
                
            message.author.send(myMessage);

            /* Send to owner embed message */
            client.users.fetch(message.guild.owner.id).then((owner) => {
              const embed = {
                "title": "***SWEAR WORD ALERT***",
                "description": "Someone used bad words on server!",
                "url": messageLink,
                "color": 13632027,
                "timestamp": new Date,
                "footer": {
                  "icon_url": "https://i.ibb.co/tJQLDCD/index.png",
                  "text": message.guild.name
                },
                "thumbnail": {
                  "url": message.author.avatarURL()
                },
                "author": {
                  "name": client.user.username,
                  "url": "https://discordapp.com",
                  "icon_url": "https://i.ibb.co/tJQLDCD/index.png" // "https://img.icons8.com/nolan/64/open-in-browser.png"
                },
                "fields": [
                  {
                    "name": "SENDER",
                    "value": `<@!${message.author.id}>`
                  },
                  {
                    "name": "message",
                    "value": message.content
                  },
                  {
                    "name": "channel",
                    "value": message.channel
                  },
                  {
                    "name": "link",
                    "value": messageLink
                  },
                  {
                      "name": "Ticket ID",
                      "value": `#${("0000" + lastRowId).substring(lastRowId.toString().length)}`
                  }
                ]
              };
              owner.send({ embed });
            });
        });
    });
}

var makeList = function makeList(){
    let badWords = [];
    var fs = require('fs');
    var words = fs.readFileSync('bannedWords.txt').toString().split("\n"); // Googles banned words
    for(i in words) {
        badWords.push(words[i]);
        badWords[i] = badWords[i].replace('\r', '').replace('\n', ''); // remove \r and \n tags from list
    }
    /* Create badWords list which contains every word (as new line) from bannedWords.txt file */
    return badWords;
}

var checkIfContains = function checkIfContains(sqlite3, client, message, badWords){
    content = message.content.split(" ");
    /* .include doesn't work, because it check if there is strings like that.... 
        example word hello contains hell, then it triggers
        to pervent that I made 2 "for" loops that checks for exact words to be written */
    for(i = 0; i < content.length; i++){
        for(j = 0; j < badWords.length; j++){
            if(content[i] === badWords[j]){
                sweraAlert(sqlite3, client, message);
                /* After finding that in message is written bad word, exit from function to pervent sending multiple
                warning messages (if message contains more bad words) */
                return;
            }
        }
    }
}

module.exports.sweraAlert = sweraAlert;
module.exports.makeList = makeList;
module.exports.checkIfContains = checkIfContains;
