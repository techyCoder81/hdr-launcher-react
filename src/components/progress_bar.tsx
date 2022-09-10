import React from "react";
import ReactModal from "react-modal";
import { Progress } from "../progress";

ReactModal.setAppElement('#root');

const customStyles = {
    content : {},
    overlay: {zIndex: 1000}
  };

/**
 * main menu implementation
 */
 export default function ProgressBar(props: any) {
    return <div>
        <h1>{props.progress.title}</h1>
        <h1>{props.progress.info}</h1> 
        <h1>{props.progress.progress}</h1>
    </div>
}
 