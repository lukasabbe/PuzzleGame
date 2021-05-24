const discord = require("discord.js");
require("dotenv").config();
const client = new discord.Client();
const {createCanvas, loadImage} = require("canvas");
const fs = require("fs");
const prefix = "?";
const players = [];
const gamesCat = "846382025640509461";

client.once("ready",() =>{
    console.log("Bot on");
})

client.on("message",async msg=>{
    if(msg.author.bot||!msg.content.startsWith(prefix)) return;
    const args = msg.content.slice(prefix.length).split(' ');
    if(args[0] == "start") {
        if(await players.find(t => t.id == msg.author.id) == undefined){
            players.push(await createPlayer(msg.author.id));
        }
        let player = players.find(t => t.id == msg.author.id);
        if(player.map == undefined){
            player.map = await getMap(player.level);
        }
        let gameChannel = await msg.guild.channels.create("Game " + msg.author.username, {type:"text",parent:gamesCat, permissionOverwrites:[
            {
                allow:["SEND_MESSAGES","VIEW_CHANNEL"],
                id:msg.author.id
            },
            {
                id:msg.guild.roles.everyone.id,
                deny:["SEND_MESSAGES","VIEW_CHANNEL"]
            }
        ]})
        let edit = await gameChannel.send("*");
        player.oldMap = await gameChannel.send("",{files:[await createMap(player)]})
        msg.delete();
        await edit.react("➡️");
        await edit.react("⬅️");
        await edit.react("⬇️");
        await edit.react("⬆️");
        const filter = (reaction, user) =>{
            return true;
        }
        const colector = edit.createReactionCollector(filter)
        timer(colector,player,gameChannel);
        colector.on("collect", async (reaction,user) =>{
            if(user.id != msg.author.id) return;
            reaction.users.remove(user.id);
            player.removeTimer = true;
            switch(reaction.emoji.name){
                case"➡️":
                    player.xPos += 1;
                    if(await stopBox(player,0) == false){
                        await moveBoxes(player,0);
                        await blowfan(player)  ;
                    } 
                    else player.xPos -=1;
                    break;
                case"⬅️":
                    player.xPos -= 1;
                    if(await stopBox(player,1) == false){
                        await moveBoxes(player,1);
                        await blowfan(player);
                    } 
                    else player.xPos +=1;
                    break;
                case"⬇️":
                    player.yPos += 1;
                    if(await stopBox(player,2) == false){
                        await moveBoxes(player,2);
                        await blowfan(player);
                    } 
                    else player.yPos -=1;
                    break;
                case"⬆️":
                    player.yPos -= 1;
                    if(await stopBox(player,3) == false){
                        await moveBoxes(player,3);
                        await blowfan(player);
                    } 
                    else player.yPos +=1;
                    break;
            }
            player.oldMap.delete();
            if(await truePostions(player) == true){
                console.log("no");
                player.level += 1;
                player.map = undefined;
                player.map = await getMap(player.level);
                player.xPos = 1;
                player.yPos = 1;
                gameChannel.send("Completed level").then(del =>del.delete({timeout: 1000 * 10}));
            }
            player.oldMap = await gameChannel.send("",{files:[await createMap(player)]})
        })
    }
    if(args[0] == "restart"){
        let player = players.find(t => t.id == msg.author.id);
        player.map = undefined;
        player.xPos = 1;
        player.yPos = 1;
        if(player.map == undefined){
            player.map = await getMap(player.level);
        }
        msg.channel.send("restarted map (Move one)").then(del =>del.delete({timeout:5000}))
        msg.delete();
    }
})


async function blowfan(player){
    let lenNum = [];
    if(player.map.blowfans!=undefined){
        await player.map.blowfans.forEach(async fan =>{
            await player.map.grayBoxes.forEach(grayBox =>{
                for(let i = 0 ; i < 9; i++){
                    if(fan.rot == 0){ // right
                        if(grayBox.xPos == fan.xPos+i && grayBox.yPos == fan.yPos){
                            lenNum.push(grayBox.xPos)
                        }
                    }
                    if(fan.rot == 1){ // left
                        if(grayBox.xPos == fan.xPos-i && grayBox.yPos == fan.yPos){
                            lenNum.push(i)
                        }
                    }
                    if(fan.rot == 2){ // up
                        if(grayBox.yPos == fan.yPos+i && grayBox.xPos == fan.xPos){
                            lenNum.push(grayBox.yPos)
                        }
                    }
                    if(fan.rot == 3){ // down
                        if(grayBox.yPos == fan.yPos-i && grayBox.xPos == fan.xPos){
                            lenNum.push(i)
                        }
                    }
                }
            })
            await player.map.blackboxes.forEach(grayBox =>{
                 for(let i = 0 ; i < 9; i++){
                    if(fan.rot == 0){ // right
                        if(grayBox.xPos == fan.xPos+i && grayBox.yPos == fan.yPos){
                            lenNum.push(grayBox.xPos)
                        }
                    }
                    if(fan.rot == 1){ // left
                        if(grayBox.xPos == fan.xPos-i && grayBox.yPos == fan.yPos){
                            lenNum.push(i)
                        }
                    }
                    if(fan.rot == 2){ // up
                        if(grayBox.yPos == fan.yPos+i && grayBox.xPos == fan.xPos){
                            lenNum.push(grayBox.yPos)
                        }
                    }
                    if(fan.rot == 3){ // down
                        if(grayBox.yPos == fan.yPos-i && grayBox.xPos == fan.xPos){
                            lenNum.push(i)
                        }
                    }
                }
            })
            fan.blowLenght = await Math.min(...lenNum);
        })
        await player.map.blowfans.forEach(async fan=>{
            for(let i = 0 ; i < fan.blowLenght; i++){ //spara i riktig lenght istälet för postion 
                player.map.redBoxses.forEach(redBox =>{
                    if(fan.rot == 0){ // right
                        if(redBox.xPos == fan.xPos+i && redBox.yPos == fan.yPos){
                            redBox.xPos = fan.blowLenght -1;
                        }
                    }
                    if(fan.rot == 1){ // left
                        if(redBox.xPos == fan.xPos-i && redBox.yPos == fan.yPos){
                            redBox.xPos = fan.blowLenght +1;
                        }
                    }
                    if(fan.rot == 2){ // down
                        if(redBox.yPos == fan.yPos+i && redBox.xPos == fan.xPos){
                            redBox.yPos = fan.blowLenght -1;
                        }
                    }
                    if(fan.rot == 3){ // up
                        if(redBox.yPos == fan.yPos-i && redBox.xPos == fan.xPos){
                            redBox.yPos = fan.blowLenght +1;
                        }
                    }
                })
            }
        })
    }
}


