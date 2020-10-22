import { assert } from "console";
import { hardware } from "./hardware";
import { Memory } from "./Memory";


export class Mmu extends hardware {

    mmu : Memory = new Memory(0, "MMU");
    //array size will be 2^16 to represent memory
    private HexArray : number[] = new Array(0xFFFF); 
    private mar : number = 0x0000;
    private mdr : number = 0x00;

    constructor(idNumber: number, name: String) {
        super(idNumber, name);
    }


    public writeIntermediate(address : number, data : number) {
        this.mmu.setMAR(address);
        this.mmu.setMDR(data);
        this.mmu.write();
    }

    //Helper / Util method for CPU to access -- As CPU cannot access Memory directly. 
    public memoryDump(fromAddress: number, toAddress: number){
        return this.mmu.memoryDump(fromAddress, toAddress);
    }

    public setMAR(mar : number, martwo?: number) : void{
        if(typeof mar === 'number' && typeof martwo === undefined){
            return this.mmu.setMAR(mar);
        } else if (typeof mar === 'number' && typeof martwo === 'number'){
            return this.mmu.setMAR(this.convert_to_li_format(mar, martwo));
        }
    }


    public replaceBetween(s : string, start : number, end : number, value : string){
        return s.substring(0, start) + value + s.substring(end);
    }

    public convert_to_li_format(b : number, a : number) : number {

        assert ((b.toString(16).length == 2) && (a.toString(16).length == 2));

        
        let temp : string = (a > b) ? this.mmu.hexValue(b, 4) : this.mmu.hexValue(a, 4);
        //eval both numbers, put smaller in front with a len of 4
        // example 0x2A and 0x4D --> temp will equal 0x002A


        //temp = 002A
        //a.toString(16).toUpperCase()  -- > 4D
        //substring 2, 5 --> 2A
        //res -->  "4D" + "2A" --> 4D2A 

        if(a > b){
            temp = a.toString(16).toUpperCase() + temp.substring(2, 4);
        } else {
            temp = b.toString(16).toUpperCase() + temp.substring(2, 4);
        }

        return parseInt(temp, 16);    //return parsed int
    }



}