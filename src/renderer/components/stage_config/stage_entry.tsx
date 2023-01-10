import React from 'react';
import { useRef } from 'react';
import { stageInfo } from 'renderer/operations/stage_info';
import { Backend } from '../../operations/backend';
import { StageConfig } from '../../operations/stage_config';
import { FocusButton } from '../buttons/focus_button';
import { FocusCheckbox } from '../buttons/focus_checkbox';
import { ScrollFocusButton } from '../buttons/scroll_focus_button';

export function StageEntry(props: {
  stageName: string,
  onClick: () => Promise<void>,
  enabled: boolean,
  onFocus?: () => Promise<void>}) {

  return (
    <ScrollFocusButton
      key={props.stageName}
      /*children={
        <input
          className="focus-check"
          type="checkbox"
          readOnly
          checked={props.enabled}
        />
      }*/
      onClick={() => {
        return props.onClick();
      }}
      className={'smaller-main-button' + (Backend.isSwitch() ? ' no-transition' : '')}
      text={
        (stageInfo[props.stageName]
          ? stageInfo[props.stageName].display_name
          : props.stageName) + ' ' + (props.enabled ? '☑' : '☐') + '\u00A0'
      }
      onFocus={async () => {
        if (props.onFocus !== undefined) {
          await props
            .onFocus()
            .catch((e) =>
              console.log('while handling onfocus for stage entry: ' + e)
            );
        }
      }}
    />
  );
}
