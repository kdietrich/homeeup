const Logger = require('logplease');
const logger = Logger.create('AqaraPlugin');
import { PluginInterface } from "./PluginInterface";
import { HMWDS40THI } from "../devices/HMWDS40THI";
const Aqara = require('lumi-aqara');

export class AqaraPlugin implements PluginInterface {

    name: String = 'AqaraPlugin';
    devices = [];
    sensors;

    init(p) {
        logger.debug('init(%s)', JSON.stringify(p));
        this.sensors = p.pluginParams.sensors;

        for(let i=0; i<this.sensors.length; i++) {
            let sensor = this.sensors[i];
            this.devices.push(new HMWDS40THI(p.deviceName+sensor));
        }

        var that = this;
        const aqara = new Aqara();
        aqara.on('gateway', (gateway) => {
            logger.debug('Aqara gateway discovered.');
            gateway.on('ready', () => {
                logger.debug('Aqara gateway is ready.');
            });
            gateway.on('offline', () => {
                gateway = null;
                logger.error('Aqara gateway is offline.');
            });
            gateway.on('subdevice', (d) => {
                if(that.sensors.includes(d.getSid())) {
                    d.on('update', () => {
                        let device:HMWDS40THI = that.devices.filter(dev => dev.deviceName == p.deviceName+d.getSid())[0];
                        logger.info('Temperature of %s changed to %s.', p.deviceName+d.getSid(), d.getTemperature());
                        device.temperatureChanged(1, d.getTemperature());
                        logger.info('Humidity of %s changed to %s.', p.deviceName+d.getSid(), d.getHumidity());
                        device.humidityChanged(1, d.getHumidity());
                    });
                }
            });
        });

        logger.info('Plugin %s initialized.', this.name);

        return this.devices;
    }

}