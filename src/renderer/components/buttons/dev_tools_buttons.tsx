import { Progress } from "nx-request-api";
import { useEffect, useState } from "react";
import { Backend } from "renderer/operations/backend";
import * as LauncherConfig from '../../operations/launcher_config';
import { ScrollFocusButton } from "./scroll_focus_button";

export const CloneFolderForDev = (props: {modName: string, setInfo: (info: string) => void, onComplete: () => void, showProgress: (p: Progress) => void, then?: () => Promise<void>}) => {
    const [enabled, setEnabled] = useState(false);
  
    useEffect(() => {
      LauncherConfig.getBoolean('enable_dev_tools')
        .then(enabled => {
          setEnabled(enabled)
        })
        .catch((e) =>
          console.error('Error while if dev tools were enabled: ' + e)
        );
    }, []);
    
    if (enabled) {
        return <ScrollFocusButton
        text={"Create " + props.modName + "-dev\u00A0"}
        className={'smaller-main-button'}
        onClick={async () => {
          try {
            props.showProgress(new Progress("Creating " + props.modName + " folder", "Creating " + props.modName + " folder", 0));
            await Backend.instance().cloneMod(props.modName, props.modName + '-dev');
            if (props.then !== undefined) {
              await props.then();
            }
            props.onComplete();
          } catch (e) {
            alert("Error while cloning " + props.modName + ": " + e);
          }
        }}
        onFocus={() => props.setInfo("Create an " + props.modName + "-dev mod folder from your current " + props.modName + " folder")}
    /> 
    } else {
        return <div/>
    }
}