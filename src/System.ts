// import statements for hardware
import {Cpu} from "./hardware/Cpu";
import {hardware} from "./hardware/hardware";
import { Memory } from "./hardware/Memory";
import { Clock } from "./hardware/Clock";

import { VirtualKeyboard } from "./hardware/VirtualKeyboard";
import { InterruptController } from "./hardware/InterruptController";
import { Mmu } from "./hardware/Mmu";


// Initialization Parameters for Hardware
// Clock cycle interval

const CLOCK_INTERVAL = 100;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.


export class System extends hardware {
    
    constructor(idNumber: number, name: String) {

        super(idNumber, name);
        
        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();
    }

    public startSystem(): boolean {
        //---------Memory-----------------
        let mmu: Mmu = new Mmu();
        let mem: Memory = new Memory();

        //---------CPU-----------------
        let cpu: Cpu = new Cpu(mmu);
        cpu.log("Created");

        //---------interrupt controller----------
        let ic = new InterruptController(cpu);
        //-----------Virtual Keyboard------------
        let vkb = new VirtualKeyboard(ic);

        //-----------Clock-----------------------
        let clk : Clock = new Clock();
        clk.log("Created");
        clk.addToListener(cpu);
        clk.addToListener(mem);
        clk.addToListener(ic);

        clk.process_pulse(CLOCK_INTERVAL); //begin the clock
        
        return true;
    }

    public stopSystem(): boolean {
        return false;
    }

    public log(message: String){
        return super.log(message);
    }

}

let system: System = new System(0, "System");






