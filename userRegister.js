var eventRegistry = function eventRegistry(message, name, surname, preferedLanguages, interests, age, userExists){
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database("./database.db");

    const filter = m => 1 === 1;
    const collector = message.channel.createMessageCollector(filter, { time: 3000000 });  // creates message collector for 5 minutes max

    message.channel.send(
        "***You are about to create / edit user in database***\n" +
        "To fill form you need to type number then space and then answer (e.g. for surname it will be \"2 mySurname\")\n" +
        "```" + 
        "1 -- Name (" + name + ")\n" + 
        "2 -- Surname (" + surname + ")\n" + 
        "3 -- Prefered programming languages ("+ preferedLanguages + ")\n" + 
        "4 -- Interests (" + interests + ")\n" + 
        "5 -- Age (" + age + ")\n" +
        "9 -- ACCEPT DATA AND UPDATE USER" +
        "```")

    collector.on('collect', msg => {
        if(msg.author.bot) return;

        if(msg.content.startsWith("1")){
            name = msg.content.substring(2);
            message.channel.send("name: " + msg.content.substring(2));

        }else if(msg.content.startsWith("2")){
            surname = msg.content.substring(2);
            message.channel.send("surname: " + msg.content.substring(2));

        }else if(msg.content.startsWith("3")){
            preferedLanguages = msg.content.substring(2);
            message.channel.send("prefered programming languages: " + msg.content.substring(2));

        }else if(msg.content.startsWith("4")){
            interests = msg.content.substring(2);
            message.channel.send("interests: " + msg.content.substring(2));

        }else if(msg.content.startsWith("5")){
            age = msg.content.substring(2);
            message.channel.send("age: " + msg.content.substring(2));

        }else if(msg.content.startsWith("9")){

            if(userExists){
                let sql = `UPDATE eventRegister SET name = ?, surname = ?, age = ?, languages = ?, interests = ? WHERE userID = ?`
                            
                db.run(sql, [name, surname, age, preferedLanguages, interests, msg.author.id], function(error) {
                    if(error){
                        msg.channel.send("Problems with database! User has not been saved!");
                        return console.log(error.message);
                    } 
                    msg.channel.send("User saved succesfully");
                });

            }else{
                let sql = `INSERT INTO eventRegister (userID, username, name, surname, age, languages ,interests) VALUES(?, ?, ?, ?, ?, ?, ?)`

                db.run(sql, [msg.author.id, msg.author.username, name, surname, age, preferedLanguages, interests], function (error) {
                    if(error){
                        msg.channel.send("Problems with database! User has not been created!");
                        return console.log(error.message);
                    } 
                    
                    msg.channel.send("user created succesfully");             
                });
            }
        }
    });
    
    collector.on('end', msg => {
        
        message.channel.send("5 minutes time has expired, you will need to start all over by command !createUser / !editUser")
    });
    
}

var getUserRegistry = function getUserRegistry(sqlite3, user, message){
    let db = new sqlite3.Database("./database.db");
    let sql = `SELECT * FROM eventRegister WHERE userID = ?`

    db.get(sql, [user.id], function(error, row) {
        if(error) return console.log(error.message)

        let name, surname, preferedLanguages, interest, age = "";
        // let surname = "";
        // let preferedLanguages = "";
        // let interests = "";
        // let age = "";
        let userExists = false;

        if(row != undefined){
            userExists = true;
            name = row.name;
            surname = row.surname;
            preferedLanguages = row.languages;
            interest = row.interests;
            age = row.age;
        }

        eventRegistry(message, name, surname, preferedLanguages, interests, age, userExists);
    });
}
    
module.exports.getUserRegistry = getUserRegistry;
module.exports.eventRegistry = eventRegistry;
