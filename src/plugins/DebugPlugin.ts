const Logger = require('logplease');
const logger = Logger.create('DebugPlugin');
import { PluginInterface } from "./PluginInterface";
import { HMLCSW1 } from "../devices/HMLCSW1";
import { HMSECSC2 } from "../devices/HMSECSC2";
import { HMSECMDIR2 } from "../devices/HMSECMDIR2";
import { HMRC42 } from "../devices/HMRC42";
import { HMLCBL1FM } from "../devices/HMLCBL1FM";
import { HMWDS40THI } from "../devices/HMWDS40THI";

export class DebugPlugin implements PluginInterface {

    name: String = 'DebugPlugin';
    devices = [];

    init(p) {
        logger.debug('init(%s)', JSON.stringify(p));

        let device = new HMLCSW1(p.deviceName+'Switch');
        device.events.on('onTurnOn', this.onTurnOn.bind(this));
        device.events.on('onTurnOff', this.onTurnOff.bind(this));
        this.devices.push(device);

        device = new HMSECSC2(p.deviceName+'DoorContact');
        this.devices.push(device);

        device = new HMSECMDIR2(p.deviceName+'MotionSensor');
        this.devices.push(device);

        this.devices.push(new HMRC42(p.deviceName+'Remote'));

        this.devices.push(new HMLCBL1FM(p.deviceName+'Blinds'));

        this.devices.push(new HMWDS40THI(p.deviceName+'TempHumid'));

        logger.info('Plugin %s initialized.', this.name);

        return this.devices;
    }

    onTurnOn(device) {
        logger.debug('onTurnOn()');
        logger.info('Device %s turned on.', device.deviceName);
        logger.info('Starting cleaning.');
    }

    onTurnOff(device) {
        logger.debug('onTurnOff()');
        logger.info('Device %s turned off.', device.deviceName);
        logger.info('Pausing cleaning and sending back to base.');
    }

}