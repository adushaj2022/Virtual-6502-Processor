import { throws } from "assert";
import { assert } from "console";
import { Ascii } from "./Ascii";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";
import { Mmu } from "./Mmu";


enum cycle {            ///enum to represent the cycles 
    c_fetch, 
    c_decode, 
    c_execute, 
    c_writeBack,
    c_interruptCheck
}


export class Cpu extends hardware implements ClockListener {

    private accumulator : number;
    private x_register : number = 0;
    private y_register : number = 0;
    private insuction_register : number;
    private program_counter = 0;
    private constant : number;
    public cpuClockCount : number = 0;
    public curr_steps : number = 0;
    public curr_cycle : cycle = cycle.c_fetch;
    public map : Map<number, number> = new Map<number, number>();
    public k : number = 0;
    public j : number = 0;

    public oneStep : boolean = false;
    public twoStep : boolean = false;
    public doExecute : boolean = false;
    public doWriteBack : boolean = false;
    public process_String : boolean = false;
    public executeTwo : boolean = false;

    public zFlag : boolean = true;

    public mmu : Mmu = new Mmu(0, "MMU");   //this is how we access memory; through the MMU

    constructor(idNumber: number, name: String) {
       super(idNumber, name);
       this.init_program();

       //Hashmap -- map each instruction to the amount of opcodes it has
       this.map.set(0xA9, 1);       
       this.map.set(0xAD, 2);
       this.map.set(0x8D, 2);
       this.map.set(0x8A, 0);
       this.map.set(0x98, 0);
       this.map.set(0x6D, 2);
       this.map.set(0xA2, 1);
       this.map.set(0xAE, 2);
       this.map.set(0xAA, 0);
       this.map.set(0xA0, 1);
       this.map.set(0xAC, 2);
       this.map.set(0xA8, 0);
       this.map.set(0xEA, 0);
       this.map.set(0x00, 0);
       this.map.set(0xEC, 2);
       this.map.set(0xD0, 1);
       this.map.set(0xEE, 2);
       this.map.set(0xFF, 0);
    }


    public init_program() : void {

        this.mmu.writeIntermediate(0x0000, 0xA2);
        this.mmu.writeIntermediate(0x0001, 0x02);
        this.mmu.writeIntermediate(0x0002, 0xFF);
        this.mmu.writeIntermediate(0x0003, 0x06);
        this.mmu.writeIntermediate(0x0004, 0x00);
        this.mmu.writeIntermediate(0x0005, 0x00);
        this.mmu.writeIntermediate(0x0006, 0x48);
        this.mmu.writeIntermediate(0x0007, 0x65);
        this.mmu.writeIntermediate(0x0008, 0x6C);
        this.mmu.writeIntermediate(0x0009, 0x6C);
        this.mmu.writeIntermediate(0x000A, 0x6F);
        this.mmu.writeIntermediate(0x000B, 0x20);
        this.mmu.writeIntermediate(0x000C, 0x57);
        this.mmu.writeIntermediate(0x000D, 0x6F);
        this.mmu.writeIntermediate(0x000E, 0x72);
        this.mmu.writeIntermediate(0x000F, 0x6C);
        this.mmu.writeIntermediate(0x0010, 0x64);
        this.mmu.writeIntermediate(0x0011, 0x21);
        this.mmu.writeIntermediate(0x0012, 0x0A);
        this.mmu.writeIntermediate(0x0013, 0x00);
        this.mmu.memoryDump(0x0000, 0x0013);

    }

    private setInsctrutionRegister(insuction_register : number) : void {
        this.insuction_register = insuction_register;
    }

    private getInstructionRegister() : number {
        return this.insuction_register;
    }

    private setAccumulator(accumulator : number) : void {
        this.accumulator = accumulator;
    }

    private getAccumulator() : number {
        return this.accumulator;
    }

    private set_y_register(y_register : number) : void {
        this.y_register = y_register;
    }

