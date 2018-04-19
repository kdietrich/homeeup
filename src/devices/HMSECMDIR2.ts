const Logger = require('logplease');
const logger = Logger.create('HMSECMDIR2');
var fs = require('fs');
var path = require('path');
const EventEmitter = require('events');

export class HMSECMDIR2 {

    templatePath: String = 'HM-Sec-MDIR-2.json';
    deviceName: String;
    events = new EventEmitter();
    template;
    plugin;
    server;
    state1 = false;

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
        var file = fs.readFileSync(jsonPath + this.templatePath, 'utf8');
        file = file.replace(/%ADDRESS%/g, this.deviceName);
        file = file.replace(/%STATE1%/g, this.state1);
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

    stateChanged(id, value) {
        logger.debug('stateChanged(%s,%s)', id, value);
        let channel = this.deviceName+':'+id;
        this.server.broadcastEvent(channel, 'MOTION', value);
        console.log('Sending broadcast MOTION=%s to %s', value, channel);
    }

}