import { useEffect, useState } from 'react';
import { Backend } from '../../operations/backend';

export const CheckingInstalled = (props: {
  onComplete: (installedVersion: string | null) => void;
}) => {
  const [installed, setInstalled] = useState(null as null | string);

  useEffect(() => {
    Backend.instance()
      .getVersion()
      .then((version) => props.onComplete(version))
      .catch(async (e) => {
        const backend = Backend.instance();
        const root = await backend.getSdRoot();
        try {
          const prVersion = await backend.readFile(
            `${root}ultimate/mods/hdr-pr/ui/hdr_version.txt`
          );
          const prEnabled = await backend.isModEnabled(
            'sd:/ultimate/mods/hdr-pr'
          );
          // if the PR build is enabled, then use that
          if (prEnabled) {
            props.onComplete(prVersion);
          } else {
            props.onComplete(null);
          }
        } catch (e) {
          console.error(`Error while checking if HDR is installed!\n${e}`);
          alert(`Error while checking if HDR is installed!\n${e}`);
          props.onComplete(null);
        }
      });
  }, []);

  return <div>checking if HDR is installed...</div>;
};