    private get_y_register() : number {
        return this.y_register;
    }

    private set_x_register(x_register : number) : void {
        this.x_register = x_register;
    }

    private get_x_register() : number {
        return this.x_register;
    }

    private twos_comp(hex_number : number) : number {

        var flip_bits = str  => str.split('').map(x => (1 - x).toString()).join('');    //flip bits

        let num : string = (flip_bits(hex_number.toString(2)));     //turn into decimal

        let res : number = (parseInt(num, 2)) + 1;              //add 1

        return res;
    }


    public fetch() : void {
        console.log("\t\t\t\t\tPROGRAM COUNTER #"+ this.program_counter)
        let instruction = this.mmu.readIntermediate(this.program_counter++);
        this.setInsctrutionRegister(instruction);
    }

    public decode() : void {
        let instr = this.getInstructionRegister();

        //first case is for single op codes (usually a constant)
        if(this.oneStep){       
            this.constant = this.mmu.readIntermediate(this.program_counter++);

            if(instr === 0xA9){
                this.setAccumulator(this.constant);
            } else if(instr === 0xA2){
                this.set_x_register(this.constant);
            } else if(instr === 0xA0){
                this.set_y_register(this.constant);
            } else if(instr === 0xD0){
                /*
                    branches
                */
                let twos_comp = this.twos_comp(this.constant);
                if(this.zFlag) {
                    this.program_counter -= twos_comp;
                }

            }

            this.doExecute = false;     //no need to execute //this should be false already
            this.oneStep = false;       //set to false, we do not know the next instr
            return;             //return so we do not override any flags

        } else if(this.twoStep){                            //second case is for 2 operands usually a low and high order byte
            let curr_byte = this.mmu.readIntermediate(this.program_counter++);
            ++this.curr_steps;  //this will keep track of which part of the decode we are on

            if(this.curr_steps === 1){      //if count is 1, we know we are at a LOB
                this.mmu.setHighOrderByte(curr_byte);
                this.twoStep = true;
                this.doExecute = false;
            } else if (this.curr_steps === 2){      //if count is 2, we know we are at a HOB
                this.mmu.setLowOrderByte(curr_byte);
                this.curr_steps = 0;        //reset count for next time

                //now that we know we are on the last part of the decode, find which instr we are in and act accordingly
                if(this.curr_steps === 0){             
                    this.doExecute = true;
                }
                this.twoStep = false;
            }
            return;
        }
        //-----------------------------------------------------------------------------------------------------
        //this indicates we are in the first part of a decode

        if(this.map.has(instr) && this.map.get(instr) == 0){    //ok, handle instructions that have no opcodes
            if(instr === 0x8A){
                this.setAccumulator(this.get_x_register());
                this.doExecute = false;                  //similarly, these instructions have no executes so we set doExe flag to false
            } else if(instr === 0x98){                          //we will use this flag in pulse to appropriately pick the next cycle
                this.setAccumulator(this.get_y_register());
                this.doExecute = false;
            } else if(instr === 0xAA){
                this.set_x_register(this.getAccumulator());
                this.doExecute = false;
            } else if(instr === 0xA8){
                this.set_y_register(this.getAccumulator());
                this.doExecute = false;
            } else if(instr === 0xEA){
                this.doExecute = false;
            } else if(instr === 0x00) {
                this.debug = false;     //turn off debugging, this is a halt
                this.doExecute = false;
                this.setStatus(false);
            } else if (instr === 0xFF) {        //process system calls, 
              
                if(this.get_x_register() === 1){    //if one is in no need to decode
                    this.doExecute = true;
                } else {
                    this.twoStep = true;    //we need to get address 
                    this.doExecute = false;
                }

            }

        } else if (this.map.has(instr) && this.map.get(instr) == 1) {   //handle insctructions with one opcode
            this.oneStep = true;    //this flag will help us to decode twice 
            this.doExecute = false; //this flag will make sure we do not execute, becayse we set the accumulator inside decode            
        } else if(this.map.has(instr) && this.map.get(instr) === 2){
            this.twoStep = true;
            this.doExecute = false;
        }
    }

