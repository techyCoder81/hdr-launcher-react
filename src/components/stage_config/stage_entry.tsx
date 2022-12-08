import { StageConfig } from "../../operations/stage_config";
import { FocusButton } from "../buttons/focus_button";
import { FocusCheckbox } from "../buttons/focus_checkbox";


export default function StageEntry(props: {stageName: string, onClick: () => Promise<void>, enabled: boolean}) {
    return <FocusButton
        children={<input className="focus-check" type="checkbox" readOnly checked={props.enabled}/>}
        onClick={() => {return props.onClick();}}
        className={"main-buttons smaller-main-button"}
        text={props.stageName + "\u00A0"}
    />
}
