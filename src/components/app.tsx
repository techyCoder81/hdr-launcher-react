import * as React from 'react';
import Menu from "./menu";
import { Backend, NodeBackend, SwitchBackend } from "../backend";
import '../styles/index.css';
import Header from './header';
import Sidebar from './sidebar';
import * as skyline from '../skyline';

export default class App extends React.Component {

  state = {
    version: "unknown"
  }

  componentDidMount(): void {
    this.updateVersion();
  }

  updateVersion() {
    Backend.instance()
      .getVersion()
      .then(version => this.setState({version: version}))
      .catch(e => console.error(e));
  }

  render() {
    return (
      <div>
        <Header version={this.state.version} />
        {Backend.isNode() ? (<div>
        <div className="bg"></div>
        <div className="bg bg2"></div>
        <div className="bg bg3"></div></div>) : <div></div>
        }
        <div className='app-body'>
          <div className="left-side" id="left-side">
            <Menu onUpdate={() => this.updateVersion}/>
          </div>
          <div className="right-side" id="right-side">
            <Sidebar/>
          </div>
        </div>
      </div>
    )
  }
}