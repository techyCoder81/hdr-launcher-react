export interface BaseResponse {
    
}

export class StringResponse implements BaseResponse {
    id: string;
    message: string;
    
    /**
     * creates a string response
     * @param message the string response message
     */
    constructor(message: string, id: string) {
        this.message = message;
        this.id = id;
    }

    getMessage(): string {
        return this.message;
    }
}

export class BooleanResponse implements BaseResponse {
    id: string;
    result: string;
    
    constructor(value: boolean, id: string) {
        this.result = value.toString();
        this.id = id;
    }

    isOk(): boolean {
        return this.result.toLowerCase().includes("true");
    }
}