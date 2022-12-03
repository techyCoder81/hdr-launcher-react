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

export default class App extends React.Component {

  state = {
    loading: true
  }

  componentDidMount(): void {
    //BackgroundMusic.singleton().fadeIn();
    Logs.instance();
    Backend.instance()
      .getVersion()
      .then(version => this.setState({loading: this.state.loading}))
      .then(() => setTimeout(() => {this.setState({loading: false})}, 3000))
      .catch(e => console.error(e));
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
          <Loading/> : <div/>}
          <Menu/>
          <ExpandSidebar/>
      </div>
    )
  }
}