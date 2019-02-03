const config = require('./config');

function getDateTime() {
    var date = new Date();
    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;
    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;
    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;
    return hour + ":" + min + ":" + sec;
}

function getNextLevel(pm25) {
    if (pm25 < 25) {
        return { auto: true }
    }
    else if (pm25 >= 25 && pm25 < 30) {
        return { auto: false, speed: 8 }
    }
    else if (pm25 >= 30 && pm25 < 35) {
        return { auto: false, speed: 12 }
    }
    else {
        return { auto: false, speed: 16 }
    }
}

var setMode = async function (device, modeName) {
    var currentMode = await device.mode();
    if (currentMode === modeName) {
        console.log("already in " + modeName + " mode");
    }
    else {
        await device.setMode(modeName)
            .then(console.log("mode is set to: " + modeName))
            .catch(err => console.log("error while setting mode:" + modeName + ", error: " + err))
    }
}

var setAuto = async function (device) {
    await setMode(device, "auto");
}

var setFavourite = async function (device, speed) {
    console.log("setting next level at: " + speed);
    var currentSpeed = await device.favoriteLevel();
    if (currentSpeed === speed) {
        console.log("speed already set to: " + currentSpeed);
        return;
    }
    await device.setFavoriteLevel(speed)
        .then(console.log("was at: " + currentSpeed + ", successful attempt to set speed: " + speed))
        .catch(err => console.log("error while setting speed: " + err));
    await setMode(device, "favorite");
}

var adjustModeSpeed = async function (device, pm25) {
    var nextLevel = getNextLevel(pm25);
    if (nextLevel.auto) {
        await setAuto(device);
    }
    else {
        await setFavourite(device, nextLevel.speed);
    }
}

var readPm25 = async function (device, cruiseControl) {
    device.pm2_5()
        .then(async pm25 => {
            console.log(getDateTime() + " pm25: " + pm25);
            if (cruiseControl) {
                adjustModeSpeed(device, pm25);
            }

            setTimeout(readPm25, config.interval, ...arguments);
        })
        .catch(err => {
            console.log(getDateTime() + " something went wrong:" + err);
            setTimeout(readPm25, config.interval, ...arguments);
        })
}

module.exports.readPm25 = readPm25;