    public execute() : void {
        let curr_instruction = this.getInstructionRegister();

        if(this.process_String){        //Case for a string
            if(this.program_counter >= this.constant){
                if(this.mmu.readIntermediate(this.program_counter) === 0x00){   //make sure we are not a halt
                    this.process_String = false;
                    this.curr_cycle = cycle.c_fetch;
                    return;
                }
                process.stdout.write(Ascii.fromCharCode(this.mmu.readIntermediate(this.program_counter)));
            }
            this.program_counter++;
            return;     //return so we do not re trigger any previous conditions
        }

        if(this.executeTwo){
            if(curr_instruction == 0xEE){       //increment has a second execute
                let accumulator_data = this.getAccumulator();
                this.setAccumulator(++accumulator_data);
                this.executeTwo = false;
                this.doWriteBack = true;
                return;
            }
        }


        if (curr_instruction == 0xAD){
            let address_register = this.mmu.convert_to_li_format();
            let data =  this.mmu.readIntermediate(address_register);
            this.setAccumulator(data);
        } else if(curr_instruction == 0x8D){
            let address_register = this.mmu.convert_to_li_format();
            let data_register = this.getAccumulator();
            this.mmu.writeIntermediate(address_register, data_register);  
        } else if(curr_instruction === 0x6D){
            let address = this.mmu.convert_to_li_format();
            let data = this.mmu.readIntermediate(address);
            let accum_data = this.getAccumulator() + data;
            this.setAccumulator(accum_data);
        } else if(curr_instruction === 0xAE){
            let address = this.mmu.convert_to_li_format();
            let data = this.mmu.readIntermediate(address);
            this.set_x_register(data);
        } else if(curr_instruction === 0xAC){
            let address = this.mmu.convert_to_li_format();
            let data = this.mmu.readIntermediate(address);
            this.set_y_register(data);
        } else if(curr_instruction === 0xEE) {
            let address = this.mmu.convert_to_li_format();
            let data = this.mmu.readIntermediate(address);
            this.setAccumulator(data);
            this.doExecute = true;
            this.executeTwo = true;
        } else if(curr_instruction === 0xEC){
            let address = this.mmu.convert_to_li_format();
            let data = this.mmu.readIntermediate(address);
            
            if(data === this.get_x_register()){
               this.zFlag = false;
            }
        } else if(curr_instruction === 0xFF){

            if(this.get_x_register() == 1){
                process.stdout.write("\t"+this.get_y_register().toString(16));
            } else{
                this.constant = this.mmu.convert_to_li_format();
                this.process_String = true
            }
        }
    }

    public write_back() : void {        //this cycle is only for EE
        let address = this.mmu.convert_to_li_format();
        let data = this.getAccumulator();
        this.mmu.writeIntermediate(address, data);
        this.doWriteBack = false;
    }


