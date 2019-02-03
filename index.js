const miio = require('miio');
const config = require('./config')
const pm25 = require('./pm25')
const readline = require('readline');


var manualSettings = function () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var promptMe = function () {
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

var ipAddress = '192.168.1.102';
device = miio.device({ address: ipAddress })
    .then(device => {
        console.log('Connected to', device);
        setTimeout(pm25.readPm25, config.interval, device, !manual);
        if (manual) {
            manualSettings();
        }
    })
    .catch(err => console.log("unable to connect to " + ipAddress + " : " + err));


// or discover:
// const browser = miio.browse({
//     cacheTime: 300 // 5 minutes. Default is 1800 seconds (30 minutes)
// });


// var devices = [];
// browser.on('available', reg => {
//     if (!reg.token) {
//         console.log(reg.id, 'hides its token');
//         return;
//     }

//     miio.device(reg)
//         .then(device => {
//             devices[reg.id] = device;
//             setTimeout(pm25.readPm25, config.interval, device, true);
//         })
//         .catch(err => console.log(err));
// });

// browser.on('unavailable', reg => {
//     const device = devices[reg.id];
//     if (!device) return;

//     device.destroy();
//     delete devices[reg.id];
// })