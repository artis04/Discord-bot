var achievement = function achievement(sqlite3, description, mentionedUser, fromUser, message){
    db = new sqlite3.Database('./database.db');
    let date = new Date;
    date = date.toString().split(" GMT+")[0];
    date += ` (GMT+3)`;

    /* Add new row in database "achievements" table */
    sql = "INSERT INTO achivments (username, userID, description, fromUserID, fromUsername, date) VALUES(?, ?, ?, ?, ?, ?)";
    db.run(sql, [mentionedUser.username, mentionedUser.id, description, fromUser.id, fromUser.username, date], function(error) {
        if(error){
            message.channel.send("**Failed to communicate with database! achievement has not been saved!!!**");
            return console.error;
        }
        message.channel.send(`<@!${mentionedUser.id}> Congratulations 🎉🎉 you have got new achievement from <@!${fromUser.id}>\nDescription:"${description}"`);
    });

    /* Close Database */
    db.close((error) => {
        if(error) return console.error;
    });
}

var showLastTen = function showLastTen(sqlite3, user, message, dmMessage){
    db = new sqlite3.Database('./database.db');

    let sql = `SELECT * FROM achivments WHERE userID = ${user.id} ORDER BY id DESC`;
    db.all(sql, (error, rows) => {
        if(error) return console.error;
        
        let count = 1;
        let myMessage = `***<@!${user.id}> You have ${rows.length} achievements!`;

        /* Checks if user has more than 10 achievements and if it isn't dm channel, to say that bot shows only 10 last not all of them */
        rows.length > 10 && !dmMessage ? myMessage += ` Here are 10 last ones***` : myMessage += `***`;

        for(i = 0; i < rows.length; i++){
            myMessage += `\n${count}. ${rows[i].description} (you received it from ${rows[i].fromUsername} at [${rows[i].date}])`;
            if(count === 10 && !dmMessage){
                myMessage += `\n\nIf you want to see all your achievements then write me in private \`!achievements\``;
                break;
            } 
            count++;
        }
        // if(rows.length > 10 && !dmMessage) myMessage += `\n\nIf you want to see all your achievements then write me in private \`!achievements\``;
        message.channel.send(myMessage);
    })
}

module.exports.achievement = achievement;
module.exports.showLastTen = showLastTen;
