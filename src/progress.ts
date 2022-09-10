export class Progress {
    title: string;
    info: string;
    progress: string;
    constructor(title: string, info: string, progress: string) {
        this.title = title;
        this.info = info;
        this.progress = progress;
    }
    static from(str: string): Progress {
        let obj = JSON.parse(str);
        return new Progress(obj.title, obj.info, obj.progress);
    }
}