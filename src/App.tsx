
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import * as Menus from "./menus/index";
import { Backend, NodeBackend } from "./backend";
import './index.css';
const node_backend = new NodeBackend();


export function App() {
  return (
    new Menus.MainMenu(node_backend).render()
  )
}