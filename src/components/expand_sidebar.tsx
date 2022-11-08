import React from 'react';
import { Backend } from '../backend';
import '../styles/sidebar.css';
import { FocusButton } from './focus_button';
import { LogWindow } from './log_window';

export class ExpandSidebar extends React.Component {
    state = {
        isOpen: false,
        contents: "No logs."
    }

    render() {
        return <div className={'sidebar-container' + (this.state.isOpen ? ' wide' : '')}>
                <div className='button-container'>
                    <FocusButton 
                        className='open-button simple-button' 
                        onClick={() => this.setState({isOpen: !this.state.isOpen, contents: this.state.contents})}
                        text={this.state.isOpen ? "Close Logs" : "Open Logs"}                       
                    />
                </div>
                {
                    this.state.isOpen ? <div className={"open-sidebar" + (Backend.isNode() ? " blur-back" : " opaque")}>
                    <LogWindow/>
                </div> : <div/>
                }
        </div>
    }
}