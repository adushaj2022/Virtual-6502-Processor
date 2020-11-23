import { hardware } from "./hardware";
import { priority } from "./Priority";
import { ClockListener } from "./imp/ClockListener";
import { Interrupt } from "./imp/Interrupt";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { Cpu } from "./Cpu";
import PriorityQueue from 'javascript-priority-queue';


export class InterruptController extends hardware implements ClockListener {

    private interruptReport : Interrupt[] = new Array<Interrupt>();
    private interruptDevices : Interrupt[] = new Array<Interrupt>();
    public keyboard : VirtualKeyboard;
    private cpu: Cpu;
    constructor(cpu : Cpu){
        super(0, "IRC");   
        this.cpu = cpu;
        this.interruptDevices.push(this.keyboard);
    }


    public addDevice(interruptDevice : Interrupt) : void {
        this.interruptDevices.push(interruptDevice);
    }

    public removeDevice(interruptDevice : Interrupt) : void {
        const index = this.interruptDevices.indexOf(interruptDevice);
        if (index > -1) {
            this.interruptDevices.splice(index, 1);
        }
    }

    public acceptInterrupt(keyboard : VirtualKeyboard) : void {
        this.keyboard = keyboard
        this.interruptReport.push(keyboard);
        this.cpu.setInterrupt(keyboard);
    }
    
    public pulse() : void {
        if(typeof this.keyboard !== 'undefined')
        {
            this.log("recieved clock pulse | Max Heap Size -> " + this.keyboard.input_buffer.size());
        }
    }
}