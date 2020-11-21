import { Cpu } from "./Cpu";
import { hardware } from "./hardware";
import { priority } from "./Priority";
import { ClockListener } from "./imp/ClockListener";
import { Interrupt } from "./imp/Interrupt";
import { VirtualKeyboard } from "./VirtualKeyboard";


export class InterruptController extends hardware implements ClockListener {

    private interruptReport : Interrupt[] = new Array<Interrupt>();
    private interruptDevices : Interrupt[] = new Array<Interrupt>();
    private keyboard : VirtualKeyboard;
    constructor(cpu : Cpu){
        super(0, "InterruptController");   
        this.interruptDevices.push(this.keyboard);
    }

    private cpu : Cpu;

    public addDevice(interruptDevice : Interrupt) : void {
        this.interruptDevices.push(interruptDevice);
    }

    public removeDevice(interruptDevice : Interrupt) : void {
        const index = this.interruptDevices.indexOf(interruptDevice);
        if (index > -1) {
            this.interruptDevices.splice(index, 1);
        }
    }


    public acceptInterrupt(keyboard : VirtualKeyboard): any {
        this.interruptReport.push(keyboard);

        this.keyboard = keyboard;


        let maxHeap = this.keyboard.input_buffer;
        console.log(maxHeap.toString())
        let heapify;
        if(maxHeap.size() > 0){
            heapify = maxHeap.dequeue();
        } else {
            heapify = -1;
        }
    
        return heapify;
    }
    
    public pulse() : void {
        let s = this.acceptInterrupt(this.keyboard);
        //this.cpu.givePoll(s, this, input_buffer);
    }
}