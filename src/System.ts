// import statements for hardware
import {Cpu} from "./hardware/Cpu";
import {hardware} from "./hardware/hardware";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";



/*
    Constants
*/

// Initialization Parameters for Hardware
// Clock cycle interval

const CLOCK_INTERVAL= 500;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.


export class System extends hardware {
    
    public running: boolean = false;

    constructor(idNumber: number, name: String) {

        super(idNumber, name);
        
        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();
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

let system: System = new System(0, "System");
let clk : Clock = new Clock(0, "Clock");
let cpu: Cpu = new Cpu(0, "CPU");
let mem: Memory = new Memory(0, "RAM");

cpu.log(" Complete");
mem.log(" Complete");
clk.log(" Complete");

clk.process_pulse(CLOCK_INTERVAL);
(mem.displayMemory(0x100000));

