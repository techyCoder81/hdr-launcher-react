/**
 * holds the data necessary for a popup
 */
export class PopupData {
  public options: string[];

  public text: string;

  public onSelect: (selected: string) => void;

  /**
   * creates a PopupData.
   * @param options a list of button options to be available
   * @param text the text to be shown
   * @param onSelect a callback to be performed once an option is selected
   */
  constructor(
    options: string[],
    text: string,
    onSelect: (selected: string) => void
  ) {
    this.options = options;
    this.text = text;
    this.onSelect = onSelect;
  }
}
