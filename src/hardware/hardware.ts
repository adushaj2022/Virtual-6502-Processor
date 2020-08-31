
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
        
        else {

            return console.log("Debugging is off ::::");

        }
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



<<<<<<< HEAD
}
=======


    





}
>>>>>>> 67a8cca27a236805b8841912c7df35ebb255b935
