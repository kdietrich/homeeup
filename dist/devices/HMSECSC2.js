"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('HMSECSC2');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events');
var HMSECSC2 = /** @class */ (function () {
    function HMSECSC2(deviceName) {
        this.templatePath = 'HM-Sec-SC-2.json';
        this.events = new EventEmitter();
        this.state1 = false;
        this.deviceName = deviceName;
    }
    HMSECSC2.prototype.init = function (pluginParams, plugin, server) {
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
    };
    HMSECSC2.prototype.getChannels = function () {
        return this.template.channels;
    };
    HMSECSC2.prototype.getParamset = function (name, type) {
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
    HMSECSC2.prototype.getParamsetDescription = function (name, type) {
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
    HMSECSC2.prototype.putParamset = function (ps) {
        //TODO
    };
    HMSECSC2.prototype.stateChanged = function (id, value) {
        logger.debug('stateChanged(%s,%s)', id, value);
        this.state1 = value;
        var channel = this.deviceName + ':' + id;
        this.server.broadcastEvent(channel, 'STATE', value);
        console.log('Sending broadcast STATE=%s to %s', value, channel);
    };
    return HMSECSC2;
}());
exports.HMSECSC2 = HMSECSC2;
