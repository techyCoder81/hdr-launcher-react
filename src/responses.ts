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

    static from(json: string): StringResponse {
        try {
            var object = JSON.parse(json);
            return new StringResponse(object.message, object.id);
        } catch (e) {
            console.error("Could not parse object as StringResponse: " + JSON.stringify(object));
            throw e;
        }
    }

    getMessage(): string {
        return this.message;
    }
}

export class BooleanResponse implements BaseResponse {
    id: string;
    result: boolean;
    
    constructor(value: boolean, id: string) {
        this.result = value;
        this.id = id;
    }

    isOk(): boolean {
        return this.result;
    }

    static from(json: string): BooleanResponse {
        try {
            var object = JSON.parse(json);
            return new BooleanResponse(String(object.result).toLowerCase().includes("true"), object.id);
        } catch (e) {
            console.error("Could not parse object as BooleanResponse: " + JSON.stringify(object));
            throw e;
        }
    }
}

export class OkOrError implements BaseResponse {
    id: string;
    ok: boolean;
    message: string;
    
    constructor(ok: boolean, message: string, id: string) {
        this.ok = ok;
        this.message = message.toString();
        this.id = id;
    }

    static from(json: string): OkOrError {
        try {
            var object = JSON.parse(json);
            return new OkOrError(
                String(object.ok).toLowerCase().includes("true"), 
                object.message, 
                object.id);
        } catch (e) {
            console.error("Could not parse object as OkOrError: " + JSON.stringify(object));
            throw e;
        }
    }

    isOk(): boolean {
        return this.ok;
    }

    getMessage(): string {
        return this.message;
    }
}