import './styles/index.css';
import Loading from './routes/loading';
import { Logs } from './operations/log_singleton';
import './operations/background_music';
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {Pages} from './constants';
import PullRequestMenu from './routes/pull_request_menu';
import StageConfigMenu from './routes/stage_config/stage_config_menu';
import Main from './routes/menus/main';
import { ErrorBoundary } from 'react-error-boundary';
import { FocusButton } from './components/buttons/focus_button';
import { NavigateButton } from './components/buttons/navigate_button';
import { LogPopout } from './components/logging/log_popout';

export default function App() {
  useEffect(() => {
    Logs.instance();
  }, []);

  return (
      <HashRouter>
        <Routes>
          <Route path={Pages.STARTUP} element={<Navigate to={Pages.LOADING_SCREEN}/>}/>
          <Route path={Pages.LOADING_SCREEN} element={<Loading/>}/>
          <Route path={Pages.MAIN_MENU} element={<ErrorHandler><Main/></ErrorHandler>}/>
          <Route path={Pages.STAGE_CONFIG} element={<ErrorHandler><StageConfigMenu/></ErrorHandler>}/>
          <Route path={Pages.PULL_REQUESTS} element={<ErrorHandler><PullRequestMenu/></ErrorHandler>}/>
        </Routes>
      </HashRouter>
  );
}

const ErrorPage = (data: {error: any}) => {
  const navigate = useNavigate();
  return <div>
    <div style={{top: '25%', bottom: '25%', left: '25%', right: '25%', position: 'absolute'}}>
      <div style={{color: "white", textAlign: "center", top: "50%",transform: "translate(0, -50%)", position: "relative"}}>
        An unexpected error ocurred in the launcher!
        Details: <br/>
        {JSON.stringify(data.error.message)}<br/>
        <NavigateButton
          className={'simple-button'}
          text='Return to Main Menu'
          page={Pages.LOADING_SCREEN}
        />
      </div>
    </div>
    <ErrorBoundary fallback={<div>failed to load log window.</div>}>
      <LogPopout />
    </ErrorBoundary> 
  </div>

}

const ErrorHandler = (props : {children: JSX.Element[] | JSX.Element}) => {
  return <ErrorBoundary FallbackComponent={ErrorPage}>
    {props.children}
  </ErrorBoundary>
}