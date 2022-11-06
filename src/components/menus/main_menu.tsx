import { Backend } from "../../backend";
import { PopupData } from "../../operations/popup_data";
import update from "../../operations/update";
import { Progress } from "../../progress";
import { FocusButton } from "../focus_button";
import { MenuType } from "../menu";
import { UpdateButton } from "../update_button";
import { AbstractMenu } from "./abstract_menu";

/**
 * builds the main menu components
 * @returns the main menu
 */
export default class MainMenu extends AbstractMenu<{setInfo: (info: string) => void, switchTo: (menu: MenuType) => void}> {
    public constructor(props: {setInfo: (info: string) => void, switchTo: (menu: MenuType) => void}) {
        super(props);
    }

    render(): JSX.Element {
        return <div className="main-menu" id="menu">
            <FocusButton text='Play&nbsp;&nbsp;' 
                    className={"main-buttons"} 
                    onClick={() => Backend.instance().play()}
                    autofocus={Backend.isSwitch()}
                    onFocus={() => this.props.setInfo("Play HDR!")}/>
            <UpdateButton 
                    onClick={() => {
                        update((p: Progress) => this.showProgress(p))
                            .then(text => {
                                console.info("finished updating");    
                                this.showMenu();
                                this.showPopupData(new PopupData(['Ok'], text.join("\n"), () => this.showMenu()));
                            })
                            .catch(e => {alert("Error while updating: " + e);this.showMenu()});
                    }}
                    onFocus={() => this.props.setInfo("Update your HDR Installation")}
            />
            <FocusButton text='Options&nbsp;&nbsp;' 
                    className={"main-buttons"} 
                    onClick={() => this.props.switchTo(MenuType.Options)}
                    onFocus={() => this.props.setInfo("Open the Options menu")}/>
            <FocusButton text='Tools&nbsp;&nbsp;' 
                    className={"main-buttons"} 
                    onClick={() => this.props.switchTo(MenuType.Tools)}
                    onFocus={() => this.props.setInfo("Open the Tools menu")}/>
            <FocusButton text='Exit&nbsp;&nbsp;' 
                    className={"main-buttons"} 
                    onClick={() => Backend.instance().quit()}
                    onFocus={() => this.props.setInfo("Exit the game")}/>
            {super.render()}
    </div>
    }
    
}
