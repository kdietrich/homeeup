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
        this.checkIntervalPaused = false;
    }
    SimpleCMDPlugin.prototype.init = function (p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.onCmd = p.pluginParams.onCmd;
        this.offCmd = p.pluginParams.offCmd;
        this.statusCmd = p.pluginParams.statusCmd;
        this.checkInterval = p.pluginParams.checkInterval;
        this.pauseCheckIntervalAfterSwitch = p.pluginParams.pauseCheckIntervalAfterSwitch;
        var device = new HMLCSW1_1.HMLCSW1(p.deviceName);
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);
        if (this.statusCmd) {
            var that = this;
            setInterval(function () {
                if (!that.checkIntervalPaused)
                    that._checkStatus(device, false);
                else
                    logger.info('Checking status is paused.', that.name);
            }, that.checkInterval);
            that._checkStatus(device, true);
        }
        logger.info('Plugin %s initialized.', this.name);
        return this.devices;
    };
    SimpleCMDPlugin.prototype.onTurnOn = function (device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Executing onCmd.');
        var that = this;
        that._pauseCheckStatus();
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
        var that = this;
        that._pauseCheckStatus();
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
            if (that.checkIntervalPaused)
                return;
            if (err) {
                logger.error('statusCmd failed with error %s', err);
                return;
            }
            var val = stdout === '0\n';
            if (val !== device.state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', device.deviceName, val);
                if (!forceRefresh)
                    that._pauseCheckStatus();
                device.stateChanged(1, val);
            }
            else {
                logger.info('Status of %s has not changed.', device.deviceName);
            }
        });
    };
    SimpleCMDPlugin.prototype._pauseCheckStatus = function () {
        var that = this;
        if (!that.pauseCheckIntervalAfterSwitch || that.checkIntervalPaused)
            return;
        that.checkIntervalPaused = true;
        setTimeout(function () {
            that.checkIntervalPaused = false;
        }, that.pauseCheckIntervalAfterSwitch);
    };
    return SimpleCMDPlugin;
}());
exports.SimpleCMDPlugin = SimpleCMDPlugin;
