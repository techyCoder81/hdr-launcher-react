
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import {MainMenu} from "./components/main_menu";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';

export function App(backend: Backend) {
  return (
    new MainMenu(backend).render()
  )
}