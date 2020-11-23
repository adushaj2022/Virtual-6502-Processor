
export class Hardware {
    
    public idNumber : number; 
    public name : String;
    public debug : boolean = true;
    public static clock_switch: boolean = true;
    private time : string;

    constructor(idNumber : number, name : String){
        this.idNumber = idNumber;
        this.name = name;
    }
    
    public getStatus() : boolean {
        return Hardware.clock_switch;
    }

    public setStatus(bool : boolean) : void{
        Hardware.clock_switch = bool;
    }

    //method to turn decimal into hex, rather than typing toString(16) and to Upper everytime
    public toHex(decimal : number) : string {
        return decimal.toString(16).toUpperCase();
    }


    //toString(16).toUpperCase() will simply make num a hex number
    //padStart will add the necescary amount of 0s to satisfy our needed length
    public hexValue(num: number, len: number) : string {
        return num.toString(16).toUpperCase().padStart(len,'0');
    }

        //log statement that all devices will use
    public log(message: String): void {
        this.time = new Date().toLocaleString();
        if (message !== null){
            if(this.debug){
                return console.log("[HW - " + this.name + " ID: " + this.idNumber + " - " + this.time +  "] : " + message);

            }
            else { 
                return console.log("Debugging is off for: " + this.name);
            }           
        }
    }
}



    







