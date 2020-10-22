import { assert, memory } from "console";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";


export class Memory extends hardware implements ClockListener {

    //array size will be 2^16 to represent memory
    private HexArray : number[] = new Array(0xFFFF); 
    private mar : number = 0x0000;
    private mdr : number = 0x00;

    constructor(idNumber: number, name: String) {
        super(idNumber, name);
        this.fillArray();
     }

    public setMAR(mar : number) : void {
        this.mar = mar;
    } 

    public getMAR() : number {
        return this.mar;
    } 

    public setMDR(mdr : number) : void {
        this.mdr = mdr;
    } 

    public getMDR() : number {
        return this.mdr;
    }

    public reset() : void {
        this.fillArray();   //fills array with 0s
        this.setMAR(0x0000);
        this.setMDR(0x00);
    }

    public read() : number {
        return this.HexArray[this.getMDR()] = this.getMAR();   //3 cycles -- > set MAR, Activate Memory(), read from MDR  
    }

    public write() : void {
        this.HexArray[this.getMAR()] = this.getMDR();
    }

    //output statement veryfing the clock got the pulse
    public pulse(): void {
        this.log("received clock pulse");
    }

    //fill array with 0s
    //shortcut could have been this.HexArray.fill(0x00);
    public fillArray(): void {
        for (let i=0x00; i < this.HexArray.length; i++){ 
            this.HexArray[i] = 0x00;
        }
    }

    /*  --Note not sure if I need this still, as Memory dump more so does this--

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
    */

    public memoryDump(fromAddress: number, toAddress: number){

        assert(fromAddress < toAddress);


        this.log("--------------------------------------");
        for(let i = fromAddress; i <= toAddress; ++i){
            this.log("Addr: " + i.toString(16).toUpperCase() + ":  | " + (super.hexValue(this.HexArray[i], 2) + "\n"); 
        }
        this.log("--------------------------------------");

    }
     
    public log(message: String) {
        return super.log(message);
    }
    
}