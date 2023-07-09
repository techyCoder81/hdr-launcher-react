import { Progress } from 'nx-request-api';
import { Backend } from '../../operations/backend';
import { PopupData } from '../../operations/popup_data';
import update from '../../operations/update';
import { FocusButton } from '../../components/buttons/focus_button';
import { MenuType } from './menu';
import UpdateButton from '../../components/buttons/update_button';
import { AbstractMenu } from './abstract_menu';
import BackgroundMusic from '../../operations/background_music';

/**
 * builds the main menu components
 * @returns the main menu
 */
export default class MainMenu extends AbstractMenu<{
  setInfo: (info: string) => void;
  switchTo: (menu: MenuType) => void;
}> {
  public constructor(props: {
    setInfo: (info: string) => void;
    switchTo: (menu: MenuType) => void;
  }) {
    super(props);
  }

  override showMenu(): void {
    super.showMenu();
    this.props.switchTo(MenuType.MainMenu);
  }

  render(): JSX.Element {
    return (
      <div className="main-menu" id="menu">
        <FocusButton
          text="Play&nbsp;"
          className="main-buttons"
          onClick={() => {
            // BackgroundMusic.singleton().fadeOut().then(() => BackgroundMusic.singleton().pause());
            Backend.instance()
              .play()
              .then(() => {
                // BackgroundMusic.singleton().play();
                // BackgroundMusic.singleton().fadeIn();
              });
          }}
          autofocus={Backend.isSwitch()}
          onFocus={() => this.props.setInfo('Play HDR!')}
        />
        <UpdateButton
          onClick={() => {
            return new Promise<void>(async (resolve, reject) => {
              await update((p: Progress) => this.showProgress(p))
                .then((result) => {
                  const { updated, text } = result;
                  console.info('finished updating');
                  this.showMenu();
                  this.props.switchTo(MenuType.MainMenu);
                  this.showPopupData(
                    new PopupData(
                      ['Ok', 'See changes list'],
                      'Your installation is up to date.',
                      (selected) => {
                        if (selected == 'Ok') {
                          this.showMenu();
                          resolve();
                          // relaunch on switch
                          if (updated) {
                            Backend.instance().relaunchApplication();
                          }
                        } else {
                          this.showPopupData(
                            new PopupData(['Ok'], text.join('\n'), () => {
                              this.showMenu();
                              resolve();
                              // relaunch on switch
                              if (updated) {
                                Backend.instance().relaunchApplication();
                              }
                            })
                          );
                        }
                      }
                    )
                  );
                })
                .catch((e) => {
                  alert(`Error while updating: ${e}`);
                  // relaunch on switch
                  Backend.instance().relaunchApplication();
                  this.showMenu();
                  resolve(e);
                });
            });
          }}
          onFocus={() => this.props.setInfo('Update your HDR Installation')}
        />
        <FocusButton
          text="Tools&nbsp;"
          className="main-buttons"
          onClick={() => this.props.switchTo(MenuType.Tools)}
          onFocus={() => this.props.setInfo('Open the Tools menu')}
        />
        <FocusButton
          text="Options&nbsp;"
          className="main-buttons"
          onClick={() => this.props.switchTo(MenuType.Options)}
          onFocus={() => this.props.setInfo('Open the Options menu')}
        />
        <FocusButton
          text="Exit&nbsp;"
          className="main-buttons"
          onClick={() => Backend.instance().exitApplication()}
          onFocus={() => this.props.setInfo('Exit the game')}
        />
        {super.render()}
      </div>
    );
  }
}
