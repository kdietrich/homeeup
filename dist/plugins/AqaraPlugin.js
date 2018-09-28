"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('AqaraPlugin');
var HMWDS40THI_1 = require("../devices/HMWDS40THI");
var Aqara = require('lumi-aqara');
var AqaraPlugin = /** @class */ (function () {
    function AqaraPlugin() {
        this.name = 'AqaraPlugin';
        this.devices = [];
    }
    AqaraPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.sensors = p.pluginParams.sensors;
        for (var i = 0; i < this.sensors.length; i++) {
            var sensor = this.sensors[i];
            this.devices.push(new HMWDS40THI_1.HMWDS40THI(p.deviceName + sensor));
        }
        var that = this;
        var aqara = new Aqara();
        aqara.on('gateway', function (gateway) {
            logger.debug('Aqara gateway discovered.');
            gateway.on('ready', function () {
                logger.debug('Aqara gateway is ready.');
            });
            gateway.on('offline', function () {
                gateway = null;
                logger.error('Aqara gateway is offline.');
            });
            gateway.on('subdevice', function (d) {
                if (that.sensors.includes(d.getSid())) {
                    d.on('update', function () {
                        var device = that.devices.filter(function (dev) { return dev.deviceName == p.deviceName + d.getSid(); })[0];
                        logger.info('Temperature of %s changed to %s.', p.deviceName + d.getSid(), d.getTemperature());
                        device.temperatureChanged(1, d.getTemperature());
                        logger.info('Humidity of %s changed to %s.', p.deviceName + d.getSid(), d.getHumidity());
                        device.humidityChanged(1, d.getHumidity());
                    });
                }
            });
        });
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    return AqaraPlugin;
}());
exports.AqaraPlugin = AqaraPlugin;
