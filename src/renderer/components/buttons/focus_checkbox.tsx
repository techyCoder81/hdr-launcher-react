import React, { useEffect, useState } from 'react';
import FocusTimer from '../../operations/focus_singleton';

export function FocusCheckbox(props: {
  onClick: () => Promise<void>;
  className: string;
  text: string;
  autofocus?: boolean;
  checkStatus?: () => Promise<boolean>;
  onFocus?: () => void;
}) {
  const [isChecked, setChecked] = useState(false);

  useEffect(() => {
    if (props.checkStatus !== undefined) {
      props
        .checkStatus()
        .then((checked) => setChecked(checked))
        .catch((e) => alert(e));
    }
  }, []);

  return (
    <button
      key={props.text}
      // type="checkbox"
      className={props.className}
      // name={props.text}
      autoFocus={props.autofocus}
      onMouseMove={(e) => e.currentTarget.focus()}
      onMouseEnter={(e) => e.currentTarget.focus()}
      onMouseLeave={(e) => e.currentTarget.blur()}
      onBlur={(e) => {
        // if it hasn't been long enough since
        // the last focus transition, refocus
        // on the existing focused component.
        if (!FocusTimer.request()) {
          e.currentTarget.focus();
        }
      }}
      onFocus={() => {
        if (props.onFocus) {
          props.onFocus();
        }
      }}
      onClick={() => {
        props
          .onClick()
          .then(() => {
            if (props.checkStatus !== undefined) {
              props
                .checkStatus()
                .then((checked) => setChecked(checked))
                .catch((e) => alert(e));
            }
          })
          .catch((e) => alert(e));
      }}
    >
      {props.text}&nbsp;
      <input
        className="focus-check"
        type="checkbox"
        readOnly
        checked={isChecked}
      />
    </button>
  );
}
