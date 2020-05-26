var createTables = function createTables(sqlite3, textChannels){    
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) =>{
        if(error) return console.log(error.message);

        let sql = `
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER,
            upVotes INTEGER DEFAULT 0,
            downVotes INTEGER DEFAULT 0,
            points INTEGER DEFAULT 0
        )`;

        db.run(sql, (error) => {
            if(error) return console.log(error.message);

            // table created successfuly
        });

        sql = `
        CREATE TABLE IF NOT EXISTS achivments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER,
            description TEXT,
            fromUserID INTEGER,
            fromUsername TEXT
        )`;

        db.run(sql, (error) => {
            if(error) return console.log(error.message);

            // table created successfuly
        });
  
        sql = `
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL`
    
        for(i = 0;i < textChannels.length; i++){ 
            sql += ",\n" + textChannels[i] + " INTEGER DEFAULT 0"; // creates table named channels. and adds columns by channel names ...
        }
        sql += `);`

        db.run(sql, (error) => {
            if(error) return console.log(error.message);
        });

        sql = `CREATE TABLE IF NOT EXISTS swearTickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL,
            message TEXT NOT NULL,
            link TEXT NOT NULL
        )`

        db.run(sql, (error) =>{
            if(error) return console.log(error.message);
        });

        sql = `CREATE TABLE IF NOT EXISTS eventRegister (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL,
            username INTEGER NOT NULL,
            name TEXT,
            surname TEXT,
            age INTEGER,
            languages TEXT,
            interests TEXT
        )`

        db.run(sql, (error) => {
            if(error) return console.log(error.message);
        });

    });

    

    db.close((error) => {
        if (error) {
            return console.error(error.message);
        }
        // database closed successfuly
    });
};

var points = function points(sqlite3, positiveVote, user, message){
    let db = new sqlite3.Database('./database.db');
    let sql = "";

    sql = `SELECT username FROM votes WHERE userID = ?`
    db.get(sql, [user.id], function(error, rows){
        if(error) return console.log(error.message);
        
        if(rows === undefined){
            // create new user in database

            addUser(db, user);
        }
       

        if (positiveVote){
            sql = `UPDATE votes SET upVotes = upVotes + 1 WHERE userID = ?`;
            db.run(sql, [user.id], function(error) {
                if (error) return console.error(error.message);
            });
            
            sql = `UPDATE channels SET ` + message.channel.name + ` = ` + message.channel.name + ` + 1 WHERE userID = ?`;
            db.run(sql, [user.id], function(error) {
                if(error) return console.error(error.message);
            })
        }else{
            sql = `UPDATE votes SET downVotes = downVotes + 1 WHERE userID = ?`;
            db.run(sql, [user.id], function(error){
                if(error) return console.log(err.message);
            });
        }
        updatePoints(sqlite3, user.id);  // update points column in database
    });
};

var addUser = function addUser(db, user){
    sql = `INSERT INTO votes (username, userID) VALUES(?, ?)`;
    db.run(sql, [user.username, user.id], (error) => {
        if(error) return console.log(error.message);
    });

    sql = `INSERT INTO channels (userID) VALUES(?)`
    db.run(sql, [user.id], (error) => {
        if(error) return console.log(error.message);
    });

}

// var sendUserPoints = function sendUserPoints(sqlite3, user, message, channel){
//     let db = new sqlite3.Database('./database.db');
//     db.get(`SELECT username FROM votes WHERE userID = ?`, [user.id], function(error, rows) {
//         if(error) return console.log(error.message);

//         if(rows === undefined){
//             // create new user in database
//             addUser(db, user)
//         }
        
//         if(channel === undefined){ // if empty then there is not mentioned channel

//                 sql = `SELECT
//                     ROW_NUMBER () OVER(
//                         ORDER BY points
//                     ) rowNumber,
//                     points
//                     FROM votes WHERE userID = ?`;
//                 db.all(sql, [user.id], (error, rows) => {
//                     if (error) return console.log(error.message);
//                     console.log(rows);
//                     votes = rows[0];
//                     // if (rows === "" || votes.points === null){  // in case user have null points it will show 0
//                     //     // No such user registered in database
//                     //     votes.points = 0;
//                     // }   

//                     let serverPlace = "";

//                     db.all(`SELECT ROW_NUMBER () OVER (ORDER BY points DESC) rowNumber, username, userID, points FROM votes`, (error, rows) => {
//                         if(error) return console.log(error.message);

//                         for(let i = 0; i < rows.length;i++){
//                             // console.log(rows[i].userID.toString().slice(0, 16));
//                             // console.log(user.id.slice(0, 16)); // error
//                             if (rows[i].userID.toString().slice(0, 16) == user.id.slice(0, 16)){
//                                 serverPlace = rows[i].rowNumber;
//                                 pts = rows[i];
//                             }
//                         }

//                         usernamesWithSamePoints = [];
//                         for(i = 0;i < rows.length; i++){
//                             if(rows[i].points === pts.points && rows[i].userID != pts.userID){
//                                 usernamesWithSamePoints.push(rows[i].username);
//                             }
//                         }


//                         if(usernamesWithSamePoints.length != 0){
//                             if(usernamesWithSamePoints.length === 1){
//                                 myMessage = user.username + " is in this place with 1 other user: "
//                             }else{
//                                 myMessage = user.username + " is in this place with " + usernamesWithSamePoints.length + " other users: "
//                             }

