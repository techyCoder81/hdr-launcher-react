import ProgressBar from '@ramonak/react-progress-bar';
import React from 'react';
import ReactModal from 'react-modal';
import { Progress } from 'nx-request-api';
import { Backend } from '../operations/backend';
import '../styles/progress.css';
import { LogPopout } from './logging/log_popout';
import SlidingBackground from './sliding_background';

ReactModal.setAppElement('#root');

const customStyles = {
  content: {},
  overlay: { zIndex: 1000 },
};

/**
 * progress bar implementation
 */
function ProgressDisplayInner(props: { progress: Progress; animate: boolean }) {
  if (props.progress === undefined || props.progress == null) {
    return <div />;
  }

  return (
    <div className="overlay-progress">
      <div className="progress-block vertical-center">
        {props.animate ? <SlidingBackground /> : <div />}
        <h1>{props.progress.title}</h1>
        {/* <p>{props.progress.info}</p> */}
        <ProgressBar
          className="progress-wrapper"
          completed={
            props.progress.progress == null ? 0 : props.progress.progress * 100
          }
          transitionDuration="100ms"
          isLabelVisible={false}
          bgColor="var(--main-button-bg-color)"
          borderRadius="0px"
        />
      </div>
      <LogPopout />
    </div>
  );
}

export const ProgressDisplay = React.memo(ProgressDisplayInner);
