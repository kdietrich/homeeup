"use strict";
var Logger = require('logplease');
var logger = Logger.create('HMLCSW1');
var fs = require('fs');
var HMLCSW1 = (function () {
    function HMLCSW1() {
        this.templatePath = 'HM-LC-SW1.json';
        this.state1 = false;
    }
    HMLCSW1.prototype.init = function (pluginParams, plugin, server) {
        logger.debug('init(%s,%s,%s)', JSON.stringify(pluginParams), JSON.stringify(plugin), JSON.stringify(server));
        this.deviceName = pluginParams.deviceName;
        this.plugin = plugin;
        this.server = server;
        var file = fs.readFileSync('src/devices/' + this.templatePath, 'utf8');
        file = file.replace(/%ADDRESS%/g, this.deviceName);
        file = file.replace(/%STATE1%/g, this.state1);
        this.template = JSON.parse(file);
        logger.info('Device %s of plugin %s initialized.', this.deviceName, this.plugin.name);
    };
    HMLCSW1.prototype.getChannels = function () {
        return this.template.channels;
    };
    HMLCSW1.prototype.getParamset = function (name, type) {
        logger.debug('getParamset(%s,%s)', name, type);
        for (var i = 0; i < this.template.paramsets.length; i++) {
            var p = this.template.paramsets[i];
            if ((p.name.indexOf(name) > -1) && p.type === type) {
                return p;
            }
        }
        ;
        return null;
    };
    HMLCSW1.prototype.getParamsetDescription = function (name, type) {
        logger.debug('getParamsetDescription(%s,%s)', name, type);
        for (var i = 0; i < this.template.paramsetDescriptions.length; i++) {
            var pd = this.template.paramsetDescriptions[i];
            if ((pd.name.indexOf(name) > -1) && pd.type === type) {
                return pd;
            }
        }
        ;
        return null;
    };
    HMLCSW1.prototype.putParamset = function (ps) {
        logger.debug('putParamset(%s)', ps);
        for (var key in ps[2]) {
            if (ps[2].hasOwnProperty(key)) {
                if (key == 'STATE') {
                    this.state1 = ps[2][key];
                    logger.info('Property STATE of device %s set to %s.', ps[0], ps[2][key]);
                    this.server.broadcastEvent(ps[0], key, ps[2][key]);
                    this.server.broadcastEvent(ps[0], 'WORKING', false);
                    if (ps[2][key] === true)
                        this.plugin.onTurnOn();
                    else
                        this.plugin.onTurnOff();
                }
            }
        }
    };
    HMLCSW1.prototype.stateChanged = function (id, value) {
        logger.debug('stateChanged(%s,%s)', id, value);
        this.state1 = value;
        var channel = this.deviceName + ':' + id;
        logger.info('Property STATE of device %s set to %s.', channel, value);
        this.server.broadcastEvent(channel, 'STATE', value);
        this.server.broadcastEvent(channel, 'WORKING', false);
    };
    return HMLCSW1;
}());
exports.HMLCSW1 = HMLCSW1;
