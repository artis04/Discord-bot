var createTables = function createTables(sqlite3, textChannels){    
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) =>{
        if(error) return console.log(error.message);

        // Connected to database successfuly

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
            if(error){
                return console.log(error.message);
            }
            // table created successfuly
        });

        sql = `
        CREATE TABLE IF NOT EXISTS achivments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER,
            description TEXT,
            by_who TEXT
        )`;

        db.run(sql, (error) => {
            if(error){
                return console.log(error.message);
            }
            // table created successfuly
        });
  
        sql = `
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL`
        for(i=0;i < textChannels.length; i++){
            sql += ",\n" + textChannels[i] + " INTEGER DEFAULT 0";
        }
        sql += `,\n FOREIGN KEY(userID)
                    REFERENCES votes (userID)
                    ON DELETE NO ACTION
                );`
        // console.log(sql);


        db.run(sql, (error) => {
            if(error) return console.log(error.message);
        });

    });

    

    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        // database closed successfuly
    });
};

var points = function points(sqlite3, userId, username, positiveVote, textChannels, user){
    let points = 1;
    let db = new sqlite3.Database('./database.db');
    let sql = "";
    let userExists = true;
    
    sql = `SELECT username FROM votes WHERE userID = ?`
    db.get(sql, [userId], function(error, rows){
        if(error) return console.log(error.message);
        
        if(rows === undefined){
            // create new user in database

            addUser(db, user, textChannels);
            // sql = `INSERT INTO votes (username, userID) VALUES(?, ?)`;
            // db.run(sql, [username, userId], (error) => {
            //     if(error) return console.log(error.message);
            // });
            // user created successfuly
        }
        db.all(`SELECT upVotes, downVotes FROM votes WHERE userID = ?`, [userId], (err, rows) => {
            if (err) return console.log(err.message);
            
            votes = rows[0];
            console.log(votes);

            if (positiveVote){
                        sql = `UPDATE votes SET upVotes = ? WHERE userID = ?`;
                        db.run(sql, [votes.upVotes += 1, userId], function(error) {
                            if (error) return console.error(err.message);
                        });
            }else{
                    sql = `UPDATE votes SET downVotes = ? WHERE userID = ?`;
                    db.run(sql, [votes.downVotes += 1, userId], function(error){
                        if(error) return console.log(err.message);
                    });
            }
            updatePoints(sqlite3, userId, votes);  // update points column in database
        });
    });
};

function addUser(db, user, textChannels){
    sql = `INSERT INTO votes (username, userID) VALUES(?, ?)`;
    db.run(sql, [user.username, user.id], (error) => {
        if(error) return console.log(error.message);
    });

    sql = `INSERT INTO channels (userID) VALUES(?)`

    // for(i = 0; i < textChannels.length; i++){
    //     sql += ",\n" + textChannels[i]

    // }
    // sql += ") VALUES(?" + ", 0".repeat(textChannels.length) + ")"


        console.log(sql);

    db.run(sql, [user.id], (error) => {
        if(error) return console.log(error.message);
    });

}

var sendUserPoints = function sendUserPoints(sqlite3, user, message, user, textChannels){
    let db = new sqlite3.Database('./database.db');
    db.get(`SELECT username FROM votes WHERE userID = ?`, [user.id], function(error, rows) {
        if(error) return console.log(error.message);

        if(rows === undefined){
            // create new user in database
            addUser(db, user, textChannels)
        }
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
            if (rows === "" || votes.points === null){  // in case user have null points it will show 0
                // No such user registered in database
                votes.points = 0;
            }   

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
                    myMessage = "You are in this place with " + usernamesWithSamePoints.length + " other users: "
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
                return votes.points;
            })
        });
    });
}

var sendUserChannelPoints = function sendUserChannelPoints(sqlite3){
    let db = new sqlite3.Database('./database.db');

    sql = ``;
}

function updatePoints(sqlite3, userId, votes){
    let db = new sqlite3.Database('./database.db');
    let sql = `UPDATE votes SET points = ? WHERE userID = ?`;
  
    db.run(sql, [votes.upVotes - votes.downVotes, userId], function(err) {
        if (err) {
            return console.error(err.message);
        }

    });

}


module.exports.createTables = createTables;
module.exports.addPoints = points;
module.exports.sendUserPoints = sendUserPoints; 
module.exports.sendUserChannelPoints = sendUserChannelPoints;
