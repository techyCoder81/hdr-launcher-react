import "core-js/stable"
import ReactDOM from "react-dom";
import App from "./components/app";
import { Backend, NodeBackend, SwitchBackend } from "./backend";
import Header from "./components/header";
import { LogWindow } from "./components/log_window";

ReactDOM.render(<App/>, document.getElementById("root"));