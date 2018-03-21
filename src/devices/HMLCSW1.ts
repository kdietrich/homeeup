const Logger = require('logplease');
const logger = Logger.create('HMLCSW1');
var fs = require('fs');
var path = require('path')

export class HMLCSW1 {

    templatePath: String = 'HM-LC-SW1.json';
    deviceName: String;
    template;
    plugin;
    server;
    state1 = false;

    init(pluginParams, plugin, server) {
        logger.debug('init(%s,%s,%s)', JSON.stringify(pluginParams), JSON.stringify(plugin),  JSON.stringify(server));
        this.deviceName = pluginParams.deviceName;
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
        logger.debug('putParamset(%s)', ps);
        for(let key in ps[2]) {
            if(ps[2].hasOwnProperty(key)) {
                if(key=='STATE') {
                    this.state1 = ps[2][key];
                    logger.info('Property STATE of device %s set to %s.', ps[0], ps[2][key]);
                    this.server.broadcastEvent(ps[0], key, ps[2][key]);
                    this.server.broadcastEvent(ps[0], 'WORKING', false);
                    if(ps[2][key]===true)
                        this.plugin.onTurnOn();
                    else
                        this.plugin.onTurnOff();
                }
            }
        }
    }

    stateChanged(id, value) {
        logger.debug('stateChanged(%s,%s)', id, value);
        this.state1 = value;
        let channel = this.deviceName+':'+id;
        logger.info('Property STATE of device %s set to %s.', channel, value);
        this.server.broadcastEvent(channel, 'STATE', value);
        this.server.broadcastEvent(channel, 'WORKING', false);
    }

}