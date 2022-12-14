import { useEffect, useState } from 'react';
import { Backend } from '../../operations/backend';
import * as update from '../../operations/update';
import { FocusButton } from './focus_button';

/// check for updates when the button is loaded
export const UpdateButton = (props: {
  onClick: () => Promise<void>;
  onFocus: () => void;
}) => {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    update
      .isAvailable()
      .then((isAvailable) => setAvailable(isAvailable))
      .catch((e) => alert(e));
  }, []);

  return (
    <FocusButton
      className="main-buttons"
      text={'Update' + (available ? '(!)\u00A0' : '\u00A0')}
      onClick={() => {
        props
          .onClick()
          .then(() => setAvailable(false))
          .then(() => update.isAvailable())
          .then((isAvailable) => setAvailable(isAvailable))
          .catch((e) => alert(e));
      }}
      onFocus={() => props.onFocus()}
    />
  );
};
