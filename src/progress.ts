export class Progress {
    title: string;
    info: string;
    progress: number | null;
    constructor(title: string, info: string, progress: number | null) {
        this.title = title;
        this.info = info;
        this.progress = progress;
    }
    static from(str: string): Progress {
        let obj = JSON.parse(str);
        return new Progress(obj.title, obj.info, obj.progress);
    }
}