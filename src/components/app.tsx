import * as React from 'react';
import Menu from "./menu";
import { Backend, NodeBackend, SwitchBackend } from "../backend";
import '../styles/index.css';
import Header from './header';
import Sidebar from './sidebar';

export default class App extends React.Component {

  render() {
    return (
      <div>
        <Header/>
        {Backend.instance() instanceof NodeBackend ? (<div>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div></div>) : <div></div>
        }
        <div className='app-body'>
          <div className="left-side" id="left-side">
            <Menu />
          </div>
          <div className="right-side" id="right-side">
            <Sidebar/>
          </div>
        </div>
      </div>
    )
  }
}