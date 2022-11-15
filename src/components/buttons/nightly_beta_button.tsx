import { useEffect, useState } from "react";
import { Backend } from "../../operations/backend";
import { FocusButton } from "./focus_button";

export const NightlyBetaButton = (props: {setInfo: (info: string) => void, onClick: (version: string) => void}) => {
    const [version, setVersion] = useState('...');
    
    useEffect(() => {
        Backend.instance()
            .getVersion()
            .then(version => {
                setVersion(version)
            })
            .catch(e => console.error("Error while loading version for switch button: " + e));
    }, []);

    let buttonText = "Unk";
    if (version.toLowerCase().includes("nightly")) {
        buttonText = "Beta";
    } else if (version.toLowerCase().includes("beta")) {
        buttonText = "Nightly";
    }

    return <FocusButton text={'Install ' + buttonText + '\u00A0'} 
        className={"main-buttons"} 
        onClick={async () => {
            props.onClick(version);
        }}
        onFocus={() => props.setInfo("Switch to the " + buttonText + " version of HDR")}
    />
}