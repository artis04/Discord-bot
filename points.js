const Database = require("./Database.js");
const Role_giving = require("./automatedRoles.js");
var sendUserPoints = function sendUserPoints(sqlite3, user, message, channel){
    let db = new sqlite3.Database('./database.db');
    db.get(`SELECT username FROM votes WHERE userID = ?`, [user.id], function(error, rows) {
        if(error) return console.log(error.message);

        if(rows === undefined){
            // create new user in database
            Database.addUser(db, user)
        }
        
        if(channel === undefined){ // if empty then there is not mentioned channel

            sql = `SELECT
                ROW_NUMBER () OVER(
                    ORDER BY points
                ) rowNumber,
                points
                FROM votes WHERE userID = ?`;
            db.all(sql, [user.id], (error, rows) => {
                if (error) return console.log(error.message);
                console.log(rows);
                votes = rows[0];
                // if (rows === "" || votes.points === null){  // in case user have null points it will show 0
                //     // No such user registered in database
                //     votes.points = 0;
                // }   

                let serverPlace = "";

                db.all(`SELECT ROW_NUMBER () OVER (ORDER BY points DESC) rowNumber, username, userID, points FROM votes`, (error, rows) => {
                    if(error) return console.log(error.message);

                    for(let i = 0; i < rows.length;i++){
                        // console.log(rows[i].userID.toString().slice(0, 16));
                        // console.log(user.id.slice(0, 16)); // error
                        if (rows[i].userID.toString().slice(0, 16) == user.id.slice(0, 16)){
                            serverPlace = rows[i].rowNumber;
                            pts = rows[i];
                        }
                    }

                    usernamesWithSamePoints = [];
                    for(i = 0;i < rows.length; i++){
                        if(rows[i].points === pts.points && rows[i].userID != pts.userID){
                            usernamesWithSamePoints.push(rows[i].username);
                        }
                    }


                    if(usernamesWithSamePoints.length != 0){
                        if(usernamesWithSamePoints.length === 1){
                            myMessage = user.username + " is in this place with 1 other user: "
                        }else{
                            myMessage = user.username + " is in this place with " + usernamesWithSamePoints.length + " other users: "
                        }

                        for(i = 0; i < usernamesWithSamePoints.length; i++){
                            myMessage += usernamesWithSamePoints[i] + ", "; // No mentioning to not spam mentions to users who don't want to be mentioned?
                        }
                        myMessage = myMessage.slice(0, myMessage.length - 2) + ".";
                        message.channel.send(myMessage);
                        
                    }
                    if(serverPlace === ""){
                        message.channel.send("<@!" + user.id + "> Currently have 0 points");
                    }else if(serverPlace === 1){
                        serverPlace = "1st";
                    }else if(serverPlace === 2){
                        serverPlace = "2nd";
                    }else if(serverPlace === 3){
                        serverPlace = "3rd";
                    }else{
                        serverPlace = serverPlace + "th";
                    }
                    message.channel.send("<@!" + user.id + "> has " + votes.points + " points! \n Currently in " + serverPlace + " Place on " + message.guild.name + " server");
                });
            });
        } else {
            sql = `SELECT ` + channel.name + ` FROM channels WHERE userID = ?`;
            db.get(sql, [user.id], function(error, row) {
                if(error) return console.log(error.message);
                // console.log(row);
                myMessage = "user <@!" + user.id + "> has " + row[channel.name] + " points in <#" + channel.id + "> channel.";
                message.channel.send(myMessage);
            });
        }
        
        
    });
}

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

function updatePoints(sqlite3, userId){
    let db = new sqlite3.Database('./database.db');
    let sql = `UPDATE votes SET points = upVotes - downVotes WHERE userID = ?`;
  
    db.run(sql, [userId], function(err) {
        if (err) {
            return console.error(err.message);
        }

    });

}

var addPoints = function addPoints(sqlite3, positiveVote, user, message, roleList){
    let db = new sqlite3.Database('./database.db');
    let sql = "";

    sql = `SELECT username FROM votes WHERE userID = ?`
    db.get(sql, [user.id], function(error, rows){
        if(error) return console.log(error.message);
        
        if(rows === undefined){
            // create new user in database

            Database.addUser(db, user);
        }
       
        if (positiveVote){
            sql = `UPDATE votes SET upVotes = upVotes + 1, role_points = role_points + 1 WHERE userID = ?`;
            db.run(sql, [user.id], function(error) {
                if (error){
                message.channel.send("Database error, user is NOT updated");
                return console.error(error.message);
                }
                // Role_giving.check(sqlite3, roleList, user);
            });
            
            sql = `UPDATE channels SET ` + message.channel.name + ` = ` + message.channel.name + ` + 1 WHERE userID = ?`;
            db.run(sql, [user.id], function(error) {
                if(error){
                message.channel.send("Database error, user is NOT updated");
                return console.error(error.message);
                }
                sendMessage(message, user, true);
            })

           
        }else{
            sql = `UPDATE votes SET downVotes = downVotes + 1 WHERE userID = ?`;
            db.run(sql, [user.id], function(error){
                message.channel.send("Database error, user is NOT updated");
                if(error) return console.log(err.message);
            });
            sendMessage(message, user, false);
        }
        updatePoints(sqlite3, user.id);  // update points column in database
        positiveVote ? vote = "downVote" : vote = "upVote";
        Role_giving.createRoles(roleList, message, vote);
        // TODO: hello

        // Role_giving.check(sqlite3, roleList, user);
    });
};

function sendMessage(message, user, upVote){
    if(upVote){
        message.channel.send("<@!" + message.author.id + "> upvoted <@!" + user.id + ">");
    }else{
        message.channel.send("<@!" + message.author.id + "> downvoted <@!" + user.id + ">")
    }
    // In case mentioning gets annoying:
    /*
    message.channel.send(message.author.username + " upvoted " + user.username);
    */
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
module.exports.sendUserPoints = sendUserPoints;
module.exports.leaderboard = leaderboard;
module.exports.addPoints = addPoints;
module.exports.achievement = achievement;
