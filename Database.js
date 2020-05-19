var createTables = function createTables(sqlite3, client){    
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) =>{
        if(error) return console.log(error.message);

        // Connected to database successfuly
        textChannels = [];
        client.channels.cache.forEach(channel => {
            if(channel.type === 'text'){
                textChannels.push(channel.name);
            }
            console.log(textChannels);
        });
        // console.log(client.guild.channels);

        let sql = `
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER,
            upVotes INTEGER,
            downVotes INTEGER,
            points INTEGER
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
            userID INTEGER,
            FOREIGN KEY (userID)
            REFERENCES votes (userID)
                ON UPDATE NO ACTION
                ON DELETE SET DEFAULT
        
        )
        `



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


/*
var points = function points(sqlite3, userId, username, points=1, positiveVote){
    let db = new sqlite3.Database('./database.db');
    let sql = `SELECT upVotes, downVotes FROM votes WHERE userID = ?`
        db.all(sql, [userId], (err, rows) => {
            if (err) {
                return console.log(err.message);
            }
            console.log("Rows: " + rows);
            if (rows == ""){
                // No such user registered in database
                db.run(`INSERT INTO votes (username, userID) VALUES(?, ?)`, [username, userId], function(err){
                    if (err){
                        return console.log(err.message);
                    }
                })
            }
            votes = rows[0];
            console.log(votes);
            // HUGE PROBLES WHEN CREATING NEW USER
            try{
                if (positiveVote){
                    sql = `UPDATE votes SET upVotes = ? WHERE userID = ?`;
                    db.run(sql, [votes.upVotes += 1, userId], function(err) {
                        if (err) {
                        return console.error(err.message);
                        }
                    
                    });
                }
            }catch (TypeError){
                
            }
            
        });
    
*/

var points = function points(sqlite3, userId, username, positiveVote, message){
    let points = 1;
    let db = new sqlite3.Database('./database.db');
    let sql = "";
    let userExists = true;
    
    sql = `SELECT username FROM votes WHERE userID = ?`
    db.get(sql, [userId], function(error, rows){
        if(error) return console.log(error.message);
        
        if(rows === undefined){
            // create new user in database

            sql = `INSERT INTO votes (username, userID) VALUES(?, ?)`;
            db.run(sql, [username, userId], (error) => {
                if(error) return console.log(error.message);
            });
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

/*
    sql = ;
    ///////////////////////////////////////////
        })
        db.run("INSERT INTO votes (username, userID) VALUES(?, ?)", [username, userId], function(err){
            if(err){
                console.log(err.message);
            }
        });
        if (upVote){
            db.run("INSTER INTO votes (")
        }
        sql = `SELECT * FROM votes WHERE userID LIKE ?`;
        // var sql1 = db.exec("SELECT * FROM votes WEHERE userID LIKE " + userId);
        // console.log(sql1);
        sql = `UPDATE votes SET upVotes = 126 WHERE userID = ?`;
        db.run(sql, [userId], function(err) {
            if (err) {
            return console.error(err.message);
            }
            console.log()
        
        });
        db.forEach(sql, function(err, row){
            console.log(row.user_name);
        })
        db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
        rows.forEach((row) => {
            console.log(row.name);
        });
        });
    sql = `SELECT upVotes, downVotes FROM votes WHERE userID = ?`;
    db.all(sql, [userId], (err, rows) => {
        if (err) {
            return console.log(err.message);
        }
        console.log("Rows: " + rows);
        if (rows == ""){
            // No such user registered in database
            
        }
*/

var sendUserPoints = function sendUserPoints(sqlite3, user, message, user){
    let db = new sqlite3.Database('./database.db');
    db.get(`SELECT username FROM votes WHERE userID = ?`, [user.id], function(error, rows) {
        if(error) return console.log(error.message);
        
        if(rows === undefined){
            // create new user in database
            sql = `INSERT INTO votes (username, userID, points) VALUES(?, ?, 0)`;
            db.run(sql, [user.username, user.id], (error) => {
                if(error) return console.log(error.message);
            });
            // user created successfuly
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
                // console.log(rows);
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
