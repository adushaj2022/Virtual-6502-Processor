import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";
import { Mmu } from "./Mmu";

export class Cpu extends hardware implements ClockListener {
    
    public cpuClockCount : number = 0;

    public mmu : Mmu = new Mmu(0, "MMU");   //this is how we access memory; through the MMU

    constructor(idNumber: number, name: String) {
       super(idNumber, name);
    }

    //increment count each time and print its pulse
    public pulse(): void {
        this.log("recieved clock pulse - CPU Clock Count: " + ++this.cpuClockCount);
    }

    public log(message: String) : void {
        return super.log(message);
    }

}
