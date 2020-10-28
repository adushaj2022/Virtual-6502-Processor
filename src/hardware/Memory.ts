import { assert, memory } from "console";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";


export class Memory extends hardware implements ClockListener {

    private HexArray : number[] = new Array(0xFFFF);    //representation of memory
    private mar : number = 0x0000;                      //Memory Address Reg
    private mdr : number = 0x00;                        //Memory Data Reg

    constructor(idNumber: number, name: String) {
        super(idNumber, name);
        this.fillArray();   //when Memory is created, it will be initiated to 0
    }

    //setter for memory address register
    public setMAR(mar : number) : void {
        this.mar = mar;
    } 

    //getter for memory address register
    public getMAR() : number {
        return this.mar;
    } 

    //setter for memory data register
    public setMDR(mdr : number) : void {
        this.mdr = mdr;
    } 

    //getter for memory data register
    public getMDR() : number {
        return this.mdr;
    }

    //sets mar, mdr, and all of memory to 0
    public reset() : void {
        this.fillArray();   
        this.setMAR(0x0000);
        this.setMDR(0x00);
    }

    //returns the data (mdr) from a specificed address (mar)
    public read() : number {
        return this.HexArray[this.getMDR()] = this.getMAR(); 
    }

    //sets the data (mdr) from a specificed address (mar)
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
        for (let i=0x00; i < this.HexArray.length; ++i){ 
            this.HexArray[i] = 0x00;
        }
    }

    //method to check if array has anything besides 0s (is it empty or not)
    public isMemoryEmpty() : boolean {
        for(let i = 0x00; i < this.HexArray.length; ++i){
            if(this.HexArray[i] != 0x00){
                return false;
            }
        }
        return true;
    }

    //get total addressable Space --> array is private therefore well use this to get the length
    public totalAddressableSpace() : number {
        return this.HexArray.length + 0x01;
    }


    public memoryDump(fromAddress: number, toAddress: number) : void {

        assert(fromAddress < toAddress && fromAddress > -1);    //make sure the user gives us proper input so we dont go out of bounds

        //error check, if they want an address outside of our addressable space then throw an error and return the function
        if(toAddress > this.HexArray.length){
            let errorMessage : String = "Address: " + toAddress.toString(16).toUpperCase() + " Contains value: ERR [hexValue conversion]: number undefined";
            this.log(errorMessage);
            return;
        }

        //format the memory output
        this.log( "Initialized Memory ")
        this.log("--------------------------------------\n");
        //array indices (mar) get a length of 4, & array elements (mdr) get a length of 2
        for(let i = fromAddress; i <= toAddress; ++i){
            this.log("Addr: " + super.hexValue(i, 0x04) + "  | " + (super.hexValue(this.HexArray[i], 0x02) + "\n")); 
        }
        this.log("--------------------------------------\n");
        this.log("Memory Dump Complete");

    }
     
    public log(message: String) : void {
        return super.log(message);
    }
    
}