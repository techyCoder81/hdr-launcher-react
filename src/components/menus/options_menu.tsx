import * as config from "../../operations/launcher_config";
import { Backend } from "../../operations/backend";
import { FocusButton } from "../buttons/focus_button";
import { FocusCheckbox } from "../buttons/focus_checkbox";
import { MenuType } from "../menu";
import { AbstractMenu } from "./abstract_menu";

/**
 * builds the options menu components
 * @returns the options menu
 */
export default class OptionsMenu extends AbstractMenu<{setInfo: (info: string) => void, switchTo: (menu: MenuType) => void, version: string}> {
    public constructor(props: {setInfo: (info: string) => void, switchTo: (menu: MenuType) => void, version: string}) {
        super(props);
    }

    render(): JSX.Element {
        return <div className="main-menu">
            <FocusButton text={'\u21e0 Main Menu\u00A0'} 
                    className={"main-buttons"} 
                    onClick={() => this.props.switchTo(MenuType.MainMenu)}
                    onFocus={() => this.props.setInfo("Return to the Main menu")}/>
            {
            Backend.isSwitch() ? <FocusCheckbox 
                onClick={async () => {
                    let enabled = await config.getBoolean("skip_launcher");
                    await config.setBoolean("skip_launcher", !enabled);
                }} 
                checkStatus={async () => {
                    return await config.getBoolean("skip_launcher");
                }} 
                text={"Skip Launcher\u00A0"}
                onFocus={() => this.props.setInfo("Skip the launcher on boot unless updates are available.")}/> 
            : <div/>}
            <FocusCheckbox 
                onClick={async () => {
                    let enabled = await config.getBoolean("ignore_music");
                    await config.setBoolean("ignore_music", !enabled);
                }} 
                checkStatus={async () => {
                    return await !config.getBoolean("ignore_music");
                }} 
                text={"Verify Music\u00A0"}
                onFocus={() => this.props.setInfo("Disable this if you wish to use music mods which conflict with HDR.")}/> 
            {super.render()}
        </div>
    }
    
}
