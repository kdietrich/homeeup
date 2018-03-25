"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('SimpleHTTPPlugin');
var HMLCSW1_1 = require("../devices/HMLCSW1");
var http = require('http');
var SimpleHTTPPlugin = /** @class */ (function () {
    function SimpleHTTPPlugin() {
        this.name = 'SimpleHTTPPlugin';
        this.devices = [];
    }
    SimpleHTTPPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.onUrl = p.pluginParams.onUrl;
        this.offUrl = p.pluginParams.offUrl;
        var device = new HMLCSW1_1.HMLCSW1(p.deviceName);
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    SimpleHTTPPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Making http call to: %s', this.onUrl);
        http.get(this.onUrl, function (resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function (err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    };
    SimpleHTTPPlugin.prototype.onTurnOff = function (device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Making http call to: %s', this.offUrl);
        http.get(this.offUrl, function (resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function (err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    };
    return SimpleHTTPPlugin;
}());
exports.SimpleHTTPPlugin = SimpleHTTPPlugin;
