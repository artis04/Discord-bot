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


var checkPoints = function checkPoints(roleList, message, vote, user){
    // roleList[0] -- upvotes 
    // roleList[1] -- downvotes
    // roleList[2] -- roleNames and color
    let db = new sqlite3.Database('./database.db');
    let sql = `SELECT * FROM votes WHERE userID = ${user.id}`;

    db.get(sql, function(error, row) {
        if(error) return console.error;
        if(row === undefined) return;
    
        if(vote === "downVote"){
            for(i = 0; i < roleList[1].length; i++){
                if((row.downVotes.toString() == roleList[1][i] || (roleList[1][i] == "+=1" && row.downVotes > parseInt(roleList[1][i-1]))) && row.role_points >= roleList[0][0]){
                    // down-Role
                    deroleUser(roleList, message, user, row.role_points, "down");
                    message.channel.send(`😕Bad news, <@!${user.id}> just down-Roled by 1 role`);
                    break;
                    //(roleList[1][i] == "+=1" && row.downvotes > parseInt(roleList[1][i-1]))
                }
            }
        }else{
            for(i = 0; i < roleList[0].length; i++){
                if(row.upVotes.toString() == roleList[0][i]){
                    // up-Role
                    changeRole(roleList, i, message, user, "up"); 
                    message.channel.send(`Congratulations <@!${user.id}>, you just up-Roled to a new role!🎉🎊🎉🎊`);
                }
            }
        }
});
}

function deroleUser(roleList, message, user, rolePoints){
    let db = new sqlite3.Database('./database.db');
    let sql = `UPDATE votes SET role_points = 0  WHERE userID = ${user.id}`;

    // for(i in roleList[0]){
    for(i = 0; i < roleList[0].length; i++){
        if(roleList[0][i+1] === undefined){
            // user reached more than last upvote number in roles.txt!
            sql = `UPDATE votes SET role_points = ${roleList[0][i - 1]} WHERE userID = ${user.id}`;
            changeRole(roleList, i + 1, message, user, "down")
            break;
        }

        if((parseInt(roleList[0][i]) <= rolePoints) && (parseInt(roleList[0][i + 1]) > rolePoints)){ 
            roleList[0][i-1] === undefined ? pts = 0 : pts = roleList[0][i-1];

            /* Remove points to starting at previous role */
            sql = `UPDATE votes SET role_points = ${parseInt(pts)} WHERE userID = ${user.id}`;
            changeRole(roleList, i + 1, message, user, "down");
            break;
        }
    }
    db.run(sql, function(error) {
        if(error) return console.error;
    });
}

async function changeRole(roleList, lineIndex, message, user, vote){

    /* remove previous roles */
    let lowerDiscordRole;
    let higherDiscordRole;
    let currentDiscordRole;
    try {lowerDiscordRole = message.guild.roles.cache.find(role => role.name === roleList[2][parseInt(lineIndex) - 2].split(" == ")[0]);}catch{}
    try {currentDiscordRole = message.guild.roles.cache.find(role => role.name === roleList[2][parseInt(lineIndex) - 1].split(" == ")[0]); }catch{}
    try {higherDiscordRole = message.guild.roles.cache.find(role => role.name === roleList[2][parseInt(lineIndex)].split(" == ")[0]);}catch{}
    
    if(higherDiscordRole === undefined && roleList[2].length != lineIndex){
        /* Create role */
        let roleName = roleList[2][lineIndex].split(" == ")[0];
        let roleColor = roleList[2][lineIndex].split(" == ")[1];
        await message.guild.roles.create({
            data: {
                name: roleName,
                color: roleColor,
                permissions: []
            },
        }).catch(console.error);
        higherDiscordRole = message.guild.roles.cache.find(role => role.name === roleList[2][parseInt(lineIndex)].split(" == ")[0]);
    }

    /* If 1 lower role is deleted or smthing, then my code will remove from user role and will not create new one */
    // BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG BUG

    message.mentions.members.forEach(member => {
        if(member.id === user.id){
            if(vote === "down"){
                if(lowerDiscordRole === undefined){
                    member.roles.remove(currentDiscordRole);
                }else{
                    member.roles.add(lowerDiscordRole);
                    member.roles.remove(currentDiscordRole);
                }
            }else{
                if(currentDiscordRole === undefined){
                    member.roles.add(higherDiscordRole);
                }else{
                    member.roles.add(higherDiscordRole);
                    member.roles.remove(currentDiscordRole);
                }
            }
        
        }
    })
}

module.exports.makeList = makeList;
module.exports.checkPoints = checkPoints;
