const miio = require('miio');
const readline = require('readline');

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    return hour + ":" + min + ":" + sec;
}

function getNextLevel(pm25) {
    if (pm25 < 25) {
        return {auto: true}
    }
    else if(pm25 >= 25 && pm25 < 30) {
        return {auto:false, speed:8}
    }
    else if(pm25 >= 30 && pm25 < 35) {
        return {auto:false, speed:12}
    }
    else{ 
        return { auto:false, speed:16 }
    }
}

var setMode = async function(device, modeName) {
    var currentMode = await device.mode();
    if(currentMode === modeName){
        console.log("already in " + modeName + " mode");
    }
    else {
        await device.setMode(modeName)
        .then(console.log("mode is set to: " + modeName))
        .catch(err => console.log("error while setting mode:" + modeName +", error: " + err))
    }
}

var setAuto = async function(device) {
    await setMode(device, "auto");
}

var setFavourite = async function(device, speed) {
    console.log("setting next level at: " + speed);
    var currentSpeed = await device.favoriteLevel();
    if(currentSpeed === speed) {
        console.log("speed already set to: " + currentSpeed);
        return;
    }
    await device.setFavoriteLevel(speed)
                .then(console.log("was at: " + currentSpeed + ", successful attempt to set speed: " + speed))
                .catch(err => console.log("error while setting speed: " + err));
    await setMode(device, "favorite");
}

var adjustModeSpeed = async function(device, pm25) {
    var nextLevel = getNextLevel(pm25);
    if(nextLevel.auto) {
        await setAuto(device);
    }
    else {
        await setFavourite(device, nextLevel.speed);
    }
}

const interval = 4000;

var readPm25 = async function(device, cruiseControl) {
    device.pm2_5()
            .then(async pm25 =>  {
                console.log(getDateTime() + " pm25: " + pm25);
                if(cruiseControl) {
                    adjustModeSpeed(device, pm25);
                }
                setTimeout(readPm25, interval, device, cruiseControl);
            })
            .catch(err => { 
                console.log(getDateTime() + " something went wrong:" + err);
                setTimeout(readPm25, interval, device, cruiseControl);
            })
}

var manualSettings = function(){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
    var promptMe = function() {
          rl.question('What do you think of Node.js? ', (answer) => {
        // TODO: Log the answer in a database
        console.log(`Thank you for your valuable feedback: ${answer}`);
        promptMe();
      });
    };
    promptMe();
    rl.close();
}

var manual = process.argv[2] === 'manual';
var address = '192.168.1.104' ;

// Resolve a device, resolving the token automatically or from storage
device = miio.device({ address: address })
  .then(device  =>  {
      console.log('Connected to', device);
      setTimeout(readPm25, interval, device, !manual);
      if(manual){
        manualSettings();
      }
  })
  .catch(err => console.log("unable to connect to " + address + " : " + err));