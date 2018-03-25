"use strict";
exports.__esModule = true;
var Logger = require('logplease');
var logger = Logger.create('SimpleCMDPlugin');
var HMLCSW1_1 = require("../devices/HMLCSW1");
var exec = require('child_process').exec;
var SimpleCMDPlugin = /** @class */ (function () {
    function SimpleCMDPlugin() {
        this.name = 'SimpleCMDPlugin';
        this.devices = [];
    }
    SimpleCMDPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.onCmd = p.pluginParams.onCmd;
        this.offCmd = p.pluginParams.offCmd;
        this.statusCmd = p.pluginParams.statusCmd;
        this.checkInterval = p.pluginParams.checkInterval;
        var device = new HMLCSW1_1.HMLCSW1();
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        var that = this;
        setInterval(function () {
            that._checkStatus(device, false);
        }, that.checkInterval);
        that._checkStatus(device, true);
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    SimpleCMDPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Executing onCmd.');
        exec(this.onCmd, function (err, stdout, stderr) {
            if (err) {
                logger.error('onCmd failed with error %s', err);
                return;
            }
            logger.info('onCmd executed successfully.');
        });
    };
    SimpleCMDPlugin.prototype.onTurnOff = function (device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Executing offCmd.');
        exec(this.offCmd, function (err, stdout, stderr) {
            if (err) {
                logger.error('offCmd failed with error %s', err);
                return;
            }
            logger.info('offCmd executed successfully.');
        });
    };
    SimpleCMDPlugin.prototype._checkStatus = function (device, forceRefresh) {
        logger.debug('_checkStatus(%s)', forceRefresh);
        var that = this;
        logger.info('Checking status of %s.', device.deviceName);
        exec(that.statusCmd, function (err, stdout, stderr) {
            if (err) {
                logger.error('statusCmd failed with error %s', err);
                return;
            }
            var val = stdout === '0\n';
            if (val !== device.state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', device.deviceName, val);
                device.stateChanged(1, val);
            }
            else {
                logger.info('Status of %s has not changed.', device.deviceName);
            }
        });
    };
    return SimpleCMDPlugin;
}());
exports.SimpleCMDPlugin = SimpleCMDPlugin;
