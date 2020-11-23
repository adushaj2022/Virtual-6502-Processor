import { Hardware } from "./Hardware";
import { ClockListener } from "./imp/ClockListener";
import { Interrupt } from "./imp/Interrupt";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { Cpu } from "./Cpu";


export class InterruptController extends Hardware implements ClockListener {

    private interruptReport : Interrupt[] = new Array<Interrupt>();
    private interruptDevices : Interrupt[] = new Array<Interrupt>();
    public keyboard : VirtualKeyboard;

    private cpu: Cpu;   //initialize CPU

    constructor(cpu : Cpu){
        super(0, "IRC");   
        this.cpu = cpu;
        this.interruptDevices.push(this.keyboard);
        this.interruptReport.push(this.keyboard);
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
        this.cpu.setInterrupt(this.keyboard);
    }
    
    public pulse() : void {
        if(typeof this.keyboard !== 'undefined')    //do this check to not get an error at first 
        {
            this.log("recieved clock pulse | Max Heap Size -> " + this.keyboard.output_buffer.size());
        }
    }

}