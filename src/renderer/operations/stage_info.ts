import { Backend } from "./backend";

export type Blastzones = {
  top: number;
  side: number;
  bottom: number;
}

export type Stage = { 
  nameId: string;
  displayName: string;
  blastzones: Blastzones;
  centerX: number;
  centerY: number;
};

export class StageInfo {
  constructor() {}
  private static stages: Map<string, Stage> = new Map<string, Stage>();
  private static names: string[] = [];

  async get(nameId: string): Promise<Stage> {
    if (!nameId) {
      throw new Error("nameId was not valid!");
    }
    if (!StageInfo.stages.has(nameId)) {
      let stage = (await Backend.instance().getJson('http://104.197.20.53:8080/BETA/stages/' + nameId)).stageInfo as Stage;
      console.info("retreived stage data: " + JSON.stringify(stage));
      StageInfo.stages.set(nameId, stage);
    }
    return StageInfo.stages.get(nameId)!;
  }
  async list(): Promise<string[]> {
    if (StageInfo.names.length == 0) {
      let list: any[] = await Backend.instance().getJson('http://104.197.20.53:8080/BETA/stages');
      StageInfo.names = list.map(entry => entry.nameId);
    }
    return StageInfo.names;
  }
}