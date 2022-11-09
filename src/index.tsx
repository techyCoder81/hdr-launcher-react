import "core-js/stable"
import ReactDOM from "react-dom";
import App from "./components/app";
import { skyline } from 'nx-request-api';

ReactDOM.render(<App/>, document.getElementById("root"));

// override B/X buttons closing the webpage on switch
skyline.setButtonAction("B", () => {})
skyline.setButtonAction("X", () => {})