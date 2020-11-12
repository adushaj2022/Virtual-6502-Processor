import { throws } from "assert";
import { assert } from "console";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";
import { Mmu } from "./Mmu";


//create linked List
class ListNode {
    val : number;
    next : ListNode = null;

    constructor(val : number){
        this.val = val;
    }
}


export class Cpu extends hardware implements ClockListener {

    private accumulator : number;
    private x_register : number;
    private y_register : number;
    private insuction_register : number;
    private program_counter = 0;
    private constant : number;
    public cpuClockCount : number = 0;
    public curr_instruction : number;
    public curr_steps : number = -1;


    private current_node : ListNode = new ListNode(-1);

    private cycle_fetch : ListNode = new ListNode(0);
    private cycle_decode : ListNode = new ListNode(1);
    private cycle_execute : ListNode = new ListNode(2);


    public mmu : Mmu = new Mmu(0, "MMU");   //this is how we access memory; through the MMU

    constructor(idNumber: number, name: String) {
       super(idNumber, name);
       this.init_program();

       //create circular singly linked list
       this.cycle_fetch.next = this.cycle_decode;
       this.cycle_decode.next = this.cycle_execute;
       this.cycle_execute.next = this.cycle_fetch;

       this.current_node = this.cycle_fetch;
    }


    public init_program() : void {
        
        this.mmu.writeIntermediate(0x0000, 0xA9);
        this.mmu.writeIntermediate(0x0001, 0x20);
        this.mmu.writeIntermediate(0x0002, 0x8D);
        this.mmu.writeIntermediate(0x0003, 0x00);
        this.mmu.writeIntermediate(0x0004, 0x40);
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

    private get_curr_instruction() : number {
        return this.curr_instruction;
    }

    private set_curr_instruction(curr_instruction: number) : void {
        this.curr_instruction = curr_instruction;
    }

    public fetch() : void {
        this.set_curr_instruction(this.mmu.readIntermediate(this.program_counter++));
    }

    public decode() : void {
        let curr_instruction : number = this.get_curr_instruction();
        if(curr_instruction == 0xA9){           //first block to get instruction
            this.setInsctrutionRegister(0xA9);
        } else if(curr_instruction == 0xAD){
            this.setInsctrutionRegister(0xAD);
            this.curr_steps = 0;
        } else if(curr_instruction == 0x8D){
            this.setInsctrutionRegister(0x8D);
            this.curr_steps = 0;
        } else if(curr_instruction == 0x8A) {
            this.setInsctrutionRegister(0x8A);
            this.curr_steps = -1;
        }
    
        //etc .. .. . . 
        console.log("               curr step       " + this.curr_steps);
        if(this.getInstructionRegister() == 0xA9 && curr_instruction != 0xA9){      //second block to see if we have multiple decodes
            this.constant = curr_instruction;
            this.curr_steps = -1;
        } else if(this.getInstructionRegister() == 0xAD && curr_instruction != 0xAD) {
            ++this.curr_steps;
            if(this.curr_steps == 1){
                this.mmu.setLowOrderByte(curr_instruction);
            } else if(this.curr_steps == 2) {
                this.mmu.setHighOrderByte(curr_instruction);
                this.curr_steps = -1;
            }
        } else if(this.getInstructionRegister() == 0x8D && curr_instruction != 0x8D){
            ++this.curr_steps;
            if(this.curr_steps == 1){
                this.mmu.setLowOrderByte(curr_instruction);
            } else if(this.curr_steps == 2){
                this.mmu.setHighOrderByte(curr_instruction);
                this.curr_steps = -1;
            }
        }
    }

    public execute() : void {
        let curr_instruction = this.getInstructionRegister();

        if(curr_instruction == 0xA9){
            this.setAccumulator(this.constant);
        } else if (curr_instruction == 0xAD){
            let address_register = this.mmu.convert_to_li_format();
            let data_register =  this.mmu.readIntermediate(address_register);
            this.setAccumulator(data_register);
        } else if(curr_instruction == 0x8D){
            let address_register = this.mmu.convert_to_li_format();
            let data_register = this.getAccumulator();
            this.mmu.writeIntermediate(address_register, data_register);  
        } else if(curr_instruction == 0x8A){
            let data_register = this.get_x_register();
            this.setAccumulator(data_register);
        }
    }

    public program_log() : void {
        let pc = this.program_counter;
        let ir = this.getInstructionRegister();
        let xr = this.get_x_register();
        let yr = this.get_y_register();
        let a = this.getAccumulator();
        let h = this.mmu.getHighOrderByte();
        let l = this.mmu.getLowOrderByte();
        let c = this.get_curr_instruction();

        console.log("----------------");
        console.log("   PC: " + pc);
        if(typeof c !== 'undefined'){
            console.log("   Curr " + c.toString(16));
        }
        console.log(this.curr_steps);
        console.log("   Instruct Reg: " + ir);
        console.log("   X Reg: " + xr);
        console.log("   Y Reg: " + yr);
        console.log("   Accum: " + a);
        console.log("   Tester " + this.mmu.readIntermediate(0x0040));
        console.log("   low " + l);
        console.log("   high " + h);
        console.log("----------------");
    }

    public pulse() : void {
        assert(!this.mmu.isMemoryEmpty());
        
        if(this.current_node.val === 0){        //case for fetch
            this.current_node = this.current_node.next;
            this.fetch();
        } else if (this.current_node.val === 1){        //case for decode
            if(this.curr_steps === -1){                 //if curr_steps is at -1 then we know theres no need for multiple decodes
                this.current_node = this.current_node.next;
                this.decode();
            } else {                                //else continue to decode until we finish the current SET(2 || 3) of decodes
                this.current_node = this.current_node.next.next;
                this.decode();
            }
        } else if (this.current_node.val === 2) {
            this.current_node = this.current_node.next;
            this.execute();
        }

        this.program_log();
        this.log("recieved clock pulse - CPU Clock Count: " + ++this.cpuClockCount);  //increment count each time and print its pulse
    }

    public log(message: String) : void {
        return super.log(message);
    }

}
