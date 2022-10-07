import * as React from 'react';
import * as Messages from "../messages";
import { Backend, NodeBackend } from "../backend";
import { LogWindow } from './log_window';
import ReactDOM from 'react-dom';
import { DirTree } from '../responses';
import { autoUpdater } from 'electron';
import update from '../operations/update';
import verify from '../operations/verify';
import install_latest from '../operations/install';
import ReactModal from "react-modal";
import $ from './progress_bar';
import { Progress } from '../progress';
import ProgressDisplay from './progress_bar';
import "../styles/progress.css";
import Loading from './loading';

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
export default class Menu extends React.Component {
        state = { 
                currentMenu: MenuType.CheckingInstalled,
                progress: null
        }

        switchTo(menu: MenuType) {
                this.setState({currentMenu: menu, progress: null});
        }

        setProgress(progress: Progress) {
                this.setState({currentMenu: this.state.currentMenu, progress: progress});
        }

        /**
         * builds the main menu components
         * @returns the main menu
         */
        mainMenu(): JSX.Element {
                return <div className="main-menu" id="menu">
                        
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => Backend.instance().play()}>
                                <div>Play&nbsp;&nbsp;</div>
                        </button> 
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => {
                                this.switchTo(MenuType.Progress);
                                update((p: Progress) => this.setProgress(p))
                                       .then(() => this.switchTo(MenuType.MainMenu))
                                       .catch(e => this.switchTo(MenuType.MainMenu));
                        }}>
                                <div>Update&nbsp;&nbsp;</div>
                        </button>
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => {
                                this.switchTo(MenuType.Progress);
                                verify((p: Progress) => this.setProgress(p))
                                        .then(() => this.switchTo(MenuType.MainMenu))
                                        .catch(e => this.switchTo(MenuType.MainMenu));
                        }}>
                                <div>Verify&nbsp;&nbsp;</div>
                        </button>
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => this.switchTo(MenuType.Options)}>
                                <div>Options&nbsp;&nbsp;</div>
                        </button>
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => Backend.instance().quit()}>
                                <div>Exit&nbsp;&nbsp;</div>
                        </button>
                </div>
        }

        /**
         * builds the options menu components
         * @returns the options menu
         */
        optionsMenu(): JSX.Element {
                
                return <div id="options">
                        <div className="main-menu">
                        
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => Backend.instance().openModManager()}>
                                <div>Mod Manager&nbsp;&nbsp;</div>
                        </button>
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => this.switchTo(MenuType.MainMenu)}>
                                <div>Main Menu&nbsp;&nbsp;</div>
                        </button>
                        </div>
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
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={() => Backend.instance().play()}>
                                <div>Play Vanilla&nbsp;&nbsp;</div>
                        </button>
                        <button className={"main-buttons" + (Backend.isNode() ? " electron-buttons" : "")} onClick={async () => {
                                this.switchTo(MenuType.Progress);
                                await install_latest((p: Progress) => this.setProgress(p))
                                        .then(() => this.switchTo(MenuType.MainMenu))
                                        .catch(e => {
                                                this.switchTo(MenuType.MainMenu);
                                                console.error("Error while installing latest HDR.");
                                        });
                                this.switchTo(MenuType.CheckingInstalled);
                                this.checkInstalled();
                        }}>
                                <div>Install HDR&nbsp;&nbsp;</div>
                        </button>
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
                Backend.instance().isInstalled().then(installed => {
                        
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
