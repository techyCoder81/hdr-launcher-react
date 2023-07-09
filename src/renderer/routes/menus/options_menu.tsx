import * as config from '../../operations/launcher_config';
import { Backend } from '../../operations/backend';
import { FocusButton } from '../../components/buttons/focus_button';
import { FocusCheckbox } from '../../components/buttons/focus_checkbox';
import { MenuType } from './menu';
import { AbstractMenu } from './abstract_menu';
import { PopupData } from '../../operations/popup_data';
import * as LauncherConfig from '../../operations/launcher_config';

/**
 * builds the options menu components
 * @returns the options menu
 */
export default class OptionsMenu extends AbstractMenu<{
  setInfo: (info: string) => void;
  switchTo: (menu: MenuType) => void;
  version: string;
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
      <div className="main-menu">
        <FocusButton
          text={'\u21e0 Main Menu\u00A0'}
          className="smaller-main-button"
          onClick={() => this.props.switchTo(MenuType.MainMenu)}
          onFocus={() => this.props.setInfo('Return to the Main menu')}
        />
        {Backend.isSwitch() ? (
          <FocusCheckbox
            className="smaller-main-button"
            onClick={async () => {
              const enabled = await config.getBoolean('skip_launcher');
              await config.setBoolean('skip_launcher', !enabled);
            }}
            checkStatus={async () => {
              return config.getBoolean('skip_launcher');
            }}
            text={'Skip Launcher\u00A0'}
            onFocus={() =>
              this.props.setInfo(
                'Skip the launcher on boot unless updates are available.'
              )
            }
          />
        ) : (
          <div />
        )}
        <FocusCheckbox
          className="smaller-main-button"
          onClick={async () => {
            const enabled = await config.getBoolean('enable_dev_tools');
            await config.setBoolean('enable_dev_tools', !enabled);
          }}
          checkStatus={async () => {
            return config.getBoolean('enable_dev_tools');
          }}
          text={'Enable Dev Tools\u00A0'}
          onFocus={() =>
            this.props.setInfo(
              'Enable the dev tools menu (for HDR developers and contributors)'
            )
          }
        />
        <FocusCheckbox
          className="smaller-main-button"
          onClick={async () => {
            const enabled = await config.getBoolean('ignore_music');
            await config.setBoolean('ignore_music', !enabled);
            console.info(`setting: ${!enabled}`);
          }}
          checkStatus={async () => {
            const checked = !(await config.getBoolean('ignore_music'));
            console.info(`Checked: ${checked}`);
            return checked;
          }}
          text={'Verify Music\u00A0'}
          onFocus={() =>
            this.props.setInfo(
              'Disable this if you wish to use music mods which conflict with HDR.'
            )
          }
        />
        {super.render()}
      </div>
    );
  }
}
