const Logger = require('logplease');
const logger = Logger.create('SimulatePlugin');
import { PluginInterface } from "./PluginInterface";
import { HMLCSW1 } from "../devices/HMLCSW1";
import { HMSECSC2 } from "../devices/HMSECSC2";
import { HMSECMDIR2 } from "../devices/HMSECMDIR2";
import { HMRC42 } from "../devices/HMRC42";
import { HMLCBL1FM } from "../devices/HMLCBL1FM";
import { HMWDS40THI } from "../devices/HMWDS40THI";
import { HMCCTC } from "../devices/HMCCTC";

export class SimulatePlugin implements PluginInterface {

    name: String = 'SimulatePlugin';
    devices = [];
    type: String;
    count: number;

    init(p) {
        logger.debug('init(%s)', JSON.stringify(p));


        this.type = p.pluginParams.type;
        this.count = p.pluginParams.count;

        for(let i=0; i<this.count; i++) {
            if(this.type=='HMCCTC') {
                this.devices.push(new HMCCTC(p.deviceName+"_"+i));
            }
        }

        logger.info('Plugin %s initialized.', this.name);

        return this.devices;
    }

}