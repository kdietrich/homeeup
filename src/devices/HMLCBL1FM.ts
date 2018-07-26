const Logger = require('logplease');
const logger = Logger.create('HMLCBL1FM');
var fs = require('fs');
var path = require('path');
const EventEmitter = require('events');

export class HMLCBL1FM {

    templatePath: String = 'HM-LC-Bl1-FM.json';
    deviceName: String;
    events = new EventEmitter();
    template;
    plugin;
    server;
    level1 = 0;
    stop1 = 2;

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
        file = file.replace(/%LEVEL1%/g, this.level1);
        file = file.replace(/%STOP1%/g, this.stop1);
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
        logger.debug('putParamset(%s)', ps);
        let that = this;
        for(let key in ps[2]) {
            if(ps[2].hasOwnProperty(key)) {
                if(key=='LEVEL') {
                    this.level1 = ps[2][key];
                    logger.info('Property LEVEL of device %s set to %s.', ps[0], ps[2][key]);
                    this.server.broadcastEvent(ps[0], key, ps[2][key]);
                    this.server.broadcastEvent(ps[0], 'WORKING', false);
                    this.events.emit('onLevelChanged', that);
                }
                else if(key=='STOP') {
                    this.stop1 = ps[2][key];
                    logger.info('Property STOP of device %s set to %s.', ps[0], ps[2][key]);
                    this.events.emit('onStatusChanged', that);
                }
            }
        }
    }

    levelChanged(id, value) {
        logger.debug('levelChanged(%s,%s)', id, value);
        this.level1 = value;
        let channel = this.deviceName+':'+id;
        logger.info('Property LEVEL of device %s set to %s.', channel, value);
        this.server.broadcastEvent(channel, 'LEVEL', value);
        this.server.broadcastEvent(channel, 'WORKING', false);
    }

    stopChanged(id, value) {
        logger.debug('stopChanged(%s,%s)', id, value);
        this.stop1 = value;
        let channel = this.deviceName+':'+id;
        logger.info('Property STOP of device %s set to %s.', channel, value);
    }

}