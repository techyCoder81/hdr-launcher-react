import { useRef } from "react";
import { Backend } from "../../operations/backend";
import { StageConfig, stageInfo } from "../../operations/stage_config";
import { FocusButton } from "../buttons/focus_button";
import { FocusCheckbox } from "../buttons/focus_checkbox";



export default function StageEntry(props: {stageName: string, onClick: () => Promise<void>, enabled: boolean, onFocus?: () => Promise<void>}) {
    const selfRef = useRef<HTMLButtonElement>(null);

    return <FocusButton
        key={props.stageName}
        ref={selfRef}
        children={<input className="focus-check" type="checkbox" readOnly checked={props.enabled}/>}
        onClick={() => {return props.onClick();}}
        className={"main-buttons smaller-main-button"}
        text={(stageInfo[props.stageName] ? stageInfo[props.stageName] : props.stageName) + "\u00A0"}
        onFocus={async () => {
            if (props.onFocus !== undefined) {
                await props.onFocus().catch(e => console.log("while handling onfocus for stage entry: " + e));
            }
            if (selfRef != null && Backend.isSwitch()) {
                let sibling = selfRef.current?.nextElementSibling;
                if (sibling !== null && sibling !== undefined) {
                    if (sibling.getBoundingClientRect().top > window.innerHeight - 70) {
                        sibling.scrollIntoView(false);
                    }
                }

                let prev_sibling = selfRef.current?.previousElementSibling;
                if (prev_sibling !== null && prev_sibling !== undefined) {
                    if (prev_sibling.getBoundingClientRect().top < 50) {
                        prev_sibling.scrollIntoView(true);
                    }
                }
            }
        }}
    />
}
