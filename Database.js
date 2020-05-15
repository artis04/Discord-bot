var createTables = function createTables(sqlite3){
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) =>{
        if(error) return console.log(error.message);

        // Connected to database successfuly
        
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

var points = function points(sqlite3, userId, username, points=1, positiveVote){
    let db = new sqlite3.Database('./database.db');
    let sql = "";
    sql = `SELECT upVotes, downVotes FROM votes WHERE userID = ?`;

        db.all(sql, [userId], (err, rows) => {
            if (err) {
                return console.log(err.message);
            }
            console.log("Rows: " + rows);
            if (rows == ""){
                // No such user registered in database
                
            }

            votes = rows[0];
            console.log(votes);


            if (positiveVote){
                try{
                        sql = `UPDATE votes SET upVotes = ? WHERE userID = ?`;
                        db.run(sql, [votes.upVotes += points, userId], function(err) {
                            if (err) {
                            return console.error(err.message);
                            }
                        
                        });
                    
                }catch(TypeError){
                    // No such user registered in database
                    db.run(`INSERT INTO votes (username, userID, upVotes) VALUES(?, ?, 1)`, [username, userId], function(error){
                        if (error){
                            return console.log(error.message);
                        }
                        updatePoints(sqlite3, userId, votes);  // update points column in database
            

                    });
                }   
            }else{
                try{
                    sql = `UPDATE votes SET downVotes = ? WHERE userID = ?`;
                    db.run(sql, [votes.downVotes += points, userId], function(err){
                        if(err){
                            return console.log(err.message);
                        }
                    });
                }catch(TypeError){
                    db.run(`INSERT INTO votes (username, userID, downVotes) VALUES(?, ?, ?)`, [username, userId, points], function(err){
                        if(err){
                            return console.log(err.message);
                        }
                    })
                }
            }
            // updatePoints(sqlite3, userId, votes);  // update points column in database
            
        });
    

    // })

    // db.run("INSERT INTO votes (username, userID) VALUES(?, ?)", [username, userId], function(err){
    //     if(err){
    //         console.log(err.message);
    //     }
    // });

    // if (upVote){
    //     db.run("INSTER INTO votes (")
    // }


    // sql = `SELECT * FROM votes WHERE userID LIKE ?`;
    // // var sql1 = db.exec("SELECT * FROM votes WEHERE userID LIKE " + userId);
    // // console.log(sql1);
    // sql = `UPDATE votes SET upVotes = 126 WHERE userID = ?`;


    // db.run(sql, [userId], function(err) {
    //     if (err) {
    //       return console.error(err.message);
    //     }
    //     console.log()
      
    //   });

    // db.forEach(sql, function(err, row){
    //     console.log(row.user_name);
    // })

    // db.all(sql, [], (err, rows) => {
    // if (err) {
    //     throw err;
    // }
    // rows.forEach((row) => {
    //     console.log(row.name);
    // });
    // });



    
};

var getPoints = function getPoints(sqlite3, userId, message, user){
    let db = new sqlite3.Database('./database.db');

    let sql = `SELECT points FROM votes WHERE userID = ?`;
    db.all(sql, [userId], (error, rows) => {
        if (error) return console.log(error.message);
    
        votes = rows[0];
        if (rows === "" || votes.points === null){  // in case user have null points it will show 0
            // No such user registered in database
            votes.points = 0;
        }   
        
        message.channel.send(user.username + " has " + votes.points + " points!");
        return votes.points;
    });

}

// sql = `SELECT upVotes, downVotes FROM votes WHERE userID = ?`;

// db.all(sql, [userId], (err, rows) => {
//     if (err) {
//         return console.log(err.message);
//     }
//     console.log("Rows: " + rows);
//     if (rows == ""){
//         // No such user registered in database
        
//     }


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
module.exports.getPoints = getPoints;
