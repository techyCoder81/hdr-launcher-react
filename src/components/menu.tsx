import * as React from 'react';
import { Backend, NodeBackend } from "../backend";
import update from '../operations/update';
import verify from '../operations/verify';
import { installBeta, installNightly, installLatest } from '../operations/install';
import { Progress } from '../progress';
import {ProgressDisplay} from './progress_bar';
import "../styles/progress.css";
import {FocusButton} from './focus_button';
import * as skyline from "../skyline";

type Props = {
        onUpdate: () => void;
};

enum MenuType {
        MainMenu,
        Options,
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
        }

        private updateParent;

        switchTo(menu: MenuType) {
                this.updateParent();
                this.setState({currentMenu: menu, progress: null, version: this.state.version});
                
                // assign button actions for switch
                skyline.setButtonAction("X", () => {})
                switch(this.state.currentMenu) {
                        case MenuType.Options:
                                skyline.setButtonAction("B", () => {});
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
                        version: version
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
                        version: this.state.version
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
                                autofocus={Backend.isSwitch()}/>
                        <FocusButton text='Update&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => {
                                        this.switchTo(MenuType.Progress);
                                        update((p: Progress) => this.setProgress(p))
                                                .then(() => this.loadVersion())
                                                .then(() => this.switchTo(MenuType.MainMenu))
                                                .catch(e => this.switchTo(MenuType.MainMenu));
                        }}/>
                        <FocusButton text='Verify&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => {
                                        this.switchTo(MenuType.Progress);
                                        verify((p: Progress) => this.setProgress(p))
                                                .then(() => this.switchTo(MenuType.MainMenu))
                                                .catch(e => this.switchTo(MenuType.MainMenu));
                        }}/>
                        <FocusButton text='Options&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => this.switchTo(MenuType.Options)}/>
                        <FocusButton text='Exit&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().quit()}/>
                </div>
        }

        /**
         * builds the options menu components
         * @returns the options menu
         */
        optionsMenu(): JSX.Element {
                
                return <div className="main-menu">
                        <FocusButton text='Mod Manager&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().openModManager()}/>
                        {
                        this.state.version.toLowerCase().includes("nightly") ? 
                        <FocusButton text='Install Beta&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={async () => {
                                        this.switchTo(MenuType.Progress);
                                        await installBeta(this.state.version, (p: Progress) => this.setProgress(p))
                                                .then(() => verify((p: Progress) => this.setProgress(p)))
                                                .then(() => this.loadVersion())
                                                .then(() => this.switchTo(MenuType.MainMenu))
                                                .catch(e => {this.switchTo(MenuType.MainMenu); alert("Error during beta switch: " + e)});
                        }}/> :
                        <FocusButton text='Install Nightly&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={async () => {
                                        this.switchTo(MenuType.Progress);
                                        await installNightly(this.state.version, (p: Progress) => this.setProgress(p))
                                                .then(() => verify((p: Progress) => this.setProgress(p)))
                                                .then(() => this.loadVersion())
                                                .then(() => this.switchTo(MenuType.MainMenu))
                                                .catch(e => {this.switchTo(MenuType.MainMenu); alert("Error during nightly switch: " + e)});
                        }}/>
                        }
                        <FocusButton text='Main Menu&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => this.switchTo(MenuType.MainMenu)}/>
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
                                onClick={() => Backend.instance().play()}/>
                        
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
                                }
                        }/>
                        
                        </div>
                </div>
        }   
        
        /**
         * builds the progress bar view
         * @returns the progress view
         */
        progressView() {
                return <div className='overlay'>
                        <ProgressDisplay progress={this.state.progress} animate={Backend.instance() instanceof NodeBackend} />
                </div>
        }

        getMenu() {
                switch(this.state.currentMenu) {
                        case MenuType.MainMenu:
                                return this.mainMenu();
                        case MenuType.Options:
                                return this.optionsMenu(); 
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
                console.info("menu render with:" + this.state.version);
                return <div>
                        {this.getMenu()}
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
