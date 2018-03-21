"use strict";
var Logger = require('logplease');
var logger = Logger.create('SimpleCMDPlugin');
var exec = require('child_process').exec;
var SimpleCMDPlugin = (function () {
    function SimpleCMDPlugin() {
        this.name = 'SimpleCMDPlugin';
        this.deviceType = 'HMLCSW1';
    }
    SimpleCMDPlugin.prototype.init = function (p, device) {
        logger.debug('init(%s,%s)', JSON.stringify(p), JSON.stringify(device));
        this.device = device;
        this.onCmd = p.pluginParams.onCmd;
        this.offCmd = p.pluginParams.offCmd;
        this.statusCmd = p.pluginParams.statusCmd;
        this.checkInterval = p.pluginParams.checkInterval;
        var that = this;
        setInterval(function () {
            that._checkStatus(false);
        }, that.checkInterval);
        that._checkStatus(true);
        logger.info('Plugin %s initialized.', this.name);
    };
    SimpleCMDPlugin.prototype.onTurnOn = function () {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', this.device.deviceName);
        logger.info('Executing onCmd.');
        exec(this.onCmd, function (err, stdout, stderr) {
            if (err) {
                logger.error('onCmd failed with error %s', err);
                return;
            }
            logger.info('onCmd executed successfully.');
        });
    };
    SimpleCMDPlugin.prototype.onTurnOff = function () {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', this.device.deviceName);
        logger.info('Executing offCmd.');
        exec(this.offCmd, function (err, stdout, stderr) {
            if (err) {
                logger.error('offCmd failed with error %s', err);
                return;
            }
            logger.info('offCmd executed successfully.');
        });
    };
    SimpleCMDPlugin.prototype._checkStatus = function (forceRefresh) {
        logger.debug('_checkStatus(%s)', forceRefresh);
        var that = this;
        logger.info('Checking status of %s.', that.device.deviceName);
        exec(that.statusCmd, function (err, stdout, stderr) {
            if (err) {
                logger.error('statusCmd failed with error %s', err);
                return;
            }
            var val = stdout === '0\n';
            if (val !== that.device.state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', that.device.deviceName, val);
                that.device.stateChanged(1, val);
            }
            else {
                logger.info('Status of %s has not changed.', that.device.deviceName);
            }
        });
    };
    return SimpleCMDPlugin;
}());
exports.SimpleCMDPlugin = SimpleCMDPlugin;
