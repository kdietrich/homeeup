const Logger = require('logplease');
const logger = Logger.create('FritzBoxPlugin');
import { PluginInterface } from "./PluginInterface";
const Fritz = require('fritzapi').Fritz;

export class FritzBoxPlugin implements PluginInterface {

    name: String = 'FritzBoxPlugin';
    deviceType: String = 'HMLCSW1';
    device;
    ipAddress: String;
    user: String;
    password: String;
    fritzBox;

    init(p, device) {
        logger.debug('init(%s,%s)', JSON.stringify(p), JSON.stringify(device));
        this.device = device;
        this.ipAddress = p.pluginParams.ipAddress;
        this.user = p.pluginParams.user;
        this.password = p.pluginParams.password;

        this.fritzBox = new Fritz(this.user, this.password, this.ipAddress);

        var that = this;
        setInterval(function() {
            that._checkStatus(false);
        }, 10000);
        that._checkStatus(true);

        logger.info('Plugin %s initialized.', this.name);
    }

    onTurnOn() {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', this.device.deviceName);
        logger.info('Switching guest wifi on.');

        this.fritzBox.setGuestWlan(true).then(function(res) {
            logger.info('Guest wifi activated.');
        });
    }

    onTurnOff() {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', this.device.deviceName);
        logger.info('Switching guest wifi off.');

        this.fritzBox.setGuestWlan(false).then(function(res) {
            logger.info('Guest wifi deactivated.');
        });
    }

    _checkStatus(forceRefresh) {
        logger.debug('_checkStatus(%s)', forceRefresh);
        var that = this;
        logger.info('Checking status of %s.', that.device.deviceName);

        this.fritzBox.getGuestWlan().then(function(res) {
            if(res.activate_guest_access !== that.device.state1 || forceRefresh) {
                logger.info('Status of %s changed to %s.', that.device.deviceName, res.activate_guest_access);
                that.device.stateChanged(1, res.activate_guest_access);
            }
            else {
                logger.info('Status of %s has not changed.', that.device.deviceName);
            }
        });
    }

}