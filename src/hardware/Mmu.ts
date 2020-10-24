import { assert } from "console";
import { hardware } from "./hardware";
import { Memory } from "./Memory";


export class Mmu extends hardware {

    ram : Memory = new Memory(0, "MMU");    //create an instance of memory

    private lob : number = 0x00;
    private hob : number = 0x00;

    constructor(idNumber: number, name: String) {
        super(idNumber, name);
    }


    public isMemoryEmpty() : boolean {

    }

    public writeIntermediate(address : number, data : number) {
        this.ram.setMAR(address);
        this.ram.setMDR(data);
        this.ram.write();
    }

    //Helper / Util method for CPU to access -- As CPU cannot access Memory directly. 
    public memoryDump(fromAddress: number, toAddress: number){
        return this.ram.memoryDump(fromAddress, toAddress);
    }

    //Helper / Util method
    public setMAR(mar : number, martwo?: number) : void {        // this method will accept one paramter or two (method overloading)
        if(typeof mar === 'number' && typeof martwo === undefined){
            return this.ram.setMAR(mar);                        //in this case, it will accept a one 4 digit hex number and set it
        } else if (typeof mar === 'number' && typeof martwo === 'number'){
            return this.ram.setMAR(this.convert_to_li_format());   //in this case it will accept two two digit hex numbers and convert them then set the converted number
        }
    }

    //Helper / Util method 
    public getMAR() : number {
        return this.ram.getMAR();
    }

    //Helper / Util method
    public setMDR(mdr : number) : void {
        this.ram.setMDR(mdr);
    } 

    //Helper / Util method
    public getMDR() : number {
        return this.ram.getMAR();
    }

    //Helper / Util method
    public read() : number {
        return this.ram.read();
    }

    //Helper / Util method
    public write() : void {
        return this.ram.write();
    }

    public reset() : void {
        this.ram.reset();
    }

    public setLowOrderByte(lob : number) : void {
        this.lob = lob;
    }

    public setHighOrderByte(hob : number) : void {
        this.hob = hob;
    }

    public getLowOrderByte() : number {
        return this.lob;
    }

    public getHighOrderByte() : number {
        return this.hob;
    }

    public convert_to_li_format() : number {

        let a = this.getHighOrderByte();   //these getters will be used alot, so lets use a short variable name
        let b = this.getHighOrderByte();

        assert ((b.toString(16).length == 2) && (a.toString(16).length == 2));

        
        let temp : string = (a > b) ? this.ram.hexValue(b, 4) : this.ram.hexValue(a, 4); //find bigger string

        if(a > b){
            temp = a.toString(16).toUpperCase() + temp.substring(2, 4);             //add the two together, substring is replacing leading 0s with the hob
        } else {
            temp = b.toString(16).toUpperCase() + temp.substring(2, 4);
        }

        return parseInt(temp, 16);    //return parsed int
    }



}