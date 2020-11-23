import { throws } from "assert";
import { assert } from "console";
import { Ascii } from "./Ascii";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";
import { Mmu } from "./Mmu";
import { VirtualKeyboard } from "./VirtualKeyboard";
import PriorityQueue from 'javascript-priority-queue';
import { Interrupt } from "./imp/Interrupt";

enum cycle {            ///enum to represent the cycles 
    c_fetch, 
    c_decode, 
    c_execute, 
    c_writeBack,
    c_interruptCheck
}


export class Cpu extends hardware implements ClockListener {
    
    private accumulator : number = 0;
    private x_register : number = 0;
    private y_register : number = 0;
    private insuction_register : number = 0;
    private program_counter = 0;

    public cpuClockCount : number = 0;
    public curr_steps : number = 0;
    public curr_cycle : cycle = cycle.c_fetch;
    public map : Map<number, number> = new Map<number, number>();
    public k : number = 0;
    public j : number = 0;
    public i : number = 0;

    public oneStep : boolean = false;
    public twoStep : boolean = false;
    public doExecute : boolean = false;
    public doWriteBack : boolean = false;
    public process_String : boolean = false;
    public executeTwo : boolean = false;

    public maxHeap : PriorityQueue = new PriorityQueue("max");

    public zFlag : boolean = true;

    public mmu : Mmu;  //this is how we access memory; through the MMU

    private cpuLogSwitch: boolean = true;

    private device : Interrupt;

    constructor(mmu : Mmu) {
       super(0, "CPU");
       this.mmu = mmu;
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
        this.mmu.writeIntermediate(0x0001, 0x00);
        // write acc (0) to 0040
        this.mmu.writeIntermediate(0x0002, 0x8D);
        this.mmu.writeIntermediate(0x0003, 0x40);
        this.mmu.writeIntermediate(0x0004, 0x00);
        // load constant 1
        this.mmu.writeIntermediate(0x0005, 0xA9);
        this.mmu.writeIntermediate(0x0006, 0x01);
        // add acc (?) to mem 0040 (?)
        this.mmu.writeIntermediate(0x0007, 0x6D);
        this.mmu.writeIntermediate(0x0008, 0x40);
        this.mmu.writeIntermediate(0x0009, 0x00);
        // write acc ? to 0040
        this.mmu.writeIntermediate(0x000A, 0x8D);
        this.mmu.writeIntermediate(0x000B, 0x40);
        this.mmu.writeIntermediate(0x000C, 0x00);
        // Load y from memory 0040
        this.mmu.writeIntermediate(0x000D, 0xAC);
        this.mmu.writeIntermediate(0x000E, 0x40);
        this.mmu.writeIntermediate(0x000F, 0x00);
        // Load x with constant (1) (to make the first system call)
        this.mmu.writeIntermediate(0x0010, 0xA2);
        this.mmu.writeIntermediate(0x0011, 0x01);
        // make the system call to print the value in the y register (3)
        this.mmu.writeIntermediate(0x0012, 0xFF);
        // Load x with constant (2) (to make the second system call for the string)
        this.mmu.writeIntermediate(0x0013, 0xA2);
        this.mmu.writeIntermediate(0x0014, 0x02);
        // make the system call to print the value in the y register (3)
        this.mmu.writeIntermediate(0x0015, 0xFF);
        this.mmu.writeIntermediate(0x0016, 0x50);
        this.mmu.writeIntermediate(0x0017, 0x00);
        // test DO (Branch Not Equal) will be NE and branch (0x0021 contains 0x20 and xReg contains B2)
        this.mmu.writeIntermediate(0x0018, 0xD0);
        this.mmu.writeIntermediate(0x0019, 0xED);
        // globals
        this.mmu.writeIntermediate(0x0050, 0x2C);
        this.mmu.writeIntermediate(0x0052, 0x00);
        this.mmu.memoryDump(0x0000, 0x001A);
        this.mmu.memoryDump(0x0050, 0x0053);        
        
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
        //console.log("\t\t\t\t\tPROGRAM COUNTER #"+ this.program_counter)
        let instruction = this.mmu.readIntermediate(this.program_counter++);
        this.setInsctrutionRegister(instruction);
    }

    public decode() : void {
        let instr = this.getInstructionRegister();

        //first case is for single op codes (usually a constant)
        if(this.oneStep){       
            this.mmu.setMDR(this.mmu.readIntermediate(this.program_counter++));

            if(instr === 0xA9){
                this.setAccumulator(this.mmu.getMDR());
            } else if(instr === 0xA2){
                this.set_x_register(this.mmu.getMDR());
            } else if(instr === 0xA0){
                this.set_y_register(this.mmu.getMDR());
            } else if(instr === 0xD0){
                /*
                    branches
                */
                let twos_comp = this.twos_comp(this.mmu.getMDR());
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
            if(this.mmu.readIntermediate(this.mmu.getMAR()) === 0x00){   //make sure we are not a halt
                this.process_String = false;
                this.curr_cycle = cycle.c_fetch;
                return;
            }                
            process.stdout.write(Ascii.fromCharCode(this.mmu.readIntermediate(this.mmu.getMAR())));
            this.mmu.setMAR(this.mmu.getMAR()+1);
            return;
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
                process.stdout.write(this.get_y_register().toString(16));
            } else {
                this.process_String = true
                this.mmu.setMAR(this.mmu.convert_to_li_format());
            }
        }
    }

