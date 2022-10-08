import "core-js/stable"
import ReactDOM from "react-dom";
import App from "./components/app";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import Header from "./components/header";
import { LogWindow } from "./components/log_window";
import { Github } from "./operations/github_utils";
import * as skyline from './skyline';

ReactDOM.render(<App/>, document.getElementById("root"));

// override B/X buttons closing the webpage on switch
skyline.setButtonAction("B", () => {})
skyline.setButtonAction("X", () => {})