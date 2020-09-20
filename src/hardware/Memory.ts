import { memory } from "console";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";


export class Memory extends hardware implements ClockListener {

    //array size will be 2^16 to represent memory
    private HexArray : number[] = new Array(0xFFFF); 

    constructor(idNumber: number, name: String) {
        super(idNumber, name);
        this.fillArray();
     }
     
    //output statement veryfing the clock got the pulse
    public pulse(): void {
        this.log("received clock pulse");
    }

    //fill array with 0s
    //shortcut could have been this.HexArray.fill(0x00);
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
        
        //if the if statement above us did not trigger, lets print the array
        //give array indices a 4 length with the hexVal func, and arrray elements a 2 length 
        for (var i = 0x00; i <= upperBound; i++) {
            let outputStr : String = "Adress: " +  super.hexValue(i, 4) + " Contains Value: "+ (super.hexValue(this.HexArray[i], 2)) 
            this.log(outputStr);
        }
     }
     
    public log(message: String) {
        return super.log(message);
    }
    
}