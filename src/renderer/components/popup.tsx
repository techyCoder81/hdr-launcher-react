import { useEffect } from 'react';
import { useRemark } from 'react-remark';
import { PopupData } from '../operations/popup_data';

export const Popup = (props: { data: PopupData }) => {
  return (
    <div className="overlay-progress">
      <div className="progress-block vertical-center">
        {props.data.text.split('\n').map((entry, index) => (
          <h3 key={index}>{entry}</h3>
        ))}
        {props.data.options.map((option, index) => {
          return (
            <button
              key={index}
              autoFocus={index == 0 ? true : false}
              className="simple-button inline popup-button"
              onClick={() => props.data.onSelect(option)}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
};
