const Logger = require('logplease');
const logger = Logger.create('SimpleCMDPlugin');
import { PluginInterface } from "./PluginInterface";
const { exec } = require('child_process');

export class SimpleCMDPlugin implements PluginInterface {

    name: String = 'SimpleCMDPlugin';
    deviceType: String = 'HMLCSW1';
    device;
    onCmd: String;
    offCmd: String;
    statusCmd: String;
    checkInterval: number;

    init(p, device) {
        logger.debug('init(%s,%s)', JSON.stringify(p), JSON.stringify(device));
        this.device = device;
        this.onCmd = p.pluginParams.onCmd;
        this.offCmd = p.pluginParams.offCmd;
        this.statusCmd = p.pluginParams.statusCmd;
        this.checkInterval = p.pluginParams.checkInterval;

        var that = this;
        setInterval(function() {
            that._checkStatus(false);
        }, that.checkInterval);
        that._checkStatus(true);

        logger.info('Plugin %s initialized.', this.name);
    }

    onTurnOn() {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', this.device.deviceName);
        logger.info('Executing onCmd.');
        exec(this.onCmd, function(err, stdout, stderr) {
            if(err) {
                logger.error('onCmd failed with error %s', err);
                return;
            }
            logger.info('onCmd executed successfully.');
        });
    }

    onTurnOff() {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', this.device.deviceName);
        logger.info('Executing offCmd.');
        exec(this.offCmd, function(err, stdout, stderr) {
            if(err) {
                logger.error('offCmd failed with error %s', err);
                return;
            }
            logger.info('offCmd executed successfully.');
        });
    }

    _checkStatus(forceRefresh) {
        logger.debug('_checkStatus(%s)', forceRefresh);
        var that = this;
        logger.info('Checking status of %s.', that.device.deviceName);
        exec(that.statusCmd, function(err, stdout, stderr) {
            if(err) {
                logger.error('statusCmd failed with error %s', err);
                return;
            }
            let val = stdout==='0\n';
            if(val !== that.device.state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', that.device.deviceName, val);
                that.device.stateChanged(1, val);
            }
            else {
                logger.info('Status of %s has not changed.', that.device.deviceName);
            }
        });
    }

}