    public pulse() : void {
        this.program_log();
        this.log("recieved clock pulse - CPU Clock Count: " + ++this.cpuClockCount);  //increment count each time and print its pulse
        assert(!this.mmu.isMemoryEmpty());  //make sure we have code to loop through
        //fetch
        //decode
        //execute

        const colors = require('colors');

        if(this.process_String){
            console.log("\t\t" + colors.green("EXECUTE"));
            this.execute();
            return;
        }

        if(this.j === 1){

            if(this.executeTwo) {       //if we executed, but need another lets do another
                console.log("\t\t" + colors.green("EXECUTE"));
                this.j = 1;
                this.execute();
                return;
            }

            if (this.doWriteBack && !this.executeTwo){      //after we finish we now have writeback set to true and twoExecute to false
                console.log("\t\t" + colors.green("WRITEBACK")); //therefore we do the right back and reset the execute switch
                this.curr_cycle = cycle.c_fetch;        //move pointer to fetch
                this.doExecute = false;
                this.write_back();
                return;
            }

            this.j = 0;
        }        //if we just finished an execute lets check for a writeback(this is only for EE aka Increment )

        if(this.k === 1){           //this indicates we just finished a decode
            if(this.process_String){
                this.curr_cycle = cycle.c_decode;
            }
            else if(this.doExecute){         //if the instruction is ready for an execute -- go ahead and execute
                this.doExecute = false;
                this.curr_cycle = cycle.c_fetch;        //change pointer to fetch to grab new instrc
                console.log("\t\t" + colors.cyan("EXECUTE"));
                ++this.j;
                this.execute();
                return;     //return because we do not want to override our curr cycle or pointer to next
                            //execute is a special case
            }
             //if oneStep and twoStep are false, this indicates we are in a no operand instr like "98"
             //similarly these instructions also do not have executes (with FF as an exception)
            else if(!this.oneStep && !this.twoStep && !this.doExecute) {        
                this.curr_cycle = cycle.c_fetch;
            }
            //this is the case for a single op code operand-- A9 06, we will call the second decode, then reset its one step
            // and two step to false and then the above condition will get triggered next time around
            else if(this.oneStep) {
                this.curr_cycle = cycle.c_decode;
            }
            //this is the case for a two operand instr like 8D 00 40, first decode grabs 8d, second grabs 00
            //third grabs 40, and when the third finishes it, we will make the "doExecute" set to true
            //we do this because we then need to write to memory
            else if(this.twoStep){
                if(!this.doExecute){
                    this.curr_cycle = cycle.c_decode;
                }
            }
            this.k = 0;     //reset the switch
        }
        //use these three cycles to do what they need, but above we will have to navigate to pick the right one
        //some are concominate like fetch always always points to a decode
        //same with execute pointing to fetch(ASSUMING WE DO NOT HAVE MULTIPLE EXECUTES)
        //we will acoount for that later
//-------------------------------------------------------------------------------------
        if(this.curr_cycle === cycle.c_fetch){
            console.log(colors.yellow("\t\t\t FETCH"));
            this.curr_cycle = cycle.c_decode;
            this.fetch();   
        }

        else if(this.curr_cycle === cycle.c_decode){   
            console.log(colors.red("\t\t\t DECODE"));
            ++this.k;
            this.decode();
        } 
        else if(this.curr_cycle === cycle.c_execute){
            console.log("\t\t\t EXECUTE") 
            this.curr_cycle = cycle.c_fetch;    //we have not taken multiple decodes into account(YET)
            ++this.j;
            this.execute();
        }
    }
 
    
    public program_log() : void {
        const colors = require('colors');

        let pc = this.program_counter;
        let ir = this.getInstructionRegister();
        let xr = this.get_x_register();
        let yr = this.get_y_register();
        let a = this.getAccumulator();
        let h = this.mmu.getHighOrderByte();
        let l = this.mmu.getLowOrderByte();

        if(this.debug){
            console.log("----------------");
    
            console.log("\tCurr steps: " + this.curr_steps);
            if(typeof ir !== 'undefined'){
                console.log("   Instruct Reg: " + colors.bgMagenta.black(ir.toString(16)));
            }

            console.log("   X Reg: " + xr);
            console.log("   Y Reg: " + yr);
            console.log("   Accumulator: " + colors.bgMagenta.black(a));
            console.log("   Address 1040 data: " + colors.bgGreen.red(this.mmu.readIntermediate(0x1040).toString(16)));
            console.log("   Address 3020 data: " + colors.bgGreen.red(this.mmu.readIntermediate(0x3020).toString(16)));
            console.log("   low byte " + colors.bgYellow.black(l));
            console.log("   high  byte " + colors.bgYellow.black(h));
            console.log("----------------");
        }
    }
    public log(message: String) : void {
        return super.log(message);
    }
}
