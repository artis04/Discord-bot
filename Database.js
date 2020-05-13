var create = function create(sqlite3){

    
    let db = new sqlite3.Database('./database.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) =>{
        if(err){
            console.error(err.message);
        }
        console.log("Connected to the database.")
        
        db.run('CREATE TABLE votes(userID INTEGER, user_name TEXT, points INTEGER);', function(err){
            if(err){
                console.log(err.message);
            }
            console.log('Table created');
        });
    });



    // let sql = 'SELECT DISTINCT points name FROM playlists ORDER BY user';

    // db.all(sql, [], (err, rows) =>{
    //     if (err){
    //         throw err;
    //     }
    //     rows.forEach((row) =>{
    //         console.log(row.name);
    //     });
    // });



    db.close((err) => {
        if (err) {
        console.error(err.message);
        }
        console.log('Close the database connection.');
    });
};

var points = function points(sqlite3, userId, username){
    let db = new sqlite3.Database('database.db');

    db.run("INSERT INTO votes (userID, user_name, points) VALUES(?, ?, ?)", [userId, username, 1], function(err){
        if(err){
            console.log(err.message);
        }
    });


};





module.exports.create = create;
module.exports.points = points;
