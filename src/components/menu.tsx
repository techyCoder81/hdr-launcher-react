import * as React from 'react';
import { Backend, NodeBackend } from "../backend";
import update from '../operations/update';
import verify from '../operations/verify';
import { installLatest, switchToBeta, switchToNightly } from '../operations/install';
import { Progress } from '../progress';
import {ProgressDisplay} from './progress_bar';
import "../styles/progress.css";
import {FocusButton} from './focus_button';
import * as skyline from "../skyline";
import InfoBox from './info_box';
import Sidebar from './sidebar';
import { Header } from './header';
import logo from '../../assets/logo_full.png';
import {UpdateButton} from './update_button';

type Props = {
        onUpdate: () => void;
};

enum MenuType {
        MainMenu,
        Options,
        Tools,
        NotInstalled,
        CheckingInstalled,
        Progress,
}

/**
 * main menu implementation
 */
export default class Menu extends React.PureComponent<Props> {
        state = { 
                currentMenu: MenuType.CheckingInstalled,
                progress: null,
                version: "unknown",
                info: "  ",
        }

        private updateParent;

        switchTo(menu: MenuType) {
                this.updateParent();
                this.setState({currentMenu: menu, progress: null, version: this.state.version, info: this.state.info});
                
                // assign button actions for switch
                skyline.setButtonAction("X", () => {})
                switch(this.state.currentMenu) {
                        case MenuType.Options:
                                skyline.setButtonAction("B", () => this.switchTo(MenuType.MainMenu));
                                break;
                        case MenuType.Tools:
                                skyline.setButtonAction("B", () => this.switchTo(MenuType.MainMenu));
                                break;
                        default:
                                skyline.setButtonAction("B", () => {});
                                break;
                }
        }

        setVersion(version: string) {
                console.info("setting version: " + version);
                this.setState({
                        currentMenu: this.state.currentMenu, 
                        progress: this.state.progress, 
                        version: version,
                        info: this.state.info
                });
        }

        loadVersion() {
                Backend.instance()
                        .getVersion()
                        .then(ver => {console.info("loaded version: " + ver);this.setVersion(ver);})
                        .then(() => this.updateParent())
                        .catch(e => console.error("console error: " + e));
        }

        setProgress(progress: Progress) {
                this.setState({
                        currentMenu: this.state.currentMenu, 
                        progress: progress,
                        version: this.state.version,
                        info: this.state.info
                });
        }

        setInfo(info: string) {
                this.setState({
                        currentMenu: this.state.currentMenu, 
                        progress: this.state.progress,
                        version: this.state.version,
                        info: info
                });
        }

        public constructor(props: Props) {
                super(props);
                this.updateParent = props.onUpdate;
        }

        /**
         * builds the main menu components
         * @returns the main menu
         */
        mainMenu(): JSX.Element {
                return <div className="main-menu" id="menu">
                        <FocusButton text='Play&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().play()}
                                autofocus={Backend.isSwitch()}
                                onFocus={() => this.setInfo("Play HDR!")}/>
                        <UpdateButton 
                                onClick={() => {
                                        this.switchTo(MenuType.Progress);
                                        update((p: Progress) => this.setProgress(p))
                                                .then(() => this.loadVersion())
                                                .then(() => {
                                                        this.switchTo(MenuType.MainMenu);
                                                        alert("HDR is up to date!");
                                                })
                                                .catch(e => alert("Error while updating: " + e));
                                }}
                                onFocus={() => this.setInfo("Update your HDR Installation")}
                        />
                        <FocusButton text='Options&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => this.switchTo(MenuType.Options)}
                                onFocus={() => this.setInfo("Open the Options menu")}/>
                        <FocusButton text='Tools&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => this.switchTo(MenuType.Tools)}
                                onFocus={() => this.setInfo("Open the Tools menu")}/>
                        <FocusButton text='Exit&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().quit()}
                                onFocus={() => this.setInfo("Exit the game")}/>
                </div>
        }

