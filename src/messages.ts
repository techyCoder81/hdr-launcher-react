const NO_RESPONSE = "none";

/**
 * base message class
 */
export class Message {
    /** static counter for unique IDs */
    static idCounter = 0;

    /** the unique ID for this message */
    id: string;

    /** the name of the call to be made */
    name: string;

    constructor(name: string) {
        var id = Message.idCounter;
        Message.idCounter++;
        this.id = Message.idCounter.toString();
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    getId(): string {
        return this.id;
    }
}