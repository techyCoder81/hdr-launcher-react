import { Backend } from '../../operations/backend';
import {
  getInstallType,
  InstallType,
  switchToBeta,
  switchToNightly,
} from '../../operations/install';
import verify from '../../operations/verify';
import { Progress } from 'nx-request-api';
import { NightlyBetaButton } from '../buttons/nightly_beta_button';
import { FocusButton } from '../buttons/focus_button';
import { MenuType } from '../menu';
import { AbstractMenu } from './abstract_menu';
import { PopupData } from '../../operations/popup_data';

/**
 * builds the tools menu components
 * @returns the tools menu
 */
export default class ToolsMenu extends AbstractMenu<{
  setInfo: (info: string) => void;
  switchTo: (menu: MenuType) => void;
}> {
  public constructor(props: {
    setInfo: (info: string) => void;
    switchTo: (menu: MenuType) => void;
    version: string;
  }) {
    super(props);
  }

  override showMenu(): void {
    super.showMenu();
    this.props.switchTo(MenuType.Tools);
  }

  render(): JSX.Element {
    return (
      <div className="main-menu">
        <FocusButton
          text={'\u21e0 Main Menu\u00A0'}
          className={'main-buttons'}
          onClick={() => this.props.switchTo(MenuType.MainMenu)}
          onFocus={() => this.props.setInfo('Return to the Main menu')}
        />
        <FocusButton
          text={
            'Open ' +
            (Backend.isSwitch() ? 'Arcadia' : 'sdcard Folder') +
            '\u00A0'
          }
          className={'main-buttons smaller-main-button'}
          onClick={() => Backend.instance().openModManager()}
          onFocus={() => this.props.setInfo('Open the Mod Manager')}
        />
        <FocusButton
          text="Verify Files&nbsp;"
          className={'main-buttons smaller-main-button'}
          onClick={() => {
            verify((p: Progress) => this.showProgress(p))
              .then((results) => {
                console.info('finished verifying successfully');
                this.showMenu();
                this.showPopupData(
                  new PopupData(['Ok'], results, () => this.showMenu())
                );
              })
              .catch((results) => {
                console.info('finished verifying, issues reported.');
                this.showMenu();
                this.showPopupData(
                  new PopupData(['Ok'], results, () => this.showMenu())
                );
              });
          }}
          onFocus={() => this.props.setInfo('Verify your HDR files')}
        />
        <FocusButton
          text={'Stage Config\u00A0'}
          className={'main-buttons smaller-main-button'}
          onClick={() => this.props.switchTo(MenuType.StageConfig)}
          onFocus={() =>
            this.props.setInfo('Open the stage configuration menu')
          }
        />
        <NightlyBetaButton
          setInfo={(info: string) => this.props.setInfo(info)}
          onClick={async (version: string) => {
            let installType = getInstallType(version);
            switch (installType) {
              case InstallType.Beta:
                await switchToNightly(version, (p: Progress) =>
                  this.showProgress(p)
                )
                  //.then(() => verify((p: Progress) => this.setProgress(p)))
                  .then(() => {
                    alert('Switched successfully!');
                    this.props.switchTo(MenuType.MainMenu);
                  })
                  .catch((e) => {
                    this.props.switchTo(MenuType.MainMenu);
                    alert('Error during nightly switch: ' + e);
                  });
                break;
              case InstallType.Nightly:
                await switchToBeta(version, (p: Progress) =>
                  this.showProgress(p)
                )
                  //.then(() => verify((p: Progress) => this.setProgress(p)))
                  .then(() => {
                    alert('Switched successfully!');
                    this.props.switchTo(MenuType.MainMenu);
                  })
                  .catch((e) => {
                    this.props.switchTo(MenuType.MainMenu);
                    alert('Error during beta switch: ' + e);
                  });
                break;
              default:
                console.error('Could not switch! Current version is unknown!');
                alert('Could not switch! Current version is unknown!');
                break;
            }
          }}
        />
        <FocusButton
          text={'Install PR Build\u00A0'}
          className={'main-buttons smaller-main-button'}
          onClick={() => this.props.switchTo(MenuType.PullRequestConfig)}
          onFocus={() =>
            this.props.setInfo('Open the stage configuration menu')
          }
        />
        {super.render()}
      </div>
    );
  }
}