        /**
         * builds the options menu components
         * @returns the options menu
         */
        optionsMenu(): JSX.Element {
                
                return <div className="main-menu">
                        {
                        this.state.version.toLowerCase().includes("nightly") ? 
                        <FocusButton text='Install Beta&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={async () => {
                                        this.switchTo(MenuType.Progress);
                                        await switchToBeta(this.state.version, (p: Progress) => this.setProgress(p))
                                                //.then(() => verify((p: Progress) => this.setProgress(p)))
                                                .then(() => this.loadVersion())
                                                .then(() => {alert("Switched successfully!");this.switchTo(MenuType.MainMenu);})
                                                .catch(e => {this.switchTo(MenuType.MainMenu); alert("Error during beta switch: " + e)});
                                }}
                                onFocus={() => this.setInfo("Switch to the Beta version of HDR")}
                        /> :
                        <FocusButton text='Install Nightly&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={async () => {
                                        this.switchTo(MenuType.Progress);
                                        await switchToNightly(this.state.version, (p: Progress) => this.setProgress(p))
                                                //.then(() => verify((p: Progress) => this.setProgress(p)))
                                                .then(() => this.loadVersion())
                                                .then(() => {alert("Switched successfully!");this.switchTo(MenuType.MainMenu);})
                                                .catch(e => {this.switchTo(MenuType.MainMenu); alert("Error during nightly switch: " + e)});
                                }}
                                onFocus={() => this.setInfo("Switch to the Nightly version of HDR")}
                        />
                        }
                        <FocusButton text='Main Menu&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => this.switchTo(MenuType.MainMenu)}
                                onFocus={() => this.setInfo("Return to the Main menu")}/>
                </div>
        }   
        
        /**
         * builds the options menu components
         * @returns the options menu
         */
         toolsMenu(): JSX.Element {
                
                return <div className="main-menu">
                        <FocusButton text='Arcadia&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().openModManager()}
                                onFocus={() => this.setInfo("Open the Mod Manager")}/>
                        <FocusButton text='Verify&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => {
                                        this.switchTo(MenuType.Progress);
                                        verify((p: Progress) => this.setProgress(p))
                                                .then(() => this.switchTo(MenuType.MainMenu))
                                                .catch(e => this.switchTo(MenuType.MainMenu));
                                }}
                                onFocus={() => this.setInfo("Verify your HDR files")}
                        />
                        <FocusButton text='Main Menu&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => this.switchTo(MenuType.MainMenu)}
                                onFocus={() => this.setInfo("Return to the Main menu")}/>
                </div>
        }   
        
        /**
         * builds the not installed menu
         * @returns the "not installed" menu
         */
         notInstalledMenu(): JSX.Element {
                
                return <div id="menu">
                        <div className="main-menu">
                        <FocusButton text='Play Vanilla&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().play()}
                                onFocus={() => this.setInfo("Play vanilla Ultimate")}/>
                        
                        <FocusButton text='Install HDR&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={async () => {
                                        this.switchTo(MenuType.Progress);
                                        await installLatest((p: Progress) => this.setProgress(p))
                                                .then(() => verify((p: Progress) => this.setProgress(p)))
                                                .then(() => this.loadVersion())
                                                .then(() => this.switchTo(MenuType.MainMenu))
                                                .catch(e => {
                                                        this.switchTo(MenuType.MainMenu);
                                                        console.error("Error while installing latest HDR.");
                                                });
                                        this.switchTo(MenuType.CheckingInstalled);
                                        this.checkInstalled();
                                }}
                                onFocus={() => this.setInfo("Install the latest version of HDR")}
                        />
                        
                        </div>
                </div>
        }   
        
        /**
         * builds the progress bar view
         * @returns the progress view
         */
        progressView() {
                return  <ProgressDisplay progress={this.state.progress} animate={Backend.instance() instanceof NodeBackend} />
        }

        getMenu() {
                switch(this.state.currentMenu) {
                        case MenuType.MainMenu:
                                return this.mainMenu();
                        case MenuType.Options:
                                return this.optionsMenu(); 
                        case MenuType.Tools:
                                return this.toolsMenu(); 
                        case MenuType.CheckingInstalled:
                                return <div/>
                        case MenuType.NotInstalled:
                                return this.notInstalledMenu();
                        case MenuType.Progress:
                                return this.progressView();
                        default:
                                return this.mainMenu();
                }
        }

        render() {
                return <div className='full'>
                        <Header version={this.state.version} submenu={
                                (this.state.currentMenu == MenuType.Options) ? ["Options"] : (
                                        (this.state.currentMenu == MenuType.Tools) ? ["Tools"] : [])} />
                        <div className='app-body'>
                                <div className="left-side" id="left-side">
                                        {this.getMenu()}
                                </div>
                                <div className="right-side" id="right-side">
                                        <div className='image'>
                                                <img src={logo} alt="Logo" />
                                        </div>
                                </div>
                        </div>
                        <InfoBox text={this.state.info}/>
                </div>
        }

        checkInstalled() {
                Backend.instance().isInstalled()
                        .then(installed => {
                                if (installed) {
                                        this.switchTo(MenuType.MainMenu);
                                } else {
                                        this.switchTo(MenuType.NotInstalled)
                                } 
                        }).catch(e => {
                                console.error("Error while checking if installed!\n" + e);
                        });
        }

        componentDidMount() {
                this.checkInstalled();
                this.loadVersion();

        }
}
