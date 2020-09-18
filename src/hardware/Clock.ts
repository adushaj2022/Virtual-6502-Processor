
import { Cpu } from "./Cpu";
import { hardware } from "./hardware"
import { ClockListener } from "./imp/ClockListener";
import { Memory } from "./Memory";


export class Clock extends hardware{
    
    private list: Array<ClockListener> = [
        new Cpu (1,"CPU"), new Memory (1,"RAM")
    ];
    
    constructor(idNumber: number, name: String) {
        super(idNumber, name);
        this.startSystem();
     }

    public process_pulse(interval: number): void {

        let clockCount : number = 1;
        let cpuCount : number = 1;

        const timer = setInterval(() => {
            cpuCount++;
            this.log("Clock Pulse Initialized");
            for(let j = 0; j < this.list.length; j++){
                this.list[j].pulse();
            }
            clockCount++;
            if (clockCount === 11) {
                clearInterval(timer);
            }
        }, interval);
    }

    //method to add new listener
    public addToListener(obj: ClockListener): void{
        this.list.push(obj);
    }

    //method to remove new listener
    public removeSpecificListener(obj: ClockListener){
        const index = this.list.indexOf(obj);
        if (index > -1) {
            this.list.splice(index, 1);
        }
    }
    //method to remobe all listeners
    public removeAllListeners(obj: ClockListener){
        while(this.list.length > 0) {
            this.list.pop();
        }        
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