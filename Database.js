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
            points INTEGER DEFAULT 0,
            role_points INTEGER DEFAULT 0,
            role_index INTEGER DEFAULT 0
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

var addUser = function addUser(db, user){
    sql = `INSERT INTO votes (username, userID) VALUES(?, ?)`;
    db.run(sql, [user.username, user.id], (error) => {
        if(error) return console.log(error.message);
    });

    sql = `INSERT INTO channels (userID) VALUES(?)`
    db.run(sql, [user.id], (error) => {
        if(error) return console.log(error.message);
    });

    db.close((error) => {
    if(error) return console.log(error.message)
    });
}

module.exports.createTables = createTables;
module.exports.addUser = addUser;
