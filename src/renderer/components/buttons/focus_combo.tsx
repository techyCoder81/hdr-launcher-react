import React, { useRef } from 'react';
import { Backend } from 'renderer/operations/backend';
import FocusTimer from '../../operations/focus_singleton';

export const FocusCombo = React.forwardRef<
  HTMLSelectElement,
  {
    className: string;
    onChange: (item: { target: { value: string } }) => void;
    options: string[];
    autofocus?: boolean;
    defaultValue?: string;
    forcedValue?: string;
    onFocus?: () => void;
    style?: React.CSSProperties;
    disabled?: boolean;
  }
>((props, ref) => {

  let options = props.options.map((option) => (
    <option value={option} key={option}>
      {option}
    </option>
  ));
  let disabledOption = [
    <option value={props.forcedValue} key={props.forcedValue}>
      {props.forcedValue}
    </option>
  ];

  return (
    <select
      style={props.style}
      ref={ref}
      className={props.className}
      autoFocus={props.autofocus}
      defaultValue={props.defaultValue}
      value={props.forcedValue}
      onMouseDown={props.disabled ? ((e) => e.preventDefault()) : undefined}
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
      onChange={props.disabled ? undefined : props.onChange}
    >
      {props.disabled ? disabledOption : options}
    </select>
  );
});
