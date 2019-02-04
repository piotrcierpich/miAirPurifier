const miio = require('miio')

module.exports.connectDirectly = function (ipAddress, onConnect) {

    miio.device({ address: ipAddress })
        .then(device => {
            console.log('Connected to', device);
            onConnect(device);
        })
        .catch(err => console.log("unable to connect to " + ipAddress + " : " + err));

}

module.exports.discover = function (onConnect) {
    miio.devices({
        cacheTime: 300 // 5 minutes. Default is 1800 seconds (30 minutes)
    });

    devices.on('available', reg => {
        if (!reg.token) {
            console.log(reg.id, 'hides its token');
            return;
        }

        const device = reg.device;
        if (!device) {
            console.log(reg.id, 'could not be connected to');
            return;
        }

        // Do something useful with the device
        console.log("connected to: " + device.id);
        onConnect(device);
    });

    devices.on('unavailable', reg => {
        if (!reg.device)
            return;

        // Do whatever you need here
    });

    devices.on('error', err => {
        // err.device points to info about the device
        console.log('Something went wrong connecting to device', err);
    });
}

module.exports.browse = function (onFound) {
    const browser = miio.browse({
        cacheTime: 300 // 5 minutes. Default is 1800 seconds (30 minutes)
    });


    var devices = [];
    browser.on('available', reg => {
        if (!reg.token) {
            console.log(reg.id, 'hides its token');
            return;
        }

        onFound(reg);
        // miio.device(reg)
        //     .then(device => {
                
        //     })
        //     .catch(err => console.log(err));
    });

    browser.on('unavailable', reg => {
        const device = devices[reg.id];
        if (!device) return;

        device.destroy();
        delete devices[reg.id];
    })
}