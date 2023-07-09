import './styles/index.css';
import Loading from './routes/loading';
import { Logs } from './operations/log_singleton';
import './operations/background_music';
import {
  BrowserRouter,
  HashRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import React, { useEffect } from 'react';
import { Pages } from './constants';
import PullRequestMenu from './routes/pull_request_menu';
import StageConfigMenu from './routes/stage_config/stage_config_menu';
import Main from './routes/menus/main';
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
        <Route
          path={Pages.STARTUP}
          element={<Navigate to={Pages.LOADING_SCREEN} />}
        />
        <Route path={Pages.LOADING_SCREEN} element={<Loading />} />
        <Route
          path={Pages.MAIN_MENU}
          element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <Main />
            </ErrorBoundary>
          }
        />
        <Route
          path={Pages.STAGE_CONFIG}
          element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <StageConfigMenu />
            </ErrorBoundary>
          }
        />
        <Route
          path={Pages.PULL_REQUESTS}
          element={
            <ErrorBoundary fallback={<ErrorPage />}>
              <PullRequestMenu />
            </ErrorBoundary>
          }
        />
      </Routes>
    </HashRouter>
  );
}

const ErrorPage = () => {
  return (
    <div>
      <div
        style={{
          top: '25%',
          bottom: '25%',
          left: '25%',
          right: '25%',
          position: 'absolute',
        }}
      >
        <div
          style={{
            color: 'white',
            textAlign: 'center',
            top: '50%',
            transform: 'translate(0, -50%)',
            position: 'relative',
          }}
        >
          An unexpected error ocurred in the launcher! Check the logs to
          investigate.
          <NavigateButton
            className="simple-button"
            text="Return to Main Menu"
            page={Pages.LOADING_SCREEN}
          />
        </div>
      </div>
      <ErrorBoundary fallback={<div>failed to load log window.</div>}>
        <LogPopout />
      </ErrorBoundary>
    </div>
  );
};

class ErrorBoundary extends React.Component<{
  children: JSX.Element[] | JSX.Element;
  fallback: JSX.Element;
}> {
  state = {
    hasError: false,
  };

  constructor(props: {
    children: JSX.Element[] | JSX.Element;
    fallback: JSX.Element;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    // logErrorToMyService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback;
    }

    return this.props.children;
  }
}