    public write_back() : void {        //this cycle is only for EE
        let address = this.mmu.convert_to_li_format();
        let data = this.getAccumulator();
        this.mmu.writeIntermediate(address, data);
        this.doWriteBack = false;
    }


    public setInterrupt(device : Interrupt) : void {
        this.device = device;
    }

    public getInterrupt() : Interrupt {
        return this.device;
    }

    public interrupt_check() : void {
        if(typeof this.device != 'undefined')
        {    
            this.maxHeap = this.getInterrupt().input_buffer;
            if(this.maxHeap.size() > 0) {
                this.log("Highest Priotity Interrupt was dequeued -> " + this.maxHeap.peek());
                this.log("CPU sees the buffer:\n{" + this.maxHeap.toString() + "}");         
                this.maxHeap.dequeue();
            }
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

        /*this first condition handles Interrupt checks, interrupt checks will happen when a cycle is over
        cycles can be over after an execute, writeback, or a decode(when there is no execute)
        i is essentially a switch, therefore if we finished an execute or a decode with no execute we will perform this check
        */
        if(this.i === 1 && (!this.twoStep || !this.doWriteBack)){       
            //console.log("\t\t" + colors.red("INTERRUPT"));
            this.curr_cycle = cycle.c_fetch;
            this.i = 0;
            this.interrupt_check();
            return;
        }

        /*
        Second case is for processing a string while the condition is true we will keep executing 
        when false, then do interrupt check and complete (thats why we increment i)
        */
        if(this.process_String){
            //console.log("\t\t" + colors.yellow("EXECUTE"));
            this.execute();
            if(!this.process_String){
                ++this.i;   //if we finished the string now lets check for an interrupt
            }
            return;
        }

        if(this.j === 1){   //check to see if we just finished an execute, we will check for second execute &| write back

            if(this.executeTwo) {       //if we executed, but need another lets do another
                //console.log("\t\t" + colors.yellow("EXECUTE"));
                this.j = 1;
                this.i = 1;
                this.execute();
                return;
            }

            if (this.doWriteBack && !this.executeTwo){      //after we finish we now have writeback set to true and twoExecute to false
                //console.log("\t\t" + colors.blue("WRITEBACK")); //therefore we do the right back and reset the execute switch
                this.curr_cycle = cycle.c_fetch;        //move pointer to fetch
                this.doExecute = false;
                this.write_back();
                this.i = 1;
                this.j = 0;
                return;
            }
        }        //if we just finished an execute lets check for a writeback(this is only for EE (Increment) )

        if(this.k === 1){           //this indicates we just finished a decode
            if(this.process_String){
                this.curr_cycle = cycle.c_decode;
            }
            else if(this.doExecute){         //if the instruction is ready for an execute -- go ahead and execute
                this.doExecute = false;
                this.curr_cycle = cycle.c_execute;        //change pointer to fetch to grab new instrc
                ++this.j;
                ++this.i;                                 //execute is a special case
            }
             //if oneStep and twoStep are false, this indicates we are in a no operand instr like "98"
             //similarly these instructions also do not have executes (with FF as an exception)
            else if(!this.oneStep && !this.twoStep && !this.doExecute && this.curr_cycle != cycle.c_fetch) {        
                this.curr_cycle = cycle.c_interruptCheck;
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
        //use these four cycles to do what they need, but above we will have to navigate to pick the right one
        //some are concominate like fetch always always points to a decode
        //same with execute pointing to INTERRUPT CHECK (ASSUMING WE DO NOT HAVE MULTIPLE EXECUTES)
//-------------------------------------------------------------------------------------
        if(this.curr_cycle === cycle.c_fetch){
            //console.log(colors.yellow("\t\t\t FETCH"));
            this.curr_cycle = cycle.c_decode;
            this.fetch();   
        }

        else if(this.curr_cycle === cycle.c_decode){   
            //console.log(colors.red("\t\t\t DECODE"));
            ++this.k;
            this.decode();
        } 
        else if(this.curr_cycle === cycle.c_execute){
            //console.log("\t\t" + colors.cyan("EXECUTE"));
            this.curr_cycle = cycle.c_fetch;
            this.j = 1;    
            this.execute();
        } else if(this.curr_cycle === cycle.c_interruptCheck){
            //console.log("\t\t" + colors.red("INTERRUPT CHECK"));
            this.curr_cycle = cycle.c_fetch;
            this.interrupt_check();    
        }
    }
 
    
    public program_log() : void {
      if(this.cpuLogSwitch){
        let pc = this.hexValue(this.program_counter, 4);
        let ir = this.hexValue(this.getInstructionRegister(), 2);
        let ac = this.hexValue(this.getAccumulator(), 2);
        let xr = this.hexValue(this.get_x_register(), 2);
        let yr = this.hexValue(this.get_y_register(), 2);
        
        this.log("CPU State | PC :" + pc + " IR: " + ir + " Acc: " + ac + " xReg: " + xr);
      }

    }
    public log(message: String) : void {
        return super.log(message);
    }
}
