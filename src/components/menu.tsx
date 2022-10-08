import * as React from 'react';
import { Backend, NodeBackend } from "../backend";
import update from '../operations/update';
import verify from '../operations/verify';
import install_latest from '../operations/install';
import { Progress } from '../progress';
import ProgressDisplay from './progress_bar';
import "../styles/progress.css";
import Loading from './loading';
import {FocusButton} from './focus_button';
import * as skyline from "../skyline";
import { Github } from '../operations/github_utils';

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
export default class Menu extends React.Component<Props> {
        state = { 
                currentMenu: MenuType.CheckingInstalled,
                progress: null
        }

        private onUpdate;

        switchTo(menu: MenuType) {
                this.setState({currentMenu: menu, progress: null});
                this.onUpdate();

                // assign button actions for switch
                skyline.setButtonAction("X", () => {})
                switch(this.state.currentMenu) {
                        case MenuType.Options:
                                skyline.setButtonAction("B", () => this.switchTo(MenuType.MainMenu));
                                break;
                        default:
                                skyline.setButtonAction("B", () => {});
                                break;
                }
        }

        setProgress(progress: Progress) {
                this.setState({currentMenu: this.state.currentMenu, progress: progress});
        }

        public constructor(props: Props) {
                super(props);
                this.onUpdate = props.onUpdate;
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
                        <h1>HDR Is not Installed.</h1>
                        <FocusButton text='Play Vanilla&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={() => Backend.instance().play()}/>
                        
                        <FocusButton text='Install HDR&nbsp;&nbsp;' 
                                className={"main-buttons"} 
                                onClick={async () => {
                                        this.switchTo(MenuType.Progress);
                                        await install_latest((p: Progress) => this.setProgress(p))
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
         * builds the "checking if installed" view
         * @returns the checking if installed menu
         */
         checkingInstalledMenu() {
                
                return <Loading entering={true} />
        }  
        
        /**
         * builds the "checking if installed" view
         * @returns the checking if installed menu
         */
         doneLoading() {
                
                return <Loading entering={true} />
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
                                return this.checkingInstalledMenu();
                        case MenuType.NotInstalled:
                                return this.notInstalledMenu();
                        case MenuType.Progress:
                                return this.progressView();
                        default:
                                return this.mainMenu();
                }
        }

        render() {
                return <div>
                        {this.getMenu()}
                </div>
        }

        checkInstalled() {
                Github.pullRequests()
                        .then(_ => Backend.instance().isInstalled())
                        .then(installed => {
                                if (installed) {
                                        this.switchTo(MenuType.MainMenu);
                                } else {
                                        this.switchTo(MenuType.NotInstalled)
                                } 
                        }).catch(e => {
                                console.error("Error while checking if installed!\n" + e);
                                alert("Error while checking if installed!\n" + e);
                        });
        }

        componentDidMount() {
                this.checkInstalled();
        }
}
