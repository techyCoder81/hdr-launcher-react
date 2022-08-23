
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

    constructor(name: string) {
        var id = Message.idCounter;
        Message.idCounter++;
        this.id = Message.idCounter.toString();
        this.call_name = name;
    }

    public getName(): string {
        return this.call_name;
    }

    public getId(): string {
        return this.id;
    }
}

