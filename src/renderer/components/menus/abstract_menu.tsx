import React from 'react';
import { Backend } from '../../operations/backend';
import { PopupData } from '../../operations/popup_data';
import { Progress } from 'nx-request-api';
import { Popup } from '../popup';
import { ProgressDisplay } from '../progress_bar';

export abstract class AbstractMenu<T> extends React.Component<T> {
  state = {
    progress: null,
    popup: null,
  };

  showProgress(progress: Progress | null) {
    this.setState({ progress: progress, popup: null });
  }

  showPopupData(popupData: PopupData | null) {
    this.setState({ progress: null, popup: popupData });
  }

  showMenu() {
    this.setState({ progress: null, popup: null });
  }

  render(): JSX.Element {
    return (
      <div>
        {this.state.popup != null ? <Popup data={this.state.popup} /> : <div />}
        {this.state.progress != null ? (
          <ProgressDisplay
            progress={this.state.progress}
            animate={Backend.isNode()}
          />
        ) : (
          <div />
        )}
      </div>
    );
  }
}
