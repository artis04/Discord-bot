var eventRegistry = function eventRegistry(message, name, surname, preferedLanguages, age, userExists){
    const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database("./database.db");

    const filter = m => !m.author.bot;
    const collector = message.channel.createMessageCollector(filter, { time: 3000000 });  // creates message collector for 5 minutes max

    sendInfo(message, name, surname, preferedLanguages, age);
    var fs = require('fs');
    var words = fs.readFileSync('registryForm.txt').toString().split("\n");
    
    collector.on('collect', msg => {
        if(msg.author.bot) return;
        
        // TODO error have to finish it!!!
        for(i in words){
            let number = i + 1;
            if(msg.content.startsWith(number.toString())){
                if(i < 10){
                    words[i] = msg.content.substring(2);
                }else{
                    words[i] = msg.content.substring(3);
                }
                message.channel.send(`${words[i]}: `)
            }
        }


        if(msg.content.startsWith("1")){
            words[0] = msg.content.substring(2);
            message.channel.send("name: " + msg.content.substring(2));

        }else if(msg.content.startsWith("2")){
            surname = msg.content.substring(2);
            message.channel.send("surname: " + msg.content.substring(2));

        }else if(msg.content.startsWith("3")){
            preferedLanguages = msg.content.substring(2);
            message.channel.send("prefered programming languages: " + msg.content.substring(2));

        }else if(msg.content.startsWith("4")){
            age = msg.content.substring(2);
            message.channel.send("age: " + msg.content.substring(2));

        }else if(msg.content.startsWith("9")){
            console.log(words[0])
            if(userExists){
                let sql = `UPDATE eventRegister SET name = ?, surname = ?, age = ?, languages = ? WHERE userID = ?`;
                            
                db.run(sql, [name, surname, age, preferedLanguages, msg.author.id], function(error) {
                    if(error){
                        msg.channel.send("Problems with database! User has not been saved!");
                        return console.log(error.message);
                    } 
                    msg.channel.send("User saved succesfully");
                });

            }else{
                let sql = `INSERT INTO eventRegister (userID, username, name, surname, age, languages) VALUES(?, ?, ?, ?, ?, ?)`;

                db.run(sql, [msg.author.id, msg.author.username, name, surname, age, preferedLanguages], function (error) {
                    if(error){
                        msg.channel.send("Problems with database! User has not been created!");
                        return console.log(error.message);
                    } 
                    
                    msg.channel.send("user created succesfully");             
                });
            }
            collector.stop();
        }
    });
    
    collector.on('end', msg => {
        
        message.channel.send("Register form closed due to time limit or by closing it manually");
    });
    
}

var sendInfo = function sendInfo(message, name, surname, preferedLanguages, age){
    var fs = require('fs');
    var words = fs.readFileSync('registryForm.txt').toString().split("\n");
    
    // let myMessage = "";
    // for(i in words){
    //     myMessage += `${i + 1} -- ${words[i]} (${})`        
    // }

    message.channel.send(
        `\`\`\`
1 -- Name (${name})
2 -- Surname (${surname})
3 -- Prefered programming languages (${preferedLanguages})
4 -- Age (${age})
9 -- ACCEPT DATA AND UPDATE USER \`\`\`
        `
    );

    // message.channel.send(
    //     "```1 -- Name (" + name + ")\n" + 
    //     "2 -- Surname (" + surname + ")\n" + 
    //     "3 -- Prefered programming languages ("+ preferedLanguages + ")\n" + 
    //     "4 -- Age (" + age + ")\n" +
    //     "9 -- ACCEPT DATA AND UPDATE USER" +
    //     "```");
}

var getUserRegistry = function getUserRegistry(sqlite3, user, message, command){
    let db = new sqlite3.Database("./database.db");
    let sql = `SELECT * FROM eventRegister WHERE userID = ?`;

    db.get(sql, [user.id], function(error, row) {
        if(error) return console.log(error.message);

        let name = "", surname = "", preferedLanguages = "", age = "";
        let userExists = false;

        if(row != undefined){
            userExists = true;
            name = row.name;
            surname = row.surname;
            preferedLanguages = row.languages;
            age = row.age;
        }

        if(command === "createUser"){
            message.channel.send("***You are about to create / edit user in database***\n" +
            "To fill form you need to type number then space and then answer (e.g. for surname it will be \"2 mySurname\")\n")
            eventRegistry(message, name, surname, preferedLanguages, age, userExists);
        }else if(command === "getUser"){
            sendInfo(message, name, surname, preferedLanguages, age);
        }
    });
}
    
module.exports.getUserRegistry = getUserRegistry;
module.exports.eventRegistry = eventRegistry;
module.exports.sendInfo = sendInfo;