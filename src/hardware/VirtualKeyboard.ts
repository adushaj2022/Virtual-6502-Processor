import {Hardware} from "./Hardware";
import { priority } from "./Priority";
import {Interrupt} from "./imp/Interrupt";
import {InterruptController} from "./InterruptController";
import PriorityQueue from 'javascript-priority-queue';
     
export class VirtualKeyboard extends Hardware implements Interrupt {

    public name: string;
    public irq: number;
    public priority: priority;
    public output_buffer : PriorityQueue;
    private interruptController: InterruptController;

    constructor(interruptController: InterruptController) {
        super(0, "VKB");
     
        this.name = "Keyboard";
        this.irq = 0;                                       // IRQ num is assigned by the controller
        this.priority = priority.REGULAR;
        this.output_buffer = new PriorityQueue('max');      //initialize input buffer

        this.interruptController = interruptController;
            
        this.monitorKeys();
        this.log("Created");
    }
               
    private monitorKeys() {
        /*
        character stream from stdin code (most of the contents of this function) taken from here
        https://stackoverflow.com/questions/5006821/nodejs-how-to-read-keystrokes-from-stdin
     
        This takes care of the simulation we need to do to capture stdin from the console and retrieve the character.
        Then we can put it in the buffer and trigger the interrupt.
        */
        var stdin = process.stdin;
     
        // without this, we would only get streams once enter is pressed
        //stdin.setRawMode( true );
     
            
        if(process.stdin.isTTY) {
            process.stdin.setRawMode(true);
        }
             
        // resume stdin in the parent process (node app won't quit all by itself
        // unless an error or process.exit() happens)
        stdin.resume();
     
    
        stdin.setEncoding(null);
     
     
        stdin.on( 'data', function( key ){
            
            let keyPressed: String = key.toString();
     
            this.log("Key pressed - " + keyPressed);
     
            // ctrl-c ( end of text )
            // this let's us break out with ctrl-c
            if ( key.toString() === '\u0003' ) {
                process.exit();
            }
                
            // write the key to stdout all normal like
            //process.stdout.write( key);
            // put the key value in the buffer
            // your code here
            this.output_buffer.enqueue(key, this.priority);

                 // set the interrupt!
            this.interruptController.acceptInterrupt(this);
     
                 // .bind(this) is required when running an asynchronous process in node that wishes to reference an
                 // instance of an object.
        }.bind(this));
         
    }
}