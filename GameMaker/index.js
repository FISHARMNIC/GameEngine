var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d")
var __renderInterval = 10
canvas.style.width = "100%"
canvas.style.height = "600px"
canvas.width = canvas.offsetWidth
canvas.height = canvas.offsetHeight

class sprite {
    constructor(type,source) {
        this.xPos = canvas.width / 2
        this.yPos = canvas.height / 2
        this.type = type
        this.color = "black"
        this.xSize = 5
        this.ySize = 5
        this.source = source
        this.hidden = false
    }
    set(x, y) {
        this.xPos = x
        this.yPos = y
    }
    move(byX, byY) {
        this.xPos += byX
        this.yPos += byY
    }
    reSize(width, height) {
        this.xSize = width
        this.ySize = height
    }
    position() {
        return [this.xPos, this.yPos]
    }
    distanceTo(x,y) {
        return(Math.sqrt( ((this.xPos - x) * (this.xPos - x)) +  ((this.yPos - y) * (this.yPos - y))  ))
    }
}



var Sprites = {}
refreshSpriteList()

var keys = {}
var userScript = `
function init() {

}

function main() {
    
}
`
tryInj()

document.addEventListener("keydown", (e) => {
    keys[e.key] = true
    keys.Space = keys[" "]
})
document.addEventListener("keyup", (e) => {
    keys[e.key] = false
    keys.Space = keys[" "]
})


function newSprite() {
    var name = prompt("sprites name,type, then image source if needed. Seperate by comma").replace(/ /g, "").split(",")
    if (!Object.keys(Sprites).includes(name[0])) {
        Sprites[name[0]] = new sprite(name[1],name[2])
    } else {
        alert("Already a sprite called that!")
    }
    refreshSpriteList()
}

var cloneId = {}
function newInstanceOf(spriteName) {
    if(cloneId[spriteName] == undefined) {
        cloneId[spriteName] = 0
    }
    var cName = "$clone_" + spriteName + "%" + cloneId[spriteName]
    Sprites[cName] = JSON.parse(JSON.stringify(Sprites[spriteName]))
    Sprites[cName].__proto__ = Sprites[spriteName].__proto__
    cloneId[spriteName] += 1
    refreshSpriteList()
}

function onCloneOf(spriteName, id, func) {
    func(`$clone_${spriteName}%${id}`)
}

function forAllClonesOf(spriteName, func) {
    
    var dupe = JSON.parse(JSON.stringify(Sprites))
    console.log(dupe)
    var names = Object.keys(dupe)
    var values = Object.values(dupe)
    for(i = 0; i < names.length; i++) {
        if(names[i].includes(`$clone_${spriteName}`)) {
            console.log("||" + names[i])
            func(names[i],names[i].slice(names[i].indexOf("%")+1))
        }
    }
}
function refreshSpriteList() {
    document.getElementById("allSprites").innerHTML = ""
    console.log(Object.keys(Sprites));
    Object.keys(Sprites).forEach((el, index) => {
        console.log(el)
        document.getElementById("allSprites").innerHTML += `|| ${el} - ${Object.values(Sprites)[index].type} - <img src="${Object.values(Sprites)[index].source}" alt="" width="30" height="30"></img> <br>`
    })


}

function tryInj() {
    var tempCode = (document.getElementById("ta").value)
    try {
        eval(tempCode)
        document.getElementById("codeStatus").innerHTML = "✅"
        userScript = tempCode
    } catch (err) {
        //document.getElementById("codeStatus").innerHTML = "❌"
        document.getElementById("codeStatus").innerHTML = "❌ " + err
    }
}

//rendering
var renderRunner
var notRunning = true
function startRender() {
    if (notRunning) {
        globalThis.arrow_keys_handler = function(e) {
            switch(e.code){
                case "ArrowUp": case "ArrowDown": case "ArrowLeft": case "ArrowRight": 
                    case "Space": e.preventDefault(); break;
                default: break; // do not block other keys
            }
        };
        window.addEventListener("keydown", arrow_keys_handler, false);

        renderTick = 0
        notRunning = false
        document.getElementById("gameStatus").innerHTML = "Running"
        eval(`${userScript} \n start()`)
        renderRunner = setInterval(render, __renderInterval)
    }
}

function stopRender() {
    notRunning = true
    document.getElementById("gameStatus").innerHTML = "Stopped"
    clearInterval(renderRunner);
    window.removeEventListener("keydown", arrow_keys_handler, false);
}

var renderTick = 0
function render() {
    renderTick += 1
    eval(`${userScript} \n main()`)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var AllSprites = Object.values(Sprites)
    //console.log(Sprites)
    for (i = 0; i < AllSprites.length; i++) {
        var current = AllSprites[i]
        //console.log(current)
        if (!current.hidden) {
            switch (current.type) {
                case "circle":
                    //console.log("ya", current.x, current.y)
                    ctx.fillStyle = current.color;
                    ctx.beginPath();
                    ctx.arc(current.xPos, current.yPos, current.xSize, 0, 2 * Math.PI);
                    ctx.fill();
                    break
                case "image":
                    var temp = new Image()
                    temp.src = current.source
                    ctx.drawImage(temp, current.xPos, current.yPos, current.xSize, current.ySize);
            }
        }
    }
}