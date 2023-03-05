import { Backend } from '../../operations/backend';
import {
  getInstallType,
  InstallType,
  switchToBeta,
  switchToNightly,
} from '../../operations/install';
import verify from '../../operations/verify';
import { Progress } from 'nx-request-api';
import { NightlyBetaButton } from '../../components/buttons/nightly_beta_button';
import { MenuType } from './menu';
import { AbstractMenu } from './abstract_menu';
import { PopupData } from '../../operations/popup_data';
import { ScrollFocusButton } from '../../components/buttons/scroll_focus_button';
import { CloneFolderForDev } from '../../components/buttons/dev_tools_buttons';
import { Link, useNavigate } from 'react-router-dom';
import { Pages } from 'renderer/constants';

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
      <div className="main-menu full">
        <div className="scrolling-fit-nobar scroll-hidden">
          <ScrollFocusButton
            text={'\u21e0 Main Menu\u00A0'}
            className={'smaller-main-button'}
            onClick={() => this.props.switchTo(MenuType.MainMenu)}
            onFocus={() => this.props.setInfo('Return to the Main menu')}
          />
          <ScrollFocusButton
            text={
              'Open ' +
              (Backend.isSwitch() ? 'Arcadia' : 'Mod Folder') +
              '\u00A0'
            }
            className={'smaller-main-button'}
            onClick={() => Backend.instance().openModManager()}
            onFocus={() => this.props.setInfo('Open the Mod Manager')}
          />
          <ScrollFocusButton
            text="Verify Files&nbsp;"
            className={'smaller-main-button'}
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
          <NavigateButton
            text='Stage Config'
            page={Pages.STAGE_CONFIG}
            onFocus={() => this.props.setInfo('Open the stage configuration menu')}
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
                      if (Backend.isSwitch()) {
                        Backend.instance().relaunchApplication();
                      }
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
                      if (Backend.isSwitch()) {
                        Backend.instance().relaunchApplication();
                      }
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
          <NavigateButton
            text='Install PR Build'
            page={Pages.PULL_REQUESTS}
            onFocus={() => this.props.setInfo('Open the stage configuration menu')}
          />
          
          <CloneFolderForDev modName={'hdr'} onComplete={() => this.showMenu()} setInfo={info => this.props.setInfo(info)} showProgress={p => this.showProgress(p)} then={async () =>{
            let backend = Backend.instance();
            let root = await backend.getSdRoot();
            await backend.writeFile(root + 'ultimate/mods/hdr-dev/ui/hdr_version.txt', 'v0.69.420-dev');
          }}/>
          <CloneFolderForDev modName={'hdr-assets'} onComplete={() => this.showMenu()} setInfo={info => this.props.setInfo(info)} showProgress={p => this.showProgress(p)}/>
          </div>
        {super.render()}
      </div>
    );
  }
}

function NavigateButton(props: {text: string, page: Pages, onFocus: () => void}) {
  const navigate = useNavigate();
  return <ScrollFocusButton
      text={props.text + '\u00A0'}
      className={'smaller-main-button'}
      onClick={() => {
        
        navigate(props.page);
      }}
      onFocus={() =>
        props.onFocus()
      }
    />
}