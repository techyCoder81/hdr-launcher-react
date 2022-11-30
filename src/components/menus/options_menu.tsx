import { FocusButton } from "../buttons/focus_button";
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
                {super.render()}
        </div>
    }
    
}
