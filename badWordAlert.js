var sweraAlert = function sweraAlert(sqlite3, client, message){
    let db = new sqlite3.Database('./database.db');
    let messageLink = "https://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;

    db.get(`SELECT id FROM swearTickets ORDER BY id DESC`, function(error, lastRow){
        if(error) return console.log(error.message);

        let lastRowId = "";

        lastRow === undefined ? lastRowId = 1 : lastRowId = lastRow.id + 1;

        let sql = `INSERT INTO swearTickets (userID, message, link) VALUES(?, ?, ?)`
        db.run(sql, [message.author.id, message.content, messageLink], function(error) {
            if(error) return console.log(error.message);

            myMessage = "" + 
                "***Don't swear or use bad words!***\n" + 
                "We have already informed all police units about this incident, they will review this case #" + ("00000" + lastRowId).substring(lastRowId.toString().length) + " ASAP \n" + 
                "**deleting message won't help, we already sent proofs of this message to owner**\n" + 
                // "If this word is taken out of context then don't worry, our helpers will resolve this case and you will not receive down points\n" + 
                // "If you think this word is not swear word at all then don't be shy to report this to our helpers or to devolopers :)\n\n" + 
                "btw your message content:\n" + message.content + "\n" + messageLink;
        
                
            message.author.send(myMessage);
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
                        "value": "<@!" + message.author.id + ">"
                      },
                      {
                        "name": "message",
                        "value": message.content
                      },
                      {
                        "name": "channel",
                        "value": "<#" + message.channel + ">"
                      },
                      {
                        "name": "link",
                        "value": messageLink
                      },
                      {
                          "name": "Ticket ID",
                          "value": "#" + ("00000" + lastRowId).substring(lastRowId.toString().length)
                      }
                    ]
                  };
                owner.send({ embed });
            });

        });
    });
}

var makeList = function makeList(){
    let badWords = []
    var fs = require('fs');
    var words = fs.readFileSync('bannedWords.txt').toString().split("\n"); // Googles banned words
    for(i in words) {
        badWords.push(words[i]);
        badWords[i] = badWords[i].replace('\r', '').replace('\n', ''); // remove \r and \n tags from list
    }
    return badWords;
}

var checkIfContains = function checkIfContains(sqlite3, client, message, badWords){
    content = message.content.split(" ");
    console.log(content);
    // .include doesn't work, because it check if there is strings like that.... 
    // example word hello contains hell, then it triggers
    // to pervent that i made 2 for loops and checks for words
    for(i = 0; i < content.length; i++){
        for(j = 0; j < badWords.length; j++){
            if(content[i] === badWords[j]){
                sweraAlert(sqlite3, client, message)
            }
        }
    }
}

module.exports.sweraAlert = sweraAlert;
module.exports.makeList = makeList;
module.exports.checkIfContains = checkIfContains;
