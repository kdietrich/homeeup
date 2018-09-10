"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('HMWDS40THI');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events');
var HMWDS40THI = /** @class */ (function () {
    function HMWDS40THI(deviceName) {
        this.templatePath = 'HM-WDS40-TH-I.json';
        this.events = new EventEmitter();
        this.temperature1 = 29;
        this.humidity1 = 53;
        this.deviceName = deviceName;
    }
    HMWDS40THI.prototype.init = function (pluginParams, plugin, server) {
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
    };
    HMWDS40THI.prototype.getChannels = function () {
        return this.template.channels;
    };
    HMWDS40THI.prototype.getParamset = function (name, type) {
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
    HMWDS40THI.prototype.getParamsetDescription = function (name, type) {
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
    HMWDS40THI.prototype.putParamset = function (ps) {
        //TODO
    };
    HMWDS40THI.prototype.temperatureChanged = function (id, value) {
        logger.debug('temperatureChanged(%s,%s)', id, value);
        this.temperature1 = value;
        var channel = this.deviceName + ':' + id;
        this.server.broadcastEvent(channel, 'TEMPERATURE', value);
        console.log('Sending broadcast TEMPERATURE=%s to %s', value, channel);
    };
    HMWDS40THI.prototype.humidityChanged = function (id, value) {
        logger.debug('humidityChanged(%s,%s)', id, value);
        this.humidity1 = value;
        var channel = this.deviceName + ':' + id;
        this.server.broadcastEvent(channel, 'HUMIDITY', value);
        console.log('Sending broadcast HUMIDITY=%s to %s', value, channel);
    };
    return HMWDS40THI;
}());
exports.HMWDS40THI = HMWDS40THI;
