import * as React from 'react';
import Menu from './menu';
import { Backend } from '../operations/backend';
import '../styles/index.css';
import SlidingBackground from './sliding_background';
import Loading from './loading';
import { ExpandSidebar } from './expand_sidebar';
import { Logs } from '../operations/log_singleton';
import { SourceMapDevToolPlugin } from 'webpack';
import '../operations/background_music';
import BackgroundMusic from '../operations/background_music';
import * as LauncherConfig from '../operations/launcher_config';
import { skyline } from 'nx-request-api';
import { BrowserRouter, HashRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {Pages} from '../constants';
import MainMenu from './main_menu';
import ErrorPage from './error_page';
import PullRequestMenu from './menus/pull_request_menu';
import StageConfigMenu from './stage_config/stage_config_menu';

export default function App() {
  useEffect(() => {
    Logs.instance();
  }, []);

  return (
      <HashRouter>
        <Routes>
          <Route path={Pages.STARTUP} element={<Navigate to={Pages.LOADING_SCREEN}/>}/>
          <Route path={Pages.LOADING_SCREEN} element={<Loading/>}/>
          <Route path={Pages.MAIN_MENU} element={<MainMenu/>}/>
          <Route path={Pages.STAGE_CONFIG} element={<StageConfigMenu/>}/>
          <Route path={Pages.PULL_REQUESTS} element={<PullRequestMenu/>}/>
        </Routes>
      </HashRouter>
  );
}