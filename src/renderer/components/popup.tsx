import { Remark } from 'react-remark';
import { PopupData } from '../operations/popup_data';
import { FocusButton } from './buttons/focus_button';

export const Popup = (props: { data: PopupData }) => {
  return (
    <div className="overlay-progress">
      <div className="progress-block vertical-center">
        <Remark>{props.data.text}</Remark>
        {props.data.options.map((option, index) => {
          return (
            <FocusButton
              key={index}
              autofocus={index == 0 ? true : false}
              className="simple-button inline popup-button"
              onClick={() => props.data.onSelect(option)}
              text={option}
            >
            </FocusButton>
          );
        })}
      </div>
    </div>
  );
};
