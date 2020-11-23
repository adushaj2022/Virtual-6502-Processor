import { Cpu } from "./Hardware/Cpu";
import { Hardware } from "./hardware/Hardware";
import { Memory } from "./Hardware/Memory";
import { Clock } from "./Hardware/Clock";

import { VirtualKeyboard } from "./Hardware/VirtualKeyboard";
import { InterruptController } from "./Hardware/InterruptController";
import { MemoryManagementUnit } from "./hardware/MemoryManagementUnit";


// Initialization Parameters for Hardware
// Clock cycle interval

const CLOCK_INTERVAL = 100;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.


export class System extends Hardware {
    
    constructor(idNumber: number, name: String) {

        super(idNumber, name);
        
        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing Hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();
    }

    public startSystem(): boolean {
        //---------Memory-----------------
        
        let mem: Memory = new Memory();
        let mmu: MemoryManagementUnit = new MemoryManagementUnit(mem);
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

}

let system: System = new System(0, "System");