//                             for(i = 0; i < usernamesWithSamePoints.length; i++){
//                                 myMessage += usernamesWithSamePoints[i] + ", "; // No mentioning to not spam mentions to users who don't want to be mentioned?
//                             }
//                             myMessage = myMessage.slice(0, myMessage.length - 2) + ".";
//                             message.channel.send(myMessage);
                            
//                         }
//                         if(serverPlace === ""){
//                             message.channel.send("<@!" + user.id + "> Currently have 0 points");
//                         }else if(serverPlace === 1){
//                             serverPlace = "1st";
//                         }else if(serverPlace === 2){
//                             serverPlace = "2nd";
//                         }else if(serverPlace === 3){
//                             serverPlace = "3rd";
//                         }else{
//                             serverPlace = serverPlace + "th";
//                         }
//                         message.channel.send("<@!" + user.id + "> has " + votes.points + " points! \n Currently in " + serverPlace + " Place on " + message.guild.name + " server");
//                         // return votes.points;  // remove comment if errors
//                     });
//                 });
            
            
//         } else {
//             // myMessage = "user <@!" + user.id + "> has ";
            
//             sql = `SELECT ` + channel.name + ` FROM channels WHERE userID = ?`;
//             db.get(sql, [user.id], function(error, row) {
//                 if(error) return console.log(error.message);
//                 // console.log(row);
//                 myMessage = "user <@!" + user.id + "> has " + row[channel.name] + " points in <#" + channel.id + "> channel.";
//                 message.channel.send(myMessage);
//             });
//         }
        
        
//     });
// }


var leaderboard = function leaderboard(sqlite3, message){
    
    let db = new sqlite3.Database('./database.db');
//SELECT ROW_NUMBER () OVER (ORDER BY points DESC) rowNumber, userID, points FROM votes
    db.all(`SELECT * FROM votes ORDER BY points DESC LIMIT 10`, (error, rows) => {
        if(error) return console.log(error.message);        
        let myMessage = "**===Servers leaderboard===**\n";
        let position = 1;
        for(i = 0; i < rows.length; i++){
            myMessage += "\n" + position + " -- " + rows[i].username + " with " + rows[i].points + " points.";
            position++;
        }
        myMessage += "\n\n**=====================**"
        message.channel.send(myMessage);

    });
}


var sweraAlert = function sweraAlert(sqlite3, message, client){
    let db = new sqlite3.Database('./database.db');
    let messageLink = "https://discordapp.com/channels/" + message.guild.id + "/" + message.channel.id + "/" + message.id;
    let sql = `INSERT INTO swearTickets (userID, message, link) VALUES(?, ?, ?)`
    db.get(`SELECT id FROM swearTickets ORDER BY id DESC`, function(error, lastRow){
        if(error) return console.log(error.message);
        let lastRowId = lastRow.id + 1
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

var achievement = function achievement(sqlite3, description, mentionedUser, fromUser){
    db = new sqlite3.Database('./database.db');

    sql = "INSERT INTO achivments (username, userID, description, fromUserID, fromUsername) VALUES(?, ?, ?, ?, ?)"
    db.run(sql, [mentionedUser.username, mentionedUser.id, description, fromUser.id, fromUser.username], function(error) {
        if(error) return console.log(error.message);
    });

    db.close((error) => {
        if(error) return console.log(error.message);
    });

}

function updatePoints(sqlite3, userId){
    let db = new sqlite3.Database('./database.db');
    let sql = `UPDATE votes SET points = upVotes - downVotes WHERE userID = ?`;
  
    db.run(sql, [userId], function(err) {
        if (err) {
            return console.error(err.message);
        }

    });

}

var test = function test(sqlite3, user){
    console.log(user);
}

var dmMessages = function dmMessages(sqlite3, message){
    let db = new sqlite3.Database("./database.db");
    let sql = `SELECT userID FROM eventRegister WHERE userID = ?`;
    if(message.content.toLowerCase().startsWith("!help")){
        let helpMessage = "All available commmands: \n";
        
        
        db.get(sql, [message.author], function(error, row) {
            if(error) return console.log(error.message)
            
            if(row === undefined){ // user is not registered yet
                helpMessage += ":one: **!createProfile** -- create profile to automatically add you to courses or events";
            }else{
                helpMessage += ":one: **!editProfile** -- edit profile";
            }
            message.channel.send(helpMessage);
        });
    }else if(message.content.toLowerCase().startsWith("!createprofile") || message.content.toLowerCase().startsWith("!editprofile")){

        console.log("HELLLLO");
        db.get(sql, [message.author], function(error, row) {
            if(error) return console.log(error.message);

            if(row === undefined){
                sql = `INSERT INTO eventRegister (userID, username, name, sunrame, age, language, interests, birthday) VALUES(?, ?, ?, ?, ?, ?, ?, ?)`




            }

        })
    }
   
    const embed = {
        "title": "***HELP MENU***",
        "description": "this message is showing all available commands.",
        "color": 16098851,
        "timestamp": new Date,
        "footer": {
          "icon_url": "https://i.ibb.co/tJQLDCD/index.png",
          "text": "HELP MENU"
        },
        "fields": [
          {
            "name": "Name",
            "value": "?"
          },
          {
            "name": "Surname",
            "value": "?"
          },
          {
            "name": "age",
            "value": "?"
          }
        ]
      }
      

}


module.exports.createTables = createTables;
module.exports.addPoints = points;
// module.exports.sendUserPoints = sendUserPoints; 
module.exports.leaderboard = leaderboard;
module.exports.test = test;
module.exports.sweraAlert = sweraAlert;
module.exports.achievement  = achievement;
module.exports.dmMessages = dmMessages;
module.exports.addUser = addUser;
