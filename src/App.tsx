
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Messages from "./messages";
import * as Menus from "./menus/index";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import './index.css';
import { app } from 'electron';


// determine which type of backend we want, switch or node
var backend: Backend;

/** enable the switch backend */
function enableSwitchBackend() {
  console.log("Pinging node backend failed, trying switch instead...");
  backend = new SwitchBackend();
  backend.ping().then((result) =>{
    if (result) {
      console.info("switch connection all good");
      return;
    } else {
      console.error("switch backend ping failed.");
    }
  }).catch(e => {
    console.error("both node and switch backends failed to respond.");
  });
}

/** select the correct backend by trying to ping */
function setBackend() {
  backend = new NodeBackend();
  try {
    console.info("Testing node connection");
    backend.ping().then((result) =>{
      if (result) {
        console.info("node connection all good");
        return;
      } else {
        enableSwitchBackend();
      }
    }).catch(e => {
      enableSwitchBackend();
    });
  } catch (e) {
    console.error(e); 
    enableSwitchBackend();
  };
}

// set whatever backend is actually correct
setBackend();


export function App() {
  return (
    new Menus.MainMenu(backend).render()
  )
}