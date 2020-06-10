var achievement = function achievement(sqlite3, description, mentionedUser, fromUser, message){
    db = new sqlite3.Database('./database.db');
    let date = new Date;
    date = date.toString().split(" GMT+");
    date = date[0];
    date += ` (GMT+3)`

    sql = "INSERT INTO achivments (username, userID, description, fromUserID, fromUsername, date) VALUES(?, ?, ?, ?, ?, ?)";

    db.run(sql, [mentionedUser.username, mentionedUser.id, description, fromUser.id, fromUser.username, date], function(error) {
        if(error){
            message.channel.send("**Failed to communicate with database! achievement has not been saved!!!**");
            return console.log(error.message);
        }
        message.channel.send(`<@!${mentionedUser.id}> Congratulations 🎉🎉 you have got new achievement from <@!${fromUser.id}>\nReason:"${description}"`);
    });

    db.close((error) => {
        if(error) return console.log(error.message);
    });
}

var showLastTen = function showLastTen(sqlite3, user, message, dmMessage){
    db = new sqlite3.Database('./database.db');

    let sql = `SELECT * FROM achivments WHERE userID = ${user.id} ORDER BY id DESC`;
    db.all(sql, (error, rows) => {
        if(error) return console.log(error.message);
        
        let count = 1;
        let myMessage = `***<@!${user.id}> You have ${rows.length} achievements!`;

        rows.length > 10 && !dmMessage ? myMessage += ` Here are 10 last ones***` : myMessage += `***`;

        for(i = 0; i < rows.length; i++){
            myMessage += `\n${count}. ${rows[i].description} (you received it from ${rows[i].fromUsername} at [${rows[i].date}])`;
            if(count === 10 && !dmMessage) break;
            count++;
        }
        if(rows.length > 10 && !dmMessage) myMessage += `\n\nIf you want to see all your achievements then write me in private \`!achievements\``;
        message.channel.send(myMessage);
    })
}

module.exports.achievement = achievement;
module.exports.showLastTen = showLastTen;