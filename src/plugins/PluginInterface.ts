
export interface PluginInterface {

    name: String;
    //deviceType: String;
    //device;

    init(initParams) : any[];

    //onTurnOn() : void;
    //onTurnOff() : void;
}