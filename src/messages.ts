const NO_RESPONSE = "none";

export interface Message {
    message_name(): string;
}

export interface Response {
    response_name(): string;
}

export class Ping implements Message {
    message: string;

    /**
     * creates a ping message
     * @param message the message for this ping
     */
    constructor(message: string) {
        this.message = message;
    }
    public message_name() {return "ping"};
}

export class Exit implements Message {

    /**
     * creates a ping message
     * @param message the message for this ping
     */
    constructor() {
        
    }
    public message_name() {return "exit"};
}

export class Play implements Message {

    /**
     * creates a ping message
     * @param message the message for this ping
     */
    constructor() {
        
    }
    public message_name() {return "play"};
}

export class Pong implements Response {
    message: string;

    /**
     * creates a pong response
     * @param message the response message
     */
    constructor(message: string) {
        this.message = message;
    }
    public response_name() {return "pong"};
}

