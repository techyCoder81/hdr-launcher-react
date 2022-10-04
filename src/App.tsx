
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import Menu from "./components/menu";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';
import { LogWindow } from './components/log_window';
import Header from './components/header';
import { TwitterTimelineEmbed } from 'react-twitter-embed';
import Sidebar from './components/sidebar';

export default class App extends React.Component {

  state = {
    enabled: true
  }

toggleEnabled() {
    this.setState({enabled: !this.state.enabled});
    console.info("Logs enabled: " + this.state.enabled);
}


  render() {
    return (
      <div>
        <Header/>
        <div className="left-side" id="left-side">
          <Menu/>
        </div>
        <div className="right-side" id="right-side">
          <Sidebar/>
        </div>
      </div>
    )
  }
}