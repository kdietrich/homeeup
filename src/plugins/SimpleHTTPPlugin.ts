const Logger = require('logplease');
const logger = Logger.create('SimpleHTTPPlugin');
import { PluginInterface } from "./PluginInterface";
const http = require('http');

export class SimpleHTTPPlugin implements PluginInterface {

    name: String = 'SimpleHTTPPlugin';
    deviceType: String = 'HMLCSW1';
    device;
    onUrl: String;
    offUrl: String;

    init(p, device) {
        logger.debug('init(%s,%s)', JSON.stringify(p), JSON.stringify(device));
        this.device = device;
        this.onUrl = p.pluginParams.onUrl;
        this.offUrl = p.pluginParams.offUrl;

        logger.info('Plugin %s initialized.', this.name);
    }

    onTurnOn() {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', this.device.deviceName);
        logger.info('Making http call to: %s', this.onUrl);

        http.get(this.onUrl, function(resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function(err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    }

    onTurnOff() {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', this.device.deviceName);
        logger.info('Making http call to: %s', this.offUrl);

        http.get(this.offUrl, function(resp) {
            logger.info('Http call finished successfully.');
        }).on("error", function(err) {
            logger.error('Http call faiiled with error %s.', err);
        });
    }

}