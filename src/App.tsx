
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import * as Menus from "./components/index";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';


// determine which type of backend we want, switch or node
var backend: Backend;
if (window.Main == undefined) {
  backend = new SwitchBackend();
} else {
  backend = new NodeBackend();
}

export function App() {
  return (
    new Menus.MainMenu(backend).render()
  )
}