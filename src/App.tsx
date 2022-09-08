
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import {MainMenu} from "./components/main_menu";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';
import { LogWindow } from './components/log_window';

export function App(backend: Backend) {
  return (
    <div>
      <div className="left-side" id="left-side">
        {new MainMenu(backend).render()}
      </div>
      <div className="right-side" id="right-side">
        <LogWindow/>
      </div>
    </div>
  )
}