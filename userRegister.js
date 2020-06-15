var eventRegistry = function eventRegistry(sqlite3, message, userExists){
    // const sqlite3 = require('sqlite3').verbose();
    let db = new sqlite3.Database("./database.db");

    const filter = m => !m.author.bot;
    const collector = message.channel.createMessageCollector(filter, { time: 3000000 });  // creates message collector for 5 minutes max

    // sendInfo(message, name, surname, preferedLanguages, age);
    var fs = require('fs');
    var questions = fs.readFileSync('registryForm.txt').toString().split("\r\n");

    message.channel.send(`
**You are about to create / edit user in database**
To fill form you need to type number then space and then answer (e.g. for surname it will be "2 mySurname")
To save details type \`save\`
To exit without saving type \`exit\``);

    sendInfo(sqlite3, questions, message);
    
    let myMessage = "";
    let answers = new Map();
    let answers1 = {};
    collector.on('collect', msg => {
        if(msg.author.bot) return;
        
        for(i = 0; i < questions.length; i++){
            let number = i + 1;
            if(msg.content.startsWith(number.toString())){
                let word;
                if(i < 10){
                    word = msg.content.substring(2);
                }else{
                    word = msg.content.substring(3);
                }

                if(answers.has(questions[i].split("\r")[0])){
                    answers.delete(questions[i].split("\r")[0]);
                }
                answers.set(questions[i].split("\r")[0], word);

                message.channel.send(`${questions[i].split("\r")[0]}: ${word}`);
                break;
            }
        }

        if(msg.content.toLowerCase() === "exit"){
            collector.stop();
        }else if(msg.content.toLowerCase() === "save"){

            let sql;
            if(userExists){
                sql = `UPDATE eventRegister SET `
                for(i = 0; i < questions.length; i++){
                    let content = answers.get(questions[i].split("\r")[0])
                    if(content != undefined){
                        sql += `${questions[i].split("\r")[0].replace(/\s/g, '_')} = "${content}", `
                    }
                }
                sql = sql.substring(0, sql.length - 2);
                sql += ` WHERE userID = "${message.author.id}"`;

                db.run(sql, function(error) {
                    if(error) return console.error;
                    collector.stop();
                });
        }else{
            sql = `INSERT INTO eventRegister (userID, username, `;
            for(i = 0; i < questions.length; i++){
                let content = answers.get(questions[i].split("\r")[0]);
                if(content != undefined){
                    sql += `${questions[i].split("\r")[0].replace(/\s/g, '_')}, `;
                }
            }
            sql = sql.substring(0, sql.length - 2);
            sql += `) VALUES("${message.author.id}", "${message.author.username}", `;
            for(i = 0; i < questions.length; i++){
                let content = answers.get(questions[i].split("\r")[0]);
                if(content != undefined){
                    sql += `"${content}", `
                }
            }
            sql = sql.substring(0, sql.length - 2);
            sql += `)`;
            db.run(sql, function(error) {
                if(error) return console.error;
                collector.stop();
            });
            
        }
        
    }

    });
    
    collector.on('end', msg => {
        
        message.channel.send("Register form closed due to time limit or by closing it manually");

        message.channel.send("Your current user status:");
        sendInfo(sqlite3, questions, message);
    });
    
}

function sendInfo(sqlite3, questions, message){
    let db = new sqlite3.Database("./database.db");
    // var fs = require('fs');
    // var words = fs.readFileSync('registryForm.txt').toString().split("\n");
    let sql = `SELECT * FROM eventRegister WHERE userID = ?`;
    db.get(sql, [message.author.id], function(error, row) {
        if(error) return console.error;
        
        let myMessage = "```";



        if(row === undefined){
            for(i = 0; i < questions.length; i++){
                myMessage += `${i + 1} -- ${questions[i]} ()\n`;
            }
            myMessage += `\`\`\``
        }else{

            for(i = 0; i < questions.length; i++){
                let nowMessage = row[questions[i].replace(/\s/g, '_')];
                if(nowMessage === undefined || nowMessage === null){
                    nowMessage = row[questions[i]];
                }
                if(nowMessage === null || nowMessage === undefined){
                    nowMessage = "";
                }
                myMessage += `${i + 1} -- ${questions[i]} (${nowMessage})\n`;
            }
            myMessage += `\`\`\``
            
        }

        message.channel.send(myMessage);
    });

}

var getUserRegistry = function getUserRegistry(sqlite3, message, command){
    let db = new sqlite3.Database("./database.db");
    let sql = `SELECT * FROM eventRegister WHERE userID = ?`;
    db.get(sql, [message.author.id], function(error, row) {
        if(error) return console.error;

        if(row === undefined){
            userExists = false;
        }else{
            userExists = true;
        }

        eventRegistry(sqlite3, message, userExists);
    })
    
}

function checkForInterest(sqlite3, message){
    let db = new sqlite3.Database("./database.db");
    // let sql = `SELECT * FROM eventRegister WHERE Prefered_programming_languages LIKE '%python%'`;

    var fs = require('fs');
    var questions = fs.readFileSync('registryForm.txt').toString().split("\r\n");

    let sql = `SELECT * FROM eventRegister`;
    db.all(sql, function(error, rows) {
        if(error) return console.error;
        for(i = 0; i < rows.length; i++){
            for(j = 0; j < questions.length; j++){
                let nowMessage = rows[i][questions[j].replace(/\s/g, '_')];
                if(nowMessage === undefined || nowMessage === null){
                    nowMessage = rows[i][questions[j]];
                }

                console.log(nowMessage);
            }
        }
        console.log(rows);
    })
}
    
module.exports.getUserRegistry = getUserRegistry;
module.exports.eventRegistry = eventRegistry;
// module.exports.sendInfo = sendInfo;
module.exports.checkForInterest = checkForInterest;