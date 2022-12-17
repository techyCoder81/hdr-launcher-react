import * as React from 'react';
import { Backend, NodeBackend } from '../operations/backend';
import '../styles/progress.css';
import InfoBox from './info_box';
import { Header } from './header';
import { LogoRight } from './logo_right';
import MainMenu from './menus/main_menu';
import { CheckingInstalled } from './menus/checking_installed';
import ToolsMenu from './menus/tools_menu';
import OptionsMenu from './menus/options_menu';
import NotInstalledMenu from './menus/not_installed_menu';
import { skyline } from 'nx-request-api';
import StageConfigMenu from './stage_config/stage_config_menu';

export enum MenuType {
  MainMenu,
  Options,
  Tools,
  NotInstalled,
  CheckingInstalled,
  StageConfig,
}

/**
 * main menu implementation
 */
export default class Menu extends React.PureComponent {
  state = {
    currentMenu: MenuType.CheckingInstalled,
    version: 'unknown',
    info: '  ',
  };

  switchTo(menu: MenuType) {
    this.setState({
      currentMenu: menu,
      version: this.state.version,
      info: this.state.info,
    });
    this.loadVersion();

    // assign button actions for switch
    skyline.setButtonAction('X', () => {});
    switch (this.state.currentMenu) {
      case MenuType.Options:
        skyline.setButtonAction('B', () => this.switchTo(MenuType.MainMenu));
        break;
      case MenuType.Tools:
        skyline.setButtonAction('B', () => this.switchTo(MenuType.MainMenu));
        break;
      default:
        skyline.setButtonAction('B', () => {});
        break;
    }
  }

  setVersion(version: string) {
    console.debug('setting version: ' + version);
    this.setState({
      currentMenu: this.state.currentMenu,
      version: version,
      info: this.state.info,
    });
  }

  loadVersion() {
    Backend.instance()
      .getVersion()
      .then((ver) => {
        console.debug('loaded version: ' + ver);
        this.setVersion(ver);
      })
      .catch((e) => console.error('console error: ' + e));
  }

  setInfo(info: string) {
    this.setState({
      currentMenu: this.state.currentMenu,
      version: this.state.version,
      info: info,
    });
  }

  getMenu() {
    switch (this.state.currentMenu) {
      case MenuType.Options:
        return (
          <OptionsMenu
            setInfo={(info: string) => this.setInfo(info)}
            switchTo={(menu: MenuType) => this.switchTo(menu)}
            version={this.state.version}
          />
        );
      case MenuType.Tools:
        return (
          <ToolsMenu
            setInfo={(info: string) => this.setInfo(info)}
            switchTo={(menu: MenuType) => this.switchTo(menu)}
          />
        );
      case MenuType.CheckingInstalled:
        return (
          <CheckingInstalled
            onComplete={(installed: boolean) => {
              installed
                ? this.switchTo(MenuType.MainMenu)
                : this.switchTo(MenuType.NotInstalled);
            }}
          />
        );
      case MenuType.NotInstalled:
        return (
          <NotInstalledMenu
            setInfo={(info: string) => this.setInfo(info)}
            switchTo={(menu: MenuType) => this.switchTo(menu)}
          />
        );
      case MenuType.StageConfig:
        return (
          <StageConfigMenu
            onComplete={() => this.switchTo(MenuType.MainMenu)}
          />
        );
      default:
        return (
          <MainMenu
            setInfo={(info: string) => this.setInfo(info)}
            switchTo={(menu: MenuType) => this.switchTo(menu)}
          />
        );
    }
  }

  render() {
    return (
      <div className="full">
        <Header
          version={this.state.version}
          submenu={
            this.state.currentMenu == MenuType.Options
              ? ['Options']
              : this.state.currentMenu == MenuType.Tools
              ? ['Tools']
              : []
          }
        />
        <div className="app-body">
          <div className="left-side" id="left-side">
            {this.getMenu()}
          </div>
          <LogoRight />
        </div>
        <InfoBox text={this.state.info} />
      </div>
    );
  }

  componentDidMount() {
    this.loadVersion();
  }
}
