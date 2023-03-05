import * as React from 'react';
import { Backend, NodeBackend } from '../../operations/backend';
import '../../styles/progress.css';
import InfoBox from './info_box';
import { Header } from './../../components/header';
import { LogoRight } from './../../components/logo_right';
import MainMenu from './main_menu';
import { CheckingInstalled } from './checking_installed';
import ToolsMenu from './tools_menu';
import OptionsMenu from './options_menu';
import NotInstalledMenu from './not_installed_menu';
import { skyline } from 'nx-request-api';
import PrInstalledMenu from './pr_installed_menu';

export enum MenuType {
  MainMenu,
  Options,
  Tools,
  NotInstalled,
  CheckingInstalled,
  PrInstalled,
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
            onComplete={(installed: string | null) => {
              console.info(installed);
              installed !== null
                ? (installed.includes("pr") ? this.switchTo(MenuType.PrInstalled) : this.switchTo(MenuType.MainMenu))
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
      case MenuType.PrInstalled:
        return (
          <PrInstalledMenu
            setInfo={(info: string) => this.setInfo(info)}
            switchTo={(menu: MenuType) => this.switchTo(menu)}
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
