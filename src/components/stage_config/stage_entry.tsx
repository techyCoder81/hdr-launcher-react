import { useRef } from "react";
import { Backend } from "../../operations/backend";
import { StageConfig } from "../../operations/stage_config";
import { FocusButton } from "../buttons/focus_button";
import { FocusCheckbox } from "../buttons/focus_checkbox";


export default function StageEntry(props: {stageName: string, onClick: () => Promise<void>, enabled: boolean}) {
    const selfRef = useRef<HTMLButtonElement>(null);

    return <FocusButton
        ref={selfRef}
        children={<input className="focus-check" type="checkbox" readOnly checked={props.enabled}/>}
        onClick={() => {return props.onClick();}}
        className={"main-buttons smaller-main-button"}
        text={props.stageName + "\u00A0"}
        onFocus={() => {
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
