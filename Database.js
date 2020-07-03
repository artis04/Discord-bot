const { exit } = require('process');

var createTables = function createTables(sqlite3, textChannels){    
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) =>{
        if(error) return console.log(error);

        let sql = `
        CREATE TABLE IF NOT EXISTS votes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER,
            upVotes INTEGER DEFAULT 0,
            downVotes INTEGER DEFAULT 0,
            points INTEGER DEFAULT 0,
            role_points INTEGER DEFAULT 0
        )`;

        db.run(sql, (error) => {
            if(error) return console.log(error);

            // table created successfuly
        });

        sql = `
        CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER,
            description TEXT,
            fromUserID INTEGER,
            fromUsername TEXT,
            date DATE
        )`;

        db.run(sql, (error) => {
            if(error) return console.log(error);

            // table created successfuly
        });
  
        sql = `
        CREATE TABLE IF NOT EXISTS channels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            userID INTEGER NOT NULL`;
    
        for(i = 0;i < textChannels.length; i++){ 
            sql += ",\n" + textChannels[i] + " INTEGER DEFAULT 0"; // creates table named channels. and adds columns by channel names ...
        }
        sql += `);`

        db.run(sql, (error) => {
            if(error) return console.log(error);
        });

        sql = `CREATE TABLE IF NOT EXISTS swearTickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL,
            message TEXT NOT NULL,
            link TEXT NOT NULL,
            time DATE
        )`;

        db.run(sql, (error) =>{
            if(error) return console.log(error);

            // table created successfuly
        });

        var fs = require('fs');
        var questions = fs.readFileSync('registryForm.txt').toString().split("\n");

        sql = `CREATE TABLE IF NOT EXISTS eventRegister (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userID INTEGER NOT NULL,
            username INTEGER NOT NULL, `;

            

        for(i = 0; i < questions.length; i++){
            let name = questions[i].replace(/\s/g, '_');
            if(name.substring(name.length - 1) === "_"){
                name = name.substring(0, questions[i].length - 1);
            }
            sql += `${name} TEXT, `;
        }
        sql = sql.substring(0, sql.length - 2);
        sql += ")";

        db.run(sql, (error) => {
            if(error) return console.log(error);

            // table created successfuly
        });

    });

    
    /* Close Database */
    db.close((error) => {
        if (error) return console.log(error);
    });
};

var addUser = function addUser(db, user){
    /* Add new user to "votes" table */
    sql = `INSERT INTO votes (username, userID) VALUES("${user.username}", "${user.id}")`;
    db.run(sql, (error) => {
        if(error) return console.log(error);
    });
    /* ============================= */

    /* Add user to "channels" table */
    sql = `INSERT INTO channels (username, userID) VALUES(?, ?)`
    db.run(sql, [user.username, user.id], (error) => {
        if(error) return console.log(error);
    });
    /* ============================= */

    /* Close Database */
    db.close((error) => {
        if(error) return console.log(error);
    });
}

module.exports.createTables = createTables;
module.exports.addUser = addUser;
