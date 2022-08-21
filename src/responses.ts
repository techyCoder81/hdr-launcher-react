export interface BaseResponse {
    
}

export class StringResponse implements BaseResponse {
    message: string;

    /**
     * creates a string response
     * @param message the string response message
     */
    constructor(message: string) {
        this.message = message;
    }

    getMessage(): string {
        return this.message;
    }
}

export class BooleanResponse implements BaseResponse {
    result: string;

    constructor(value: boolean) {
        this.result = value.toString();
    }

    isOk(): boolean {
        return this.result.toLowerCase().includes("true");
    }
}