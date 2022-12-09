import * as React from 'react';
import Menu from "./menu";
import { Backend } from "../operations/backend";
import '../styles/index.css';
import SlidingBackground from './sliding_background';
import Loading from './loading';
import {ExpandSidebar} from './expand_sidebar';
import { Logs } from '../operations/log_singleton';
import { SourceMapDevToolPlugin } from 'webpack';
import '../operations/background_music';
import BackgroundMusic from '../operations/background_music';
import * as LauncherConfig from '../operations/launcher_config';
import { skyline } from 'nx-request-api';

export default class App extends React.Component {

  state = {
    loading: true,
  }

  componentDidMount(): void {
    //BackgroundMusic.singleton().fadeIn();
    Logs.instance();
  }

  componentWillUnmount(): void {
    //BackgroundMusic.singleton().fadeTo(0.0);
  }

  render() {
    return (
      <div className='full'>
        
        {Backend.isNode() ? (<SlidingBackground/>) : <div className='gradient-background'></div>
        }
        {this.state.loading ?
            <Loading onLoad={() => {
              this.setState({loading: false});
            }}/>: <div/>}
          <Menu/>
        <ExpandSidebar/>
      </div>
    )
  }
}