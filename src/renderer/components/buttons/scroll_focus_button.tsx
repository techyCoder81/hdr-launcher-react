import React, { useRef } from 'react';
import { Backend } from 'renderer/operations/backend';
import FocusTimer from '../../operations/focus_singleton';
import { FocusButton } from './focus_button';

export function ScrollFocusButton(props: {
  className: string,
  onClick: () => void,
  text: string,
  children?: any,
  autofocus?: boolean,
  onFocus?: () => void
}) {
  const selfRef = useRef<HTMLButtonElement>(null);

  return (
    <FocusButton
      ref={selfRef}
      className={props.className}
      autofocus={props.autofocus}
      onFocus={() => {
        if (props.onFocus) {
          props.onFocus();
        }
        if (selfRef == null) {
          return;
        }

        if (selfRef === null) {
          return;
        }
        let parent = selfRef.current?.parentElement;
        if (parent === null || parent === undefined) {
          console.warn("no parent found for scrolling button!");
          return;
        }
        let parentBottom = parent.getBoundingClientRect().bottom;
        let parentTop = parent.getBoundingClientRect().top;

        // scroll down
        let nextButton = selfRef.current?.nextElementSibling;
        if (nextButton !== null && nextButton !== undefined) {
          let nextBottom = nextButton.getBoundingClientRect().bottom;
          // if the bottom of the next button is not visible (blocked by parent),
          // then scroll down.
          if (nextBottom > parentBottom) {
            nextButton.scrollIntoView(false);
          }
        }

        // scroll up
        let prevButton = selfRef.current?.previousElementSibling;
        if (prevButton !== null && prevButton !== undefined) {
          let prevTop = prevButton.getBoundingClientRect().top;
          // if the top of the previous button is not visible (blocked by parent),
          // then scroll up.
          if (prevTop < parentTop) {
            prevButton.scrollIntoView(true);
          }
        }
      }}
      onClick={props.onClick}
    text={props.text}
    children={props.children}
    />
  );
}
