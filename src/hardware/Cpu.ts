import { throws } from "assert";
import { assert } from "console";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";
import { Mmu } from "./Mmu";


enum cycle {            ///enum to represent the 3 cycles 
    c_fetch, c_decode, c_execute
}


export class Cpu extends hardware implements ClockListener {

    private accumulator : number;
    private x_register : number = 50;
    private y_register : number = 100;
    private insuction_register : number;
    private program_counter = 0;
    private constant : number;
    public cpuClockCount : number = 0;
    public curr_instruction : number;
    public curr_steps : number = 0;
    public curr_cycle : cycle = cycle.c_fetch;
    public map : Map<number, number> = new Map<number, number>();
    public k : number = 0;

    public noStep : boolean = false;
    public oneStep : boolean = false;
    public twoStep : boolean = false;
    public doExecute : boolean = false;



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
        this.mmu.writeIntermediate(0x0000, 0xA9);
        this.mmu.writeIntermediate(0x0001, 0x20);
        this.mmu.writeIntermediate(0x0002, 0xAD);
        this.mmu.writeIntermediate(0x0003, 0x10);
        this.mmu.writeIntermediate(0x0004, 0x40);
        this.mmu.writeIntermediate(0x0005, 0x8A);
        this.mmu.writeIntermediate(0x0006, 0x98);
        this.mmu.writeIntermediate(0x0007, 0x8D);
        this.mmu.writeIntermediate(0x0008, 0x50);
        this.mmu.writeIntermediate(0x0009, 0x60);
        this.mmu.writeIntermediate(0x000A, 0xA2);
        this.mmu.writeIntermediate(0x000B, 0x01);


        this.mmu.writeIntermediate(0x000C, 0x00);   ///halt

        this.mmu.writeIntermediate(0x1040, 0x99);
        this.mmu.memoryDump(0x0000, 0x0010);
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


    public fetch() : void {
        console.log("\t\t\t\t\tPROGRAM COUNTER #"+this.program_counter)
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
            }

            this.doExecute = false;     //no need to execute //this should be false already
            this.oneStep = false;       //set to false, we do not know the next instr
            return;             //return so we do not override any flags

        } else if(this.twoStep){
            let curr_byte = this.mmu.readIntermediate(this.program_counter++);
            ++this.curr_steps;

            if(this.curr_steps === 1){
                this.mmu.setLowOrderByte(curr_byte);
                this.twoStep = true;
                this.doExecute = false;
            } else if (this.curr_steps === 2){
                this.mmu.setHighOrderByte(curr_byte);
                this.curr_steps = 0;

                if(this.curr_steps === 0){      
                    if(instr === 0xAD){         //if curr steps is 0
                        let address = this.mmu.convert_to_li_format();
                        let data = this.mmu.readIntermediate(address);
                        this.setAccumulator(data);
                        this.doExecute = false;
                    } else if(instr === 0x8D){
                        this.doExecute = true;
                    } else if(instr === 0x6D){
                        let address = this.mmu.convert_to_li_format();
                        let data = this.mmu.readIntermediate(address);
                        let accum_data = this.getAccumulator() + data;
                        this.setAccumulator(accum_data);
                        this.doExecute = false;
                    } else if(instr === 0xAE){
                        let address = this.mmu.convert_to_li_format();
                        let data = this.mmu.readIntermediate(address);
                        this.set_x_register(data);
                        this.doExecute = false;
                    } else if(instr === 0xAC){
                        let address = this.mmu.convert_to_li_format();
                        let data = this.mmu.readIntermediate(address);
                        this.set_y_register(data);
                        this.doExecute = false;
                    } else if(instr === 0xEC){
                        /*

                        */
                    } else if(instr === 0xEE) {
                        /*

                        */
                    }

                }
                this.twoStep = false;
            }

            return;

        }



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
            } else if (instr === 0xFF) {
                /*
                    System Calls
                */
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

         if (curr_instruction == 0xAD){
            let address_register = this.mmu.convert_to_li_format();
            let data_register =  this.mmu.readIntermediate(address_register);
            this.setAccumulator(data_register);
        } else if(curr_instruction == 0x8D){
            let address_register = this.mmu.convert_to_li_format();
            let data_register = this.getAccumulator();
            this.mmu.writeIntermediate(address_register, data_register);  
        }
    }

    public pulse() : void {
        this.program_log();
        this.log("recieved clock pulse - CPU Clock Count: " + ++this.cpuClockCount);  //increment count each time and print its pulse
        assert(!this.mmu.isMemoryEmpty());  //make sure we have code to loop through
        //fetch
        //decode
        //execute

        const colors = require('colors');

        if(this.k === 1){           //this indicates we just finished a decode

            if(this.doExecute){         //if the instruction is ready for an execute -- go ahead and execute
                this.doExecute = false;
                this.curr_cycle = cycle.c_fetch;        //change pointer to fetch to grab new instrc
                console.log("\t\t" + colors.cyan("EXECUTE"));
                this.execute();
                return;     //return because we do not want to override our curr cycle or pointer to next
                            //execute is a special case
            }


             //if oneStep and twoStep are false, this indicates we are in a no operand instr like "98"
             //similarly these instructions also do not have executes (with FF as an exception)
            if(!this.oneStep && !this.twoStep && !this.doExecute) {        
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
        //we wuill acoount for that later
//-------------------------------------------------------------------------------------
        if(this.curr_cycle === cycle.c_fetch){
            console.log("\t\t\t FETCH")
            this.curr_cycle = cycle.c_decode;
            this.fetch();   
        }

        else if(this.curr_cycle === cycle.c_decode){   
            console.log("\t\t\t DECODE") 
            ++this.k;
            this.decode();
        } 
        else if(this.curr_cycle === cycle.c_execute){
            console.log("\t\t\t EXECUTE") 
            this.curr_cycle = cycle.c_fetch;    //we have not taken multiple decodes into account(YET)
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
    
        //console.log("   Program Counter #" + colors.bgRed.cyan(pc));
        console.log("\tCurr steps: " + this.curr_steps);
        if(typeof ir !== 'undefined'){
            console.log("   Instruct Reg: " + colors.bgMagenta.black(ir.toString(16)));
        }
        console.log("   X Reg: " + xr);
        console.log("   Y Reg: " + yr);
        console.log("   Accumulator: " + colors.bgMagenta.black(a));
        console.log("   Address 1040 data: " + colors.bgGreen.red(this.mmu.readIntermediate(0x1040).toString(16)));
        console.log("   Address 5060 data: " + colors.bgGreen.red(this.mmu.readIntermediate(0x5060).toString(16)));
        console.log("   low byte " + colors.bgYellow.black(l));
        console.log("   high  byte " + colors.bgYellow.black(h));
        console.log("----------------");
    }
    }

    public log(message: String) : void {
        return super.log(message);
    }

}
