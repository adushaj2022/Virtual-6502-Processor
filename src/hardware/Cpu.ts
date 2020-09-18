import {System} from "../System";
import { Clock } from "./Clock";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";

export class Cpu extends hardware implements ClockListener {
    
    public  cpuClockCount : number = 0;

    constructor(idNumber: number, name: String) {
       super(idNumber, name);
       this.startSystem();
    }

    public pulse(): void {
        this.cpuClockCount++;
        this.log("recieved clock pulse - CPU Clock Count: " + this.cpuClockCount);
    }

    public log(message: String){
        return super.log(message);
    }

    public startSystem(): boolean {
        return super.startSystem();
    }

    public stopSystem(): boolean {
        return super.stopSystem();
    }


}
