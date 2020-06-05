const sqlite3 = require('sqlite3').verbose();
var makeList = function makeList(){
    // let roleList = []
    // var fs = require('fs');
    // var words = fs.readFileSync('bannedWords.txt').toString().split("\n"); // Googles banned words
    // for(i in words) {
    //     roleList.push(words[i]);
    //     roleList[i] = roleList[i].replace('\r', '').replace('\n', ''); // remove \r and \n tags from list
    // }
    // return roleList;



    let roles = [];
    let upvotes = [];
    let downvotes = [];

    let indicator = "";

    var fs = require('fs');
    var words = fs.readFileSync('roles.txt').toString().split("\n"); // Googles banned words
    for(i in words) {
        words[i] = words[i].replace("\r", "");
        if(words[i] === "===upvotes==="){
            indicator = "up";
        }else if(words[i] === "===downvotes==="){
            indicator = "down";
        }else if(words[i] === "===roles==="){
            indicator = "roles";
        }
        if(indicator === "up"){
            upvotes.push(words[i]);
        }else if(indicator === "down"){
            downvotes.push(words[i]);
        }else{
            roles.push(words[i]);
        }
    }
    upvotes.shift();
    downvotes.shift();
    roles.shift();
    return ([upvotes, downvotes, roles]); // MAKE ALL IN ONE LIST


    // console.log(upvotes);
    // console.log(downvotes);
    // console.log(roles);
}


var createRoles = function createRoles(roleList, message, vote, user){
    // roleList[0] -- upvotes 
    // roleList[1] -- downvotes
    // roleList[2] -- roleNames and color
    let db = new sqlite3.Database('./database.db');
    let sql = "SELECT * FROM votes WHERE userID = ?";

    db.get(sql, [user.id], function(error, row) {
        if(error) return console.log(error.message);
        console.log(row);
    
        if(vote === "downVote"){
            for(i = 0; i < roleList[1].length; i++){
                if(row.downVotes.toString() == roleList[1][i]){
                    // de-Role
                    sql = `UPDATE votes SET role_index = role_index - 1`

                }
            }
        }else{
            for(i = 0; i < roleList[0].length; i++){
                if(row.upVotes.toString() == roleList[0][i]){
                    // up-Role

                    createRoleIfNotExistsAndAssingToUser(roleList, i, message, user); // due to syncronized function work i cannot manage to get variable before it continues the code
                    // Thats why it is in one function

                }
            }
        }


        // for(i = 0; i < roleList[2].length; i++){
        //     let line = roleList[2][i];
        //     let name = line.split(" == ")[0];
        //     let color = line.split(" == ")[1];




        // }
});
}


var check = function check(sqlite3, roleList, user){
    let db = new sqlite3.Database('./database.db');

    let sql = `SELECT * FROM votes WHERE userID = ?`;
    db.get(sql, [user.id], function(error, row) {
        if(error) return console.log(error.message);

        for(i = 0; i < roleList[0].length; i++){
            if(row.role_points.toString() === roleList[0][i]){
                updateRole(sqlite3, user);
            }
        }

    });

}

function updateRole(sqlite3, user){
    let db = new sqlite3.Database("./database.db");
    let sql = `UPDATE votes SET role_index = role_index + 1 WHERE userID = ?`;

    db.run(sql, [user.id], function(error) {
        if(error) return console.log(error.message);
    });

    sql = `SELECT role_index FROM votes WHERE userID = ?`;
    db.get(sql, [user.id], function(error, row) {
        if(error) return console.log(error.message);

        let deservedRole = row.role_index;
        
    });

}

function createRoleIfNotExistsAndAssingToUser(roleList, lineIndex, message, user){
    let roleName = roleList[2][lineIndex].split(" == ")[0];
    let roleColor = roleList[2][lineIndex].split(" == ")[1];
    let exists = false;
    let discordRole;

    message.guild.roles.cache.forEach(role => {
        if(role.name == roleName){
            exists = true;
            discordRole = role;
        }
    });

    if(!exists){

        message.guild.roles.create({
            data: {
                name: roleName,
                color: roleColor,
                permissions: []
        },
        })
        .catch(console.error);
    }
    console.log("#########");
    console.log(user);
    // user.roles.add(discordRole);

    // let role = message.guild.roles.cache.find(r => r.name === "noob");
    // let member = message.mentions.members.first();
    // member.roles.add(role);


}

module.exports.check = check;
module.exports.makeList = makeList;
module.exports.createRoles = createRoles;
