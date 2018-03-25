const Logger = require('logplease');
const logger = Logger.create('SimpleHTTPPlugin');
import { PluginInterface } from "./PluginInterface";
import { HMLCSW1 } from "../devices/HMLCSW1";
const http = require('http');

export class SimpleHTTPPlugin implements PluginInterface {

    name: String = 'SimpleHTTPPlugin';
    devices = [];
    onUrl: String;
    offUrl: String;

    init(p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.onUrl = p.pluginParams.onUrl;
        this.offUrl = p.pluginParams.offUrl;

        let device = new HMLCSW1();
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);

        logger.info('Plugin %s initialized.', this.name);

        return this.devices;
    }

    onTurnOn(device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Making http call to: %s', this.onUrl);

        http.get(this.onUrl, function(resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function(err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    }

    onTurnOff(device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Making http call to: %s', this.offUrl);

        http.get(this.offUrl, function(resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function(err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    }

}