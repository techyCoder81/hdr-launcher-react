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
  }
>((props, ref) => {
  return (
    <select
      style={props.style}
      ref={ref}
      className={props.className}
      autoFocus={props.autofocus}
      defaultValue={props.defaultValue}
      value={props.forcedValue}
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
      onChange={props.onChange}
    >
      {props.options.map((option) => (
        <option value={option} key={option}>
          {option}
        </option>
      ))}
    </select>
  );
});
