import * as React from 'react';
import * as Messages from "../messages";
import { Backend } from "../backend";
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
import ProgressBar from './progress_bar';

enum MenuType {
        MainMenu,
        Options,
        NotInstalled,
        CheckingInstalled,
}

/**
 * main menu implementation
 */
export default class Menu extends React.Component {
        state = {
                currentMenu: MenuType.CheckingInstalled,
                showProgress: false,
                progress: null
        }

        switchTo(menu: MenuType) {
                this.setState({currentMenu: menu, showProgress: this.state.showProgress, progress: null});
        }

        setShowProgress(showProgress: boolean) {
                this.setState({currentMenu: this.state.currentMenu, showProgress: showProgress, progress: this.state.progress});
        }

        setProgress(progress: Progress) {
                this.setState({currentMenu: this.state.currentMenu, showProgress: this.state.showProgress, progress: progress});
        }

        /**
         * builds the main menu components
         * @returns the main menu
         */
        mainMenu(): JSX.Element {
                return <div className="main-menu" id="menu">
                        <button className="main-buttons" onClick={() => Backend.instance().play()}>
                                <div>Play&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={async () => {
                                this.setShowProgress(true);
                                await update((p: Progress) => this.setProgress(p))
                                        .then(() => this.setShowProgress(false))
                                        .catch(e => this.setShowProgress(false));
                        }}>
                                <div>Update&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={async () => {
                                this.setShowProgress(true);
                                await verify((p: Progress) => this.setProgress(p))
                                        .then(() => this.setShowProgress(false))
                                        .catch(e => this.setShowProgress(false));
                        }}>
                                <div>Verify&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => this.switchTo(MenuType.Options)}>
                                <div>Options&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => Backend.instance().quit()}>
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
                        <h1>Options</h1>
                        <button className="main-buttons" onClick={() => Backend.instance().openModManager()}>
                                <div>Mod Manager&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={() => this.switchTo(MenuType.MainMenu)}>
                                <div>Back&nbsp;&nbsp;</div>
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
                        <button className="main-buttons" onClick={() => Backend.instance().play()}>
                                <div>Play Vanilla&nbsp;&nbsp;</div>
                        </button>
                        <button className="main-buttons" onClick={async () => {
                                this.setShowProgress(true);
                                await install_latest((p: Progress) => this.setProgress(p))
                                        .then(() => this.setShowProgress(false))
                                        .catch(e => {
                                                this.setShowProgress(false)
                                                console.error("Error while installing: " + e);
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
         checkingInstalledMenu(): JSX.Element {
                
                return <div id="menu">
                        <div className="main-menu">
                        <h1>Checking if HDR is installed...</h1>
                        </div>
                </div>
        }   

        getMenu() {
                if (!this.state.showProgress) {
                        switch(this.state.currentMenu) {
                                case MenuType.MainMenu:
                                        return this.mainMenu();
                                case MenuType.Options:
                                        return this.optionsMenu();
                                case MenuType.CheckingInstalled:
                                        return this.checkingInstalledMenu();
                                case MenuType.NotInstalled:
                                        return this.notInstalledMenu();
                                default:
                                        return this.mainMenu();
                        }
                }
        }

        progressBar() {
                if (this.state.showProgress && this.state.progress != null) {
                        return <ProgressBar progress={this.state.progress}/>
                } else {
                        return <div></div>
                }
        }

        render() {
                return <div>
                        {this.getMenu()}
                        {this.progressBar()}
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
