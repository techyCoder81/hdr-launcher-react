
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import * as Menus from "./menus/index";
import { Backend, ConsoleBackend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';

// determine which type of backend we want, switch or node
var backend = new NodeBackend();
let success = backend.ping("testing node connection");

if (!success) {
  console.log("node backend failed to respond, " +
    "using switch backend instead.");
  backend = new SwitchBackend();
  success = backend.ping("testing switch connection");
  if (!success) {
    backend = new ConsoleBackend();
    success = backend.ping("testing console connection");
    if (!success) {
      console.error("All is lost. No backend is available.");
      app.quit();
    }
  }
}

export function App() {
  return (
    new Menus.MainMenu(backend).render()
  )
}