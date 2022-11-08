import { Backend } from "../../backend";
import { getInstallType, InstallType, switchToBeta, switchToNightly } from "../../operations/install";
import { PopupData } from "../../operations/popup_data";
import update from "../../operations/update";
import verify from "../../operations/verify";
import { Progress } from "../../progress";
import { NightlyBetaButton } from "../buttons/nightly_beta_button";
import { FocusButton } from "../buttons/focus_button";
import { MenuType } from "../menu";
import { UpdateButton } from "../buttons/update_button";
import { AbstractMenu } from "./abstract_menu";

/**
 * builds the tools menu components
 * @returns the tools menu
 */
export default class ToolsMenu extends AbstractMenu<{setInfo: (info: string) => void, switchTo: (menu: MenuType) => void}> {
    public constructor(props: {setInfo: (info: string) => void, switchTo: (menu: MenuType) => void, version: string}) {
        super(props);
    }

    render(): JSX.Element {
        return <div className="main-menu">
                <FocusButton text='Arcadia&nbsp;&nbsp;' 
                        className={"main-buttons"} 
                        onClick={() => Backend.instance().openModManager()}
                        onFocus={() => this.props.setInfo("Open the Mod Manager")}/>
                <FocusButton text='Verify&nbsp;&nbsp;' 
                        className={"main-buttons"} 
                        onClick={() => {
                                verify((p: Progress) => this.showProgress(p))
                                        .then(() => this.showMenu())
                                        .catch(e => this.showMenu());
                        }}
                        onFocus={() => this.props.setInfo("Verify your HDR files")}
                />
                <NightlyBetaButton setInfo={(info: string) => this.props.setInfo(info)} onClick={
                        async (version: string) => {
                                let installType = getInstallType(version);
                                switch (installType) {
                                        case InstallType.Beta:
                                                await switchToNightly(version, (p: Progress) => this.showProgress(p))
                                                        //.then(() => verify((p: Progress) => this.setProgress(p)))
                                                        .then(() => {alert("Switched successfully!");this.showMenu();})
                                                        .catch(e => {this.showMenu(); alert("Error during nightly switch: " + e)});
                                                break;
                                        case InstallType.Nightly:
                                                await switchToBeta(version, (p: Progress) => this.showProgress(p))
                                                        //.then(() => verify((p: Progress) => this.setProgress(p)))
                                                        .then(() => {alert("Switched successfully!");this.showMenu();})
                                                        .catch(e => {this.showMenu(); alert("Error during beta switch: " + e)});
                                                break;
                                        default:
                                                console.error("Could not switch! Current version is unknown!");
                                                alert("Could not switch! Current version is unknown!");
                                                break;
                                }
                        }
                } />
                <FocusButton text='Main Menu&nbsp;&nbsp;' 
                        className={"main-buttons"} 
                        onClick={() => this.props.switchTo(MenuType.MainMenu)}
                        onFocus={() => this.props.setInfo("Return to the Main menu")}/>
                {super.render()}
        </div>
    }
    
}
