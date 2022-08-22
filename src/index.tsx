import "core-js/stable"
import ReactDOM from "react-dom";
import { App } from "./App";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import { Header } from "./components/header";

// determine which type of backend we want, switch or node
var backend: Backend;
if (window.Main == undefined) {
  backend = new SwitchBackend();
} else {
  backend = new NodeBackend();
}

ReactDOM.render(App(backend), document.getElementById("root"));
ReactDOM.render(new Header(backend).render(), document.getElementById("header"));