async function timer(collector, player,channel){
    let timer = client.setInterval(function(){
        if(player.removeTimer == false){
            collector.stop();
            channel.delete();
            client.clearInterval(timer);
            
        }
        else{
            console.log("continue");
            player.removeTimer = false;
        }
    },1000*60*15);
}

async function truePostions(player){
    let counter = 0;
    await player.map.redBoxses.forEach(element=>{
        if(element.xPos == element.txPos && element.yPos == element.tyPos){
            counter++;
        }
    })
    if(counter >= player.map.redBoxses.length)return true;
    else return false
}


async function stopBox(player,dir){
    let b = false;
    if(player.map.blackboxes !=undefined){
        await player.map.blackboxes.forEach(async box =>{
            if(player.xPos == box.xPos && player.yPos == box.yPos){
                b = true;
            }
        })

    }
    if(b) return true;
    else return false;
}

async function moveBoxes(player,dir)
{
    player.map.redBoxses.forEach(async box =>{
        if(player.xPos == box.xPos && player.yPos == box.yPos){
            if(dir == 0){//right
                box.xPos+=1;
                if(await checkForBlackBox(player,dir) == true){
                    box.xPos -=1;
                    player.xPos -=1;
                }
            }
            if(dir == 1){//left
                box.xPos-=1;
                if(await checkForBlackBox(player,dir) == true){
                    box.xPos +=1;
                    player.xPos +=1;
                }
            }
            if(dir == 2){//up
                box.yPos+=1;
                if(await checkForBlackBox(player,dir) == true){
                    box.yPos -=1;
                    player.yPos -=1;
                }
            }
            if(dir == 3){//down
                box.yPos-=1;
                if(await checkForBlackBox(player,dir)==true){
                    box.yPos +=1;
                    player.yPos +=1;
                }
            }
        }
    })
}

async function checkForBlackBox(player,dir){
    let b = false;
    if(player.map.blackboxes != undefined){
        player.map.blackboxes.forEach(blackBox =>{
            player.map.redBoxses.forEach(redBox=>{
                if(blackBox.xPos == redBox.xPos && blackBox.yPos == redBox.yPos){
                    b = true;
                }
            })
        })
    }
    if(b==true) return true;
    else return false;
}

async function createMap(player){
    const map = createCanvas(1000,1000);
    const mapOptions = map.getContext("2d");
    mapOptions.fillStyle = "#fff";
    mapOptions.fillRect(0,0,1000,1000);   
    mapOptions.fillStyle = "#CD1A1A";
    //redBoxes
    await player.map.redBoxses.forEach(element =>{
        mapOptions.fillRect(element.xPos *100,element.yPos*100,100,100);
    })
    //grayBoxes
    mapOptions.fillStyle = "#666666";
    await player.map.grayBoxes.forEach(element =>{
        mapOptions.fillRect(element.xPos *100,element.yPos*100,100,100);
    })
    //blackboxes
    mapOptions.fillStyle = "#000000";
    if(player.map.blackboxes != undefined){
        await player.map.blackboxes.forEach(element =>{
            mapOptions.fillRect(element.xPos *100,element.yPos*100,100,100);
        })
    }
    //fan
    mapOptions.fillStyle = "#F0FF00";
    if(player.map.blowfans != undefined){
        await player.map.blowfans.forEach(element =>{
            mapOptions.fillRect(element.xPos *100,element.yPos*100,100,100);
        })
    }
    //start
    mapOptions.fillStyle = "#0036FC";
    await mapOptions.fillRect(player.map.startWire.xPos *100,player.map.startWire.yPos*100,100,100);

    //End
    mapOptions.fillStyle = "#FF00FF";
    await mapOptions.fillRect(player.map.endWire.xPos *100,player.map.endWire.yPos*100,100,100);
    //player
    mapOptions.fillStyle = "#15D9BE";
    await mapOptions.fillRect(player.xPos *100,player.yPos*100,100,100);
    return map.toBuffer("image/png");
}
function createPlayer(id){
    return {
        id:id,
        xPos:1,
        yPos:1,
        level:6,
        map:undefined,
        removeTimer:false,
    }
}
function getMap(level){
    let mapJson = fs.readFileSync("./maps.json",)
    let map = JSON.parse(mapJson)
    return map[level];
}

client.login(process.env.token);