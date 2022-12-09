import { useEffect, useState } from "react"
import { Backend } from "../../operations/backend";
import { StageConfig } from "../../operations/stage_config";
import StageData from "../../operations/stage_data";
import { FocusButton } from "../buttons/focus_button";
import { ExpandSidebar } from "../expand_sidebar";
import StageEntry from "./stage_entry";

export default function StageConfigMenu(props: {onComplete: () => void}) {
    const [stageData, setStageData] = useState([] as StageData[]);
    const [changed, setChanged] = useState(false);

    useEffect(() => {
        StageConfig.instance().getAll()
            .then(stages => setStageData(stages))
            .catch(e => alert(e));
    }, []);

    return <div className={"overlay-progress full scroll-hidden"}>
        <div className="border-bottom">
            <FocusButton className="simple-button-bigger" onClick={async () => {
                if (changed) {
                    let result = confirm("Would you like to save your changes?");
                    if (result) {
                        await StageConfig.instance()
                            .save()
                            .then(() => alert("changes saved successfully"))
                            .then(() => setChanged(false))
                            .then(() => StageConfig.instance().unload())
                            .catch(e => alert("eror during save: " + e));
                    }
                }
                props.onComplete();
            }} text={"Done"}/>
            <FocusButton className="simple-button-bigger" onClick={async () => {
                StageConfig.instance().setAll(true)
                    .then(() => setChanged(true))
                    .then(() => StageConfig.instance().getAll())
                    .then(stages => setStageData(stages))
                    .catch(e => alert(e))
            }} text="Enable All"/>
            <FocusButton className="simple-button-bigger" onClick={async () => {
                StageConfig.instance().setAll(false)
                .then(() => setChanged(true))
                .then(() => StageConfig.instance().getAll())
                .then(stages => setStageData(stages))
                .catch(e => alert(e))
            }} text="Disable All"/>
            <FocusButton className="simple-button-bigger" onClick={async () => {
                let result = confirm("Are you sure you wish to reset to defaults?");
                if (result) {
                    await Backend.instance()
                        .resetStageXml()
                        .then(() => StageConfig.instance().unload())
                        .then(() => setChanged(true))
                        .then(() => StageConfig.instance().getAll())
                        .then(stages => setStageData(stages))
                        .then(() => alert("Stages have been reset to defaults!"))
                        .catch(e => alert("eror during save: " + e));
                }
            }} text={"Reset Defaults"}/>
            {changed ? 
            <FocusButton className="simple-button-bigger" onClick={async () => {
                let result = confirm("Would you like to save your changes?");
                if (result) {
                    await StageConfig.instance()
                        .save()
                        .then(() => setChanged(false))
                        .then(() => alert("changes saved successfully"))
                        .catch(e => alert("eror during save: " + e));
                }
            }} text={"Save"}/> : <div/>}
        </div>
        <div className="scrolling-fit">
            {
                stageData.map(stage => <StageEntry onClick={() => {
                    return StageConfig.instance().toggle(stage.name_id)
                        .then(() => setChanged(true))
                        .then(async () => setStageData(await StageConfig.instance().getAll()))
                        .catch(e => alert(e));
                }} enabled={stage.enabled} stageName={stage.name_id}/>)
            }
        </div>
        <ExpandSidebar/>
    </div>
}