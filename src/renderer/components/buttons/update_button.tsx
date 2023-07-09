/* eslint-disable no-alert */
import { useEffect, useState } from 'react';
import * as update from '../../operations/update';
import { FocusButton } from './focus_button';

/// check for updates when the button is loaded
const UpdateButton = (props: {
  onClick: () => Promise<void>;
  onFocus: () => void;
}) => {
  const [available, setAvailable] = useState(false);

  const { onClick, onFocus } = props;

  useEffect(() => {
    update
      .isAvailable()
      .then((isAvailable) => setAvailable(isAvailable))
      .catch((e) => alert(e));
  }, []);

  return (
    <FocusButton
      className="main-buttons"
      text={`Update${available ? '(!)\u00A0' : '\u00A0'}`}
      onClick={() => {
        onClick()
          .then(() => setAvailable(false))
          .then(() => update.isAvailable())
          .then((isAvailable) => setAvailable(isAvailable))
          .catch((e) => alert(e));
      }}
      onFocus={() => onFocus()}
    />
  );
};

export { UpdateButton as default };
