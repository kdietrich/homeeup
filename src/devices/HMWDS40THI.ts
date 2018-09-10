const Logger = require('logplease');
const logger = Logger.create('HMWDS40THI');
var fs = require('fs');
var path = require('path');
const EventEmitter = require('events');

export class HMWDS40THI {

    templatePath: String = 'HM-WDS40-TH-I.json';
    deviceName: String;
    events = new EventEmitter();
    template;
    plugin;
    server;
    temperature1 = 29;
    humidity1 = 53;

    constructor(deviceName: String) {
        this.deviceName = deviceName;
    }

    init(pluginParams, plugin, server) {
        //logger.debug('init(%s,%s,%s)', JSON.stringify(pluginParams), JSON.stringify(JSON.decycle(plugin)),  JSON.stringify(server));
    // can't sringify circulat structures
        logger.debug('init(%s,%s)', JSON.stringify(pluginParams), JSON.stringify(server));

        this.plugin = plugin;
        this.server = server;

        var jsonPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../src/devices/');
        var file = fs.readFileSync(jsonPath + this.templatePath, 'latin1');
        file = file.replace(/%ADDRESS%/g, this.deviceName);
        file = file.replace(/"%TEMPERATURE1%"/g, this.temperature1);
        file = file.replace(/"%HUMIDITY1%"/g, this.humidity1);
        this.template = JSON.parse(file);

        logger.info('Device %s of plugin %s initialized.', this.deviceName, this.plugin.name);
    }

    getChannels() {
        return this.template.channels;
    }

    getParamset(name, type) {
        logger.debug('getParamset(%s,%s)', name, type);
        for(let i=0; i<this.template.paramsets.length; i++) {
            var p = this.template.paramsets[i];
            if((p.name.indexOf(name) > -1) && p.type === type) {
                return p;
            }
        };
        return null;
    }

    getParamsetDescription(name, type) {
        logger.debug('getParamsetDescription(%s,%s)', name, type);
        for(let i=0; i<this.template.paramsetDescriptions.length; i++) {
            var pd = this.template.paramsetDescriptions[i];
            if((pd.name.indexOf(name) > -1) && pd.type === type) {
                return pd;
            }
        };
        return null;
    }

    putParamset(ps) {
        //TODO
    }

    temperatureChanged(id, value) {
        logger.debug('temperatureChanged(%s,%s)', id, value);
        this.temperature1 = value;
        let channel = this.deviceName+':'+id;
        this.server.broadcastEvent(channel, 'TEMPERATURE', value);
        console.log('Sending broadcast TEMPERATURE=%s to %s', value, channel);
    }

    humidityChanged(id, value) {
        logger.debug('humidityChanged(%s,%s)', id, value);
        this.humidity1 = value;
        let channel = this.deviceName+':'+id;
        this.server.broadcastEvent(channel, 'HUMIDITY', value);
        console.log('Sending broadcast HUMIDITY=%s to %s', value, channel);
    }

}