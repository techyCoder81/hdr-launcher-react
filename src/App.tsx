
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import * as Menus from "./menus/index";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';

// determine which type of backend we want, switch or node
var backend = new SwitchBackend();
/*function setBackend() {
  try {
    console.info("Testing node connection");
    backend.ping().then((result) =>{
      console.info("node connection all good");
      return;
    }).catch(e => {
      console.log("Pinging node backend failed, trying switch instead...");
      backend = new SwitchBackend();
      backend.ping().then((result) =>{
        console.info("switch connection all good");
        return;
      }).catch(e => {
        console.error("both node and switch backends failed to respond.");
      });
    });
  } catch (e) {
    console.error(e);
  };
}
setBackend();*/


export function App() {
  return (
    new Menus.MainMenu(backend).render()
  )
}