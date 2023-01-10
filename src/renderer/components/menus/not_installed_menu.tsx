import { Backend } from '../../operations/backend';
import {
  installLatest,
  switchToBeta,
  switchToNightly,
} from '../../operations/install';
import verify from '../../operations/verify';
import { Progress } from 'nx-request-api';
import { FocusButton } from '../buttons/focus_button';
import { MenuType } from '../menu';
import { AbstractMenu } from './abstract_menu';
import { PopupData } from 'renderer/operations/popup_data';

/**
 * builds the menu that appears when HDR is not installed
 * @returns the "not installed" menu
 */
export default class NotInstalledMenu extends AbstractMenu<{
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

  render(): JSX.Element {
    return (
      <div id="menu">
        <div className="main-menu">
          <FocusButton
            text="Play Vanilla&nbsp;"
            className={'main-buttons'}
            onClick={() => Backend.instance().play()}
            onFocus={() => this.props.setInfo('Play vanilla Ultimate')}
          />

          <FocusButton
            text="Install HDR&nbsp;"
            className={'main-buttons'}
            onClick={async () => {
              await installLatest((p: Progress) => this.showProgress(p))
              verify((p: Progress) => this.showProgress(p))
                .then(async (results) => {
                  console.info('finished verifying installation successfully');
                  this.showMenu();
                  /*this.showPopupData(
                    new PopupData(['Ok'], results, () => this.showMenu())
                  );*/
                  if (Backend.isSwitch()) {
                    alert(
                      "HDR's files have been installed. Please enable hdr, hdr-assets, and hdr-stages when arcropolis offers."
                    );
                  } else {
                    alert("HDR's files have been installed.");
                  }
                  this.props.switchTo(MenuType.CheckingInstalled);
                })
                .catch((results) => {
                  console.info('finished installing, issues reported.');
                  this.showMenu();
                  this.showPopupData(
                    new PopupData(['Ok'], results, () => {this.props.switchTo(MenuType.CheckingInstalled); Backend.instance().relaunchApplication();})
                  );
                });
            }}
            onFocus={() =>
              this.props.setInfo('Install the latest version of HDR')
            }
          />
        </div>
        {super.render()}
      </div>
    );
  }
}
