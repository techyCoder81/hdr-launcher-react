
/**
 * base message class
 */
export class Message {
    /** static counter for unique IDs */
    static idCounter = 0;

    /** the unique ID for this message */
    id: string;

    /** the name of the call to be made */
    call_name: string;

    /** potentially a structure of arguments */
    arguments: string[] | null;

    constructor(name: string, args: string[] | null) {
        var id = Message.idCounter;
        Message.idCounter++;
        this.id = Message.idCounter.toString();
        this.call_name = name;
        this.arguments = args;
    }

    public getName(): string {
        return this.call_name;
    }

    public getId(): string {
        return this.id;
    }
}

