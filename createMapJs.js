


let check = true;
var colornow;
var now;
var map = {
    redBoxses:[],
    startWire:{
        xPos: 0,
        yPos: 0
    },
    endWire:{
        xPos: 0,
        yPos: 0
    },
    grayBoxes:[],
    blackboxes:[],
    blowfans:[]
}
var placeHolder = []
document.getElementById("start").addEventListener("click",function(){
    colornow = "#0036FC";
    now = "start";
})
document.getElementById("end").addEventListener("click",function(){
    colornow = "#FF00FF";
    now = "end";
})
document.getElementById("move").addEventListener("click",function(){
    colornow = "#931B1B";
    now = "move";
})
document.getElementById("save").addEventListener("click",function(){
    let p = document.createElement("p");
    let pl = document.createElement("p");
    p.innerHTML = JSON.stringify(map);
    pl.innerHTML = JSON.stringify(placeHolder);
    document.body.appendChild(p);
    document.body.appendChild(pl);
})
document.getElementById("stay").addEventListener("click",function(){
    colornow = "#666666";
    now = "stay";
})
document.getElementById("placeholder").addEventListener("click",function(){
    colornow = "#4D6F45";
    now = "placeholder";
})
document.getElementById("fan").addEventListener("click",function(){
    colornow = "#F0FF00";
    now = "fan";
})
document.getElementById("stop").addEventListener("click",function(){
    colornow = "#000000";
    now = "stop";
})

window.addEventListener('DOMContentLoaded', (event) => {
    let btns =[];
    var rotation = 0;
    var rotationP = document.createElement("p");
    rotationP.innerHTML = rotation;
    document.body.appendChild(rotationP)
    document.addEventListener("keydown",event =>{
        if(event.code == "KeyR"){
            if(rotation == 3){
                rotation =0;
            }else rotation++;
        }
        if(rotation == 0){
            rotationP.innerHTML = "➡️"
        }
        if(rotation == 1){
            rotationP.innerHTML = "⬅️"
        }
        if(rotation == 2){
            rotationP.innerHTML = "⬇️"
        }
        if(rotation == 3){
            rotationP.innerHTML = "⬆️"
        }
    })

    for(let y = 0 ; y < 10 ; y++){
        var div = document.createElement("div");
        div.id = "div"+y;
        document.body.appendChild(div);
        document.body.appendChild(div);
        for(let x = 0 ; x < 10 ; x++){
            var btn = document.createElement("button")
            btn.style.padding = "20px";
            btn.style.margin = "2px"
            btn.style.backgroundColor = "#fff"
            btn.xPos = x;
            btn.yPos = y;
            btns.push(btn);
            document.getElementById("div" + y).appendChild(btn);
        }
    }
    for(let i = 0 ; i < btns.length ; i++){
        btns[i].addEventListener("click",function(){
            btns[i].style.backgroundColor = colornow;
            if(now == "start"){
                map.startWire.xPos = btns[i].xPos;
                map.startWire.yPos = btns[i].yPos;
            }
            if(now == "end"){
                map.endWire.xPos = btns[i].xPos;
                map.endWire.yPos = btns[i].yPos;
            }
            if(now == "move"){
                let obj = {
                    xPos:btns[i].xPos,
                    yPos:btns[i].yPos ,
                    txPos:btns[i].xPos,
                    tyPos:btns[i].yPos 
                }
                map.redBoxses.push(obj);
            }
            if(now == "move-end"){

            }
            if(now == "stay"){
                let obj = {
                    xPos:btns[i].xPos,
                    yPos:btns[i].yPos ,
                }
                map.grayBoxes.push(obj);
            }
            if(now == "fan"){
                let obj = {
                    xPos:btns[i].xPos,
                    yPos:btns[i].yPos,
                    rot:rotation,
                    blowLenght:0
                }
                map.blowfans.push(obj);
            }
            if(now == "stop"){
                let obj = {
                    xPos:btns[i].xPos,
                    yPos:btns[i].yPos ,
                }
                map.blackboxes.push(obj);
            }
            if(now == "placeholder"){
                let obj = {
                    xPos:btns[i].xPos,
                    yPos:btns[i].yPos ,
                }
                placeHolder.push(obj);
            }
        })
    }
})