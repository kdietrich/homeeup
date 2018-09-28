"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('HMCCTC');
var fs = require('fs');
var path = require('path');
var EventEmitter = require('events');
var HMCCTC = /** @class */ (function () {
    function HMCCTC(deviceName) {
        this.templatePath = 'HM-CC-TC.json';
        this.events = new EventEmitter();
        this.setpoint1 = 0;
        this.deviceName = deviceName;
    }
    HMCCTC.prototype.init = function (pluginParams, plugin, server) {
        //logger.debug('init(%s,%s,%s)', JSON.stringify(pluginParams), JSON.stringify(JSON.decycle(plugin)),  JSON.stringify(server));
        // can't sringify circulat structures
        logger.debug('init(%s,%s)', JSON.stringify(pluginParams), JSON.stringify(server));
        this.plugin = plugin;
        this.server = server;
        var jsonPath = path.join(path.dirname(fs.realpathSync(__filename)), '../../src/devices/');
        var file = fs.readFileSync(jsonPath + this.templatePath, 'latin1');
        file = file.replace(/%ADDRESS%/g, this.deviceName);
        file = file.replace(/"%SETPOINT1%"/g, this.setpoint1);
        this.template = JSON.parse(file);
        logger.info('Device %s of plugin %s initialized.', this.deviceName, this.plugin.name);
    };
    HMCCTC.prototype.getChannels = function () {
        return this.template.channels;
    };
    HMCCTC.prototype.getParamset = function (name, type) {
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
    HMCCTC.prototype.getParamsetDescription = function (name, type) {
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
    HMCCTC.prototype.putParamset = function (ps) {
        logger.debug('putParamset(%s)', ps);
        var that = this;
        for (var key in ps[2]) {
            if (ps[2].hasOwnProperty(key)) {
                if (key == 'SETPOINT') {
                    this.setpoint1 = ps[2][key];
                    logger.info('Property SETPOINT of device %s set to %s.', ps[0], ps[2][key]);
                    this.server.broadcastEvent(ps[0], key, ps[2][key]);
                    this.server.broadcastEvent(ps[0], 'WORKING', false);
                    this.events.emit('onSetpointChanged', that);
                }
            }
        }
    };
    return HMCCTC;
}());
exports.HMCCTC = HMCCTC;
