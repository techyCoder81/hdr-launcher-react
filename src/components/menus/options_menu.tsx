import { Backend } from "../../backend";
import { switchToBeta, switchToNightly } from "../../operations/install";
import { PopupData } from "../../operations/popup_data";
import update from "../../operations/update";
import { Progress } from "../../progress";
import { FocusButton } from "../focus_button";
import { MenuType } from "../menu";
import { UpdateButton } from "../update_button";
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
                {
                this.props.version.toLowerCase().includes("nightly") ? 
                <FocusButton text='Install Beta&nbsp;&nbsp;' 
                        className={"main-buttons"} 
                        onClick={async () => {
                                await switchToBeta(this.props.version, (p: Progress) => this.showProgress(p))
                                        //.then(() => verify((p: Progress) => this.setProgress(p)))
                                        .then(() => {alert("Switched successfully!");this.showMenu()})
                                        .catch(e => {this.showMenu(); alert("Error during beta switch: " + e)});
                        }}
                        onFocus={() => this.props.setInfo("Switch to the Beta version of HDR")}
                /> :
                <FocusButton text='Install Nightly&nbsp;&nbsp;' 
                        className={"main-buttons"} 
                        onClick={async () => {
                                await switchToNightly(this.props.version, (p: Progress) => this.showProgress(p))
                                        //.then(() => verify((p: Progress) => this.setProgress(p)))
                                        .then(() => {alert("Switched successfully!");this.showMenu();})
                                        .catch(e => {this.showMenu(); alert("Error during nightly switch: " + e)});
                        }}
                        onFocus={() => this.props.setInfo("Switch to the Nightly version of HDR")}
                />
                }
                <FocusButton text='Main Menu&nbsp;&nbsp;' 
                        className={"main-buttons"} 
                        onClick={() => this.props.switchTo(MenuType.MainMenu)}
                        onFocus={() => this.props.setInfo("Return to the Main menu")}/>
                {super.render()}
        </div>
    }
    
}
