import {System} from "../System";
import { Clock } from "./Clock";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";

export class Cpu extends hardware implements ClockListener {
    
    public cpuClockCount : number = 0;

    constructor(idNumber: number, name: String) {
       super(idNumber, name);
    }

    //increment count each time and print its pulse
    public pulse(): void {
        this.cpuClockCount++;
        this.log("recieved clock pulse - CPU Clock Count: " + this.cpuClockCount);
    }

    public log(message: String){
        return super.log(message);
    }

}
