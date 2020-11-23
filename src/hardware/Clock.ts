
import { Cpu } from "./Cpu";
import { hardware } from "./hardware"
import { ClockListener } from "./imp/ClockListener";
import { Memory } from "./Memory";


export class Clock extends hardware{

    private list: Array<ClockListener> = [];
    
    constructor() {
        super(0, "CLK");
    }


    public process_pulse(interval: number): void {
        
        const timer = setInterval(() => {
            this.log("Clock Pulse Initialized");
            //loop through each listener and call its pulse method
            for(let j = 0; j < this.list.length; j++){
                this.list[j].pulse();
            }
            
            if (this.getStatus() === false) {            //to stop the clock we will put a global BOOLEAN here , that
                                                //the cpu will set to false
                clearInterval(timer);
            }
        }, interval);
    }

    //method to add new listener
    public addToListener(obj: ClockListener): void{
        this.list.push(obj);
    }

    //method to remove new listener
    public removeSpecificListener(obj: ClockListener): void{
        const index = this.list.indexOf(obj);
        if (index > -1) {
            this.list.splice(index, 1);
        }
    }
    //method to remove all listeners
    public removeAllListeners(): void{
        while(this.list.length > 0) {
            this.list.pop();
        }        
    }

    
    public log(message: String){
        return super.log(message);
    }

}