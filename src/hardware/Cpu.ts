import {System} from "../System";
import { hardware } from "./hardware";

export class Cpu extends hardware {

    constructor(idNumber: number, name: String) {
        
       super(idNumber, name);
        
       this.startSystem();
    }




    public log(message: String){

        return super.log(message);
    }

    public startSystem(): boolean {

        return super.startSystem();
    }

    public stopSystem(): boolean {

        return super.stopSystem();

    }


}
