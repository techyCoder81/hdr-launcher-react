import * as React from 'react';
import { LogWindow } from './logs/log_window';
import { FocusButton } from './buttons/focus_button';

enum ContentType {
  Logs,
  Twitter,
  Changelogs,
}

/**
 * header implementation
 */
export default class Sidebar extends React.PureComponent {
  state = {
    mode: ContentType.Changelogs,
  };

  getContent() {
    switch (this.state.mode) {
      case ContentType.Logs:
        return (
          <div className="sidebar-content">
            <LogWindow />
          </div>
        );
      default:
        return (
          <div className="sidebar-content">
            <LogWindow />
          </div>
        );
    }
  }

  render() {
    return (
      <div className="full sidebar">
        <div className="simple-buttons">
          <FocusButton
            className="simple-button inline"
            text="&nbsp;Latest Changes&nbsp;"
            onClick={() => this.setState({ mode: ContentType.Changelogs })}
          />
          <FocusButton
            className="simple-button inline"
            text="&nbsp;Logs&nbsp;"
            onClick={() => this.setState({ mode: ContentType.Logs })}
          />
        </div>

        {this.getContent()}
      </div>
    );
  }
}
