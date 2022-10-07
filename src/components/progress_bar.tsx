import ProgressBar from "@ramonak/react-progress-bar";
import React from "react";
import ReactModal from "react-modal";
import { Backend } from "../backend";
import "../styles/progress.css"


ReactModal.setAppElement('#root');

const customStyles = {
    content : {},
    overlay: {zIndex: 1000}
};

var platformCache;

/** 
 * progress bar implementation
 */
 export default function ProgressDisplay(props: any) {
    if (props.progress === undefined || props.progress == null) {
      return <div></div>
    }

    return <div className="progress-block vertical-center">
      {props.animate ? (<div>
      <div className="bg"></div>
      <div className="bg bg2"></div>
      <div className="bg bg3"></div></div>) : <div></div>
      }
      <h1>{props.progress.title}</h1>
      {/*<p>{props.progress.info}</p> */}
      <ProgressBar 
        className="progress-wrapper" 
        completed={
          props.progress.progress == null ? 0 : props.progress.progress
        }
        transitionDuration="100ms"
        isLabelVisible={false}
        bgColor="var(--main-button-bg-color)"
        borderRadius="0px"
      />
    </div>
} 
 