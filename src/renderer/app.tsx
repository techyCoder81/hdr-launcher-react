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

export default function App() {
  useEffect(() => {
    Logs.instance();
  }, []);

  return (
      <HashRouter>
        <Routes>
          <Route path={Pages.STARTUP} element={<Navigate to={Pages.LOADING_SCREEN}/>}/>
          <Route path={Pages.LOADING_SCREEN} element={<Loading/>}/>
          <Route path={Pages.MAIN_MENU} element={<Main/>}/>
          <Route path={Pages.STAGE_CONFIG} element={<StageConfigMenu/>}/>
          <Route path={Pages.PULL_REQUESTS} element={<PullRequestMenu/>}/>
        </Routes>
      </HashRouter>
  );
}