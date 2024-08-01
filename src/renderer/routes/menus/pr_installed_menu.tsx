import { Progress } from 'nx-request-api';
import { PopupData } from 'renderer/operations/popup_data';
import { Backend } from '../../operations/backend';
import {
  installLatest,
  switchToBeta,
  switchToPrerelease,
} from '../../operations/install';
import verify from '../../operations/verify';
import { FocusButton } from '../../components/buttons/focus_button';
import { MenuType } from './menu';
import { AbstractMenu } from './abstract_menu';

/**
 * builds the menu that appears when HDR is not installed
 * @returns the "not installed" menu
 */
export default class PrInstalledMenu extends AbstractMenu<{
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
            text="Play PR Build&nbsp;"
            className="main-buttons"
            onClick={() => Backend.instance().play()}
            onFocus={() => this.props.setInfo('Play the installed PR build.')}
          />

          <FocusButton
            text="Remove PR&nbsp;"
            className="main-buttons"
            onClick={async () => {
              Backend.instance().openModManager();
            }}
            onFocus={() =>
              this.props.setInfo(
                'Go and remove the PR build, and replace the hdr folder.'
              )
            }
          />
          <FocusButton
            text="Reload&nbsp;"
            className="main-buttons"
            onClick={async () => {
              this.props.switchTo(MenuType.CheckingInstalled);
            }}
            onFocus={() => this.props.setInfo('Reload the launcher ui')}
          />
        </div>
        {super.render()}
      </div>
    );
  }
}
