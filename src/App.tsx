
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import * as Menus from "./menus/index";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';

// determine which type of backend we want, switch or node
var backend = new NodeBackend();
try {
  backend.send(new Messages.Ping("hello?"))
} catch {
  backend = new SwitchBackend();
}

export function App() {
  return (
    new Menus.MainMenu(backend).render()
  )
}