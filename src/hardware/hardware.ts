import { memory } from "console";
import { Memory } from "./Memory";

export class hardware {
    
    idNumber : number; 
    name : String;
    debug : boolean = true;
    time;

    constructor(idNumber : number, name : String){
        
        this.idNumber = idNumber;
        this.name = name;

        this.startSystem();
    }
    

    public log(message: String){
            this.time = new Date().toLocaleString();
            if (message !== null){
                if(this.startSystem()){
                    return console.log("[HW - " + this.name + " ID: " + this.idNumber + " - " + this.time +  "] : " + message);

                } 
            else { return console.log("Debugging is off ::::");}

            }
    
    }
    public hexValue(num: number, length: number) : string {
        //if length is 0 return nothing
        if(length == 0){
            return "";
        }

        if(length < num.toString(16).length){
            return "illegal argument";
        }
        //if number = 0, repeat 0 as many times our length is and that will be our answer
        if(num.toString(16) === "0"){
            return "0".repeat(length);
        }
        //if the length we want is our length already return it
        if(num.toString(16).length == length){
            return num.toString(16);
        }
        let remainderLength : number = 0;

        //make sure there is a positive number of zeros to fill
        if(length - num.toString(16).length > 0){
            //check to see how many zeros to fill
            remainderLength = length - num.toString(16).length;
            let str: string = "";
            for(let j = 0; j < remainderLength; j++){
                str += "0"; //add the zeros to an empty string
            }
            //add the number to the end of the 0s
            str = str + num.toString(16).replace(/^0+/, '').toUpperCase();
            return str;
        }
    }

    public startSystem(): boolean {
        this.debug = true;
        return this.debug;
    }

    public stopSystem(): boolean {
        this.debug = false;
        return this.debug;
    }

}



    







