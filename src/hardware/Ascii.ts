export class Ascii {

    private static Dictionary : Map<number, string> = new Map<number, string>();
    /*
    since we have a one to one mapping, with each ascii code having a corresponding character and
    vice versa, we will use a hashmap to decrease ambiguity. Rather than have 2 two large if else blocks
    we can create the map once, and use the functions belowe to get the key(number) or value(string) for the desired output
    */

    /*
        type script does not have a character type that is why we will simply use string
    */
    public static fromCharCode(asciNum : number) : string {

        Ascii.populateMap();

        for (const [key, value] of Ascii.Dictionary.entries()) {

            if(key === asciNum){
                return value;
            }
        }

        throw new Error("No Corresponding Asci Char");

    }

    public static fromAsciiCode(char : string) : number {
        Ascii.populateMap();

        for (const [key, value] of Ascii.Dictionary.entries()) {

            if(value === char){
                return key;
            }
        }

        throw new Error("No Corresponding Asci Number");
    }


    private static populateMap() : void{

        Ascii.Dictionary.set(0x0A, "\n");

        Ascii.Dictionary.set(0x20, " ");
        Ascii.Dictionary.set(0x21, "!");
        Ascii.Dictionary.set(0x22, '"');
        Ascii.Dictionary.set(0x23, "#");
        Ascii.Dictionary.set(0x24, "$");
        Ascii.Dictionary.set(0x25, "%");
        Ascii.Dictionary.set(0x26, "&");
        Ascii.Dictionary.set(0x27, "'");
        Ascii.Dictionary.set(0x28, "(");
        Ascii.Dictionary.set(0x29, ")");
        Ascii.Dictionary.set(0x2A, "*");
        Ascii.Dictionary.set(0x2B, "+");
        Ascii.Dictionary.set(0x2C, ",");
        Ascii.Dictionary.set(0x2D, "-");
        Ascii.Dictionary.set(0x2E, ".");
        Ascii.Dictionary.set(0x2F, "/");

        Ascii.Dictionary.set(0x30, "0");
        Ascii.Dictionary.set(0x31, "1");
        Ascii.Dictionary.set(0x32, "2");
        Ascii.Dictionary.set(0x33, "3");
        Ascii.Dictionary.set(0x34, "4");
        Ascii.Dictionary.set(0x35, "5");
        Ascii.Dictionary.set(0x36, "6");
        Ascii.Dictionary.set(0x37, "7");
        Ascii.Dictionary.set(0x38, "8");
        Ascii.Dictionary.set(0x39, "9");

        Ascii.Dictionary.set(0x3A, ":");
        Ascii.Dictionary.set(0x3B, ";");
        Ascii.Dictionary.set(0x3C, "<");
        Ascii.Dictionary.set(0x3D, "=");
        Ascii.Dictionary.set(0x3E, ">");
        Ascii.Dictionary.set(0x3F, "?");
        Ascii.Dictionary.set(0x40, "@");

        Ascii.Dictionary.set(0x41, "A");
        Ascii.Dictionary.set(0x42, "B");
        Ascii.Dictionary.set(0x43, "C");
        Ascii.Dictionary.set(0x44, "D");
        Ascii.Dictionary.set(0x45, "E");
        Ascii.Dictionary.set(0x46, "F");
        Ascii.Dictionary.set(0x47, "G");
        Ascii.Dictionary.set(0x48, "H");
        Ascii.Dictionary.set(0x49, "I");
        Ascii.Dictionary.set(0x4A, "J");
        Ascii.Dictionary.set(0x4B, "K");
        Ascii.Dictionary.set(0x4C, "L");
        Ascii.Dictionary.set(0x4D, "M");
        Ascii.Dictionary.set(0x4E, "N");
        Ascii.Dictionary.set(0x4F, "O");
        Ascii.Dictionary.set(0x50, "P");
        Ascii.Dictionary.set(0x51, "Q");
        Ascii.Dictionary.set(0x52, "R");
        Ascii.Dictionary.set(0x53, "S");
        Ascii.Dictionary.set(0x54, "T");
        Ascii.Dictionary.set(0x55, "U");
        Ascii.Dictionary.set(0x56, "V");
        Ascii.Dictionary.set(0x57, "W");
        Ascii.Dictionary.set(0x58, "X");
        Ascii.Dictionary.set(0x59, "Y");
        Ascii.Dictionary.set(0x5A, "Z");

        Ascii.Dictionary.set(0x5B, "[");
        Ascii.Dictionary.set(0x5D, "]");
        Ascii.Dictionary.set(0x5E, "^");
        Ascii.Dictionary.set(0x5F, "_");
        Ascii.Dictionary.set(0x60, "`");

        Ascii.Dictionary.set(0x61, "a");
        Ascii.Dictionary.set(0x62, "b");
        Ascii.Dictionary.set(0x63, "c");
        Ascii.Dictionary.set(0x64, "d");
        Ascii.Dictionary.set(0x65, "e");
        Ascii.Dictionary.set(0x66, "f");
        Ascii.Dictionary.set(0x67, "g");
        Ascii.Dictionary.set(0x68, "h");
        Ascii.Dictionary.set(0x69, "i");
        Ascii.Dictionary.set(0x6A, "j");
        Ascii.Dictionary.set(0x6B, "k");
        Ascii.Dictionary.set(0x6C, "l");
        Ascii.Dictionary.set(0x6D, "k");
        Ascii.Dictionary.set(0x6E, "n");
        Ascii.Dictionary.set(0x6F, "o");
        Ascii.Dictionary.set(0x70, "p");
        Ascii.Dictionary.set(0x71, "q");
        Ascii.Dictionary.set(0x72, "r");
        Ascii.Dictionary.set(0x73, "s");
        Ascii.Dictionary.set(0x74, "t");
        Ascii.Dictionary.set(0x75, "u");
        Ascii.Dictionary.set(0x76, "v");
        Ascii.Dictionary.set(0x77, "w");
        Ascii.Dictionary.set(0x78, "x");
        Ascii.Dictionary.set(0x79, "y");
        Ascii.Dictionary.set(0x7A, "z");

        Ascii.Dictionary.set(0x7B, "{");
        Ascii.Dictionary.set(0x7C, "|");
        Ascii.Dictionary.set(0x7D, "}");
        Ascii.Dictionary.set(0x7F, "~");        
    }
}