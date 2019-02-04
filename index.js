const config = require('./config')
const pm25 = require('./pm25')
const readline = require('readline');
const connection = require('./network');


var manualSettings = function () {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    var promptMe = function () {
        rl.question('What do you think of Node.js? ', (answer) => {
            // TODO: Log the answer in a database
            rl.pause();
            console.log(`Thank you for your valuable feedback: ${answer}`);
            promptMe();
        });
    };
    
    promptMe();
    rl.close();
}

var manual = process.argv[2] === 'manual';
if(manual) {
    manualSettings();
}

connection.connectDirectly('192.168.1.102', device => {
    setTimeout(pm25.readPm25, config.interval, device, !manual);
    //         if (manual) {
//             manualSettings();
//         }
});