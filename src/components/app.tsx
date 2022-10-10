import * as React from 'react';
import Menu from "./menu";
import { Backend, NodeBackend, SwitchBackend } from "../backend";
import '../styles/index.css';
import {Header} from './header';
import Sidebar from './sidebar';
import * as skyline from '../skyline';
import SlidingBackground from './sliding_background';
import Loading from './loading';

export default class App extends React.Component {

  state = {
    version: "unknown",
    loading: true
  }

  componentDidMount(): void {
    Backend.instance()
      .getVersion()
      .then(version => this.setState({version: version, loading: this.state.loading}))
      .then(() => setTimeout(() => {this.setState({version: this.state.version, loading: false})}, 3000))
      .catch(e => console.error(e));
  }

  updateVersion() {  
    console.info("version update triggered!");
    Backend.instance()
      .getVersion()
      .then(theversion => {
        this.setState({version: theversion, loading: this.state.loading});
        console.info("setting version:" + theversion);
      })
      .catch(e => console.error(e));
  }

  render() {
    return (
      <div>
        <Header version={this.state.version} />
        {Backend.isNode() ? (<SlidingBackground/>) : <div className='gradient-background'></div>
        }
        {this.state.loading ?
          <Loading/> : <div/>}
        <div className='app-body'>
          <div className="left-side" id="left-side">
            <Menu onUpdate={() => this.updateVersion()}/>
          </div>
          <div className="right-side" id="right-side">
            <Sidebar/>
          </div>
        </div>
      </div>
    )
  }
}