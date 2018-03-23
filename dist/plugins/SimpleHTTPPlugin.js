"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('SimpleHTTPPlugin');
var http = require('http');
var SimpleHTTPPlugin = /** @class */ (function () {
    function SimpleHTTPPlugin() {
        this.name = 'SimpleHTTPPlugin';
        this.deviceType = 'HMLCSW1';
    }
    SimpleHTTPPlugin.prototype.init = function (p, device) {
        logger.debug('init(%s,%s)', JSON.stringify(p), JSON.stringify(device));
        this.device = device;
        this.onUrl = p.pluginParams.onUrl;
        this.offUrl = p.pluginParams.offUrl;
        logger.info('Plugin %s initialized.', this.name);
    };
    SimpleHTTPPlugin.prototype.onTurnOn = function () {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', this.device.deviceName);
        logger.info('Making http call to: %s', this.onUrl);
        http.get(this.onUrl, function (resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function (err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    };
    SimpleHTTPPlugin.prototype.onTurnOff = function () {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', this.device.deviceName);
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
