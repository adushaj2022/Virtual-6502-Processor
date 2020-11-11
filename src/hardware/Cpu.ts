import { throws } from "assert";
import { hardware } from "./hardware";
import { ClockListener } from "./imp/ClockListener";
import { Mmu } from "./Mmu";

export class Cpu extends hardware implements ClockListener {

    private accumulator : number;
    private x_register : number;
    private y_register : number;
    private insuction_register : number;
    private program_counter = 0;
    private constant : number;
    public cpuClockCount : number = 0;
    public curr_instruction : number;

    public mmu : Mmu = new Mmu(0, "MMU");   //this is how we access memory; through the MMU

    constructor(idNumber: number, name: String) {
       super(idNumber, name);
       this.init_program();
    }


    public init_program() : void {

        this.mmu.writeIntermediate(0x0000, 0xA9);
        this.mmu.writeIntermediate(0x0001, 0x0D);
        this.mmu.writeIntermediate(0x0002, 0xA9);
        this.mmu.writeIntermediate(0x0003, 0x1D);
        this.mmu.writeIntermediate(0x0004, 0xA9);
        this.mmu.writeIntermediate(0x0005, 0x2D);
        this.mmu.writeIntermediate(0x0006, 0xA9);
        this.mmu.writeIntermediate(0x0007, 0x3F);
        this.mmu.writeIntermediate(0x0008, 0xA9);
        this.mmu.writeIntermediate(0x0009, 0xFF);
        this.mmu.writeIntermediate(0x000A, 0x00);
        this.mmu.memoryDump(0x0000, 0x000A);
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
        let curr_steps : number;

        if(curr_instruction == 0xA9){           //first block to get instruction
            this.setInsctrutionRegister(0xA9);
        } else if(curr_instruction == 0xAD){
            this.setInsctrutionRegister(0xAD);
            curr_steps = 0;
        } else if(curr_instruction == 0x8D){
            this.setInsctrutionRegister(0x8D);
            curr_steps = 0;
        } else if(curr_instruction == 0x8A) {
            this.setInsctrutionRegister(0x8A);
            this.execute();
        }
    
        //etc .. .. . . 

        if(this.getInstructionRegister() == 0xA9 && curr_instruction != 0xA9){      //second block to see if we have multiple decodes
            this.constant = curr_instruction;
            this.execute();
        } else if(this.getInstructionRegister() == 0xAD && curr_instruction != 0xAD) {
            ++curr_steps;
            if(curr_steps == 1){
                this.mmu.setLowOrderByte(curr_instruction);
            } else if(curr_steps == 2) {
                this.mmu.setHighOrderByte(curr_instruction);
                this.execute();
            }
        } else if(this.getInstructionRegister() == 0x8D && curr_instruction != 0xAD){
            ++curr_steps;
            if(curr_steps == 1){
                this.mmu.setLowOrderByte(curr_instruction);
            } else if(curr_steps == 2){
                this.mmu.setHighOrderByte(curr_instruction);
                this.execute();
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
            let address_register = this.getAccumulator();
            let data_register = this.mmu.readIntermediate(address_register);
            this.mmu.writeIntermediate(address_register, data_register);  
        } else if(curr_instruction == 0x8A){
            let data_register = this.get_x_register();
            this.setAccumulator(data_register);
        }
    }

    public program_log() : void {
        let pc = this.program_counter;
        let ir = this.hexValue(this.getInstructionRegister(), 2);
        let xr = this.get_x_register();
        let yr = this.get_y_register();
        console.log("PC: " + pc);
        console.log("Instruct Reg: " + ir);
        console.log("X Reg: " + xr);
        console.log("Y Reg: " + yr);
    }


    public pulse(): void {

        this.fetch();
        this.decode();
        this.program_log();
        this.log("recieved clock pulse - CPU Clock Count: " + ++this.cpuClockCount);  //increment count each time and print its pulse
    }

    public log(message: String) : void {
        return super.log(message);
    }

}
