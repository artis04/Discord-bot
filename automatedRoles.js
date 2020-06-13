const sqlite3 = require('sqlite3').verbose();
var makeList = function makeList(){
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


}


var createRoles = function createRoles(roleList, message, vote, user){
    // roleList[0] -- upvotes 
    // roleList[1] -- downvotes
    // roleList[2] -- roleNames and color
    let db = new sqlite3.Database('./database.db');
    let sql = "SELECT * FROM votes WHERE userID = ?";

    db.get(sql, [user.id], function(error, row) {
        if(error) return console.log(error.message);
    
        if(vote === "downVote"){
            for(i = 0; i < roleList[1].length; i++){
                if(row.downVotes.toString() == roleList[1][i]){
                    // de-Role
                    sql = `UPDATE votes SET role_index = role_index - 1`;
                    deroleUser(roleList, i, message, user, row.role_points);
                }
            }
        }else{
            for(i = 0; i < roleList[0].length; i++){
                if(row.upVotes.toString() == roleList[0][i]){
                    // up-Role
                    createRoleIfNotExistsAndAssingToUser(roleList, i, message, user); 



                }
            }
        }
});
}

function deroleUser(roleList, lineIndex, message, user, rolePoints){
    let sql = `UPDATE votes SET role_points = 0  WHERE userID = ${user.id}`;

    for(i in roleList[0]){
        if(roleList[0][parseInt(i)+1] === undefined){
            // reached more than last last upvote number!
            sql = `UPDATE votes SET role_points = ${roleList[0][i - 1]}`;
            break;
        }

        if(parseInt(roleList[0][i]) <= rolePoints && (parseInt(roleList[0][parseInt(i) + 1]) > rolePoints)){ 
            roleList[0][i-1] === undefined ? pts = 0 : pts = roleList[0][i-1];

            sql = `UPDATE votes SET role_points = ${parseInt(pts)} WHERE userID = ${user.id}`;

            //let roleName = roleList[2][lineIndex].split(" == ")[0];
        
            //let discordRole = message.guild.roles.cache.find(role => role.name === roleName);
            createRoleIfNotExistsAndAssingToUser(roleList, i, message, user);

            break;
        }
    }
    console.log(sql);
    // db.run(sql, function(error) {
    //     if(error) return console.log(console.log(error.message))

    // })
}

async function createRoleIfNotExistsAndAssingToUser(roleList, lineIndex, message, user){

    /* remove previous roles */
    let lowerDiscordRole = message.guild.roles.cache.find(role => role.name === roleList[2][lineIndex - 1].split(" == ")[0]);
    let higherDiscordRole = message.guild.roles.cache.find(role => role.name === roleList[2][listIndex + 1].split(" == ")[0]);

    message.mentions.members.forEach(member => {
        if(member.id === user.id){
            member.roles.remove(lowerDiscordRole);
            member.roles.remove(higherDiscordRole);
        }
    })
    /* ====================== */

    /* Create role if not exists */
    let roleName = roleList[2][lineIndex].split(" == ")[0];
    let roleColor = roleList[2][lineIndex].split(" == ")[1];
    let discordRole = message.guild.roles.cache.find(role => role.name === roleName);

    if(discordRole === undefined){
        await message.guild.roles.create({
            data: {
                name: roleName,
                color: roleColor,
                permissions: []
        },
        })
        .catch(console.error);
        discordRole = message.guild.roles.cache.find(role => role.name === roleName);
    }
    /* ========================= */

    /* Assign new role for that member */
    message.mentions.members.forEach(member => {
        if(member.id === user.id){
            member.roles.add(discordRole);
        }
    });
    /* =============================== */
}

module.exports.makeList = makeList;
module.exports.createRoles = createRoles;
