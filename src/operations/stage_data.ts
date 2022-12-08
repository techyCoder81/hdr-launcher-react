export default class StageData {
    enabled: boolean;
    name_id: string;
    constructor(name: string, enabled: boolean) {
        this.name_id = name;
        this.enabled = enabled;
    }
}