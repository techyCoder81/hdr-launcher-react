import * as React from 'react';
import { useEffect, useState } from 'react';
import { Backend } from '../operations/backend';

/**
 * header implementation
 */
function HeaderInner(props: { version: string; submenu: string[] }) {
  const [launcherVersion, setLauncherVersion] = useState('unknown');

  useEffect(() => {
    Backend.instance()
      .getLauncherVersion()
      .then((version) => setLauncherVersion(version))
      .catch((e) => alert(e));
  }, []);

  return (
    <div id="header" className="header">
      <p id="title" className="header-item">
        HDR {Backend.platformName()} Launcher{' '}
        {props.submenu.length > 0 ? ' > ' + props.submenu.join('>') : ''}
      </p>
      <p id="version" className="header-right">
        HDR {props.version}, Launcher v{launcherVersion}
      </p>
    </div>
  );
}

export const Header = React.memo(HeaderInner);
