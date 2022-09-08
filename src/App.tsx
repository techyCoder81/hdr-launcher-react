
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import MainMenu from "./components/main_menu";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';
import { LogWindow } from './components/log_window';
import Header from './components/header';

export default class App extends React.Component {

  render() {
    return (
      <div>
        <Header/>
        <div className="left-side" id="left-side">
          <MainMenu/>
        </div>
        <div className="right-side" id="right-side">
          <LogWindow/>
        </div>
      </div>
    )
  }
}