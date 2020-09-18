import { memory } from "console";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";


export class Memory extends hardware implements ClockListener {

    private HexArray : number[] = new Array(0xFFFF); 

    constructor(idNumber: number, name: String) {
        super(idNumber, name);
        this.startSystem();
        this.fillArray();
     }
     
    public pulse(): void {
        this.log("received clock pulse");
    }

    //fill array with 0s
    public fillArray(): void {
        for (let i=0x00; i<this.HexArray.length; i++){ 
            this.HexArray[i] = 0x00;
        }
     }

    public displayMemory(upperBound : number): void {
        //if the upper bound exceeds our length give an error message and return the function
        if(upperBound > this.HexArray.length){
            let errorMessage : String = "Address: " + upperBound.toString(16).toUpperCase() + " Contains value: ERR [hexValue conversion]: number undefined";
            this.log(errorMessage);
            return;
        }
        for (var i = 0x00; i <= upperBound; i++) {
            let outputStr : String = "Adress: " +  super.hexValue(i, 4) + " Contains Value: "+ (super.hexValue(this.HexArray[i], 2)) 
            this.log(outputStr);
        }
     }

     
    public log(message: String) {
        return super.log(message);
    }

    public startSystem(): boolean {
        return super.startSystem();
    }

    public stopSystem(): boolean {
        return super.stopSystem();
    }

    
}