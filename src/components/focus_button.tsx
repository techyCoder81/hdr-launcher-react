import React from "react";
import FocusTimer from "../operations/focus_singleton";

function FocusButtonInner(props: {className: string, onClick: () => void, text: string, autofocus?: boolean}) {
    return <button 
            className={props.className} 
            autoFocus={props.autofocus}
            onMouseOver={ e => e.currentTarget.focus() } 
            onMouseLeave={e => e.currentTarget.blur() }
            onBlur={e => {
                // if it hasn't been long enough since
                // the last focus transition, refocus
                // on the existing focused component.
                if (!FocusTimer.request()) {
                    e.currentTarget.focus();
                }
            }}
            onClick={props.onClick}
        >
            <div>{props.text}</div>
        </button>
}

export const FocusButton = React.memo(FocusButtonInner);