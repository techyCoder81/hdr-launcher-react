import { useEffect, useState } from 'react';
import { Backend } from '../../operations/backend';

export const CheckingInstalled = (props: {
  onComplete: (installedVersion: string | null) => void;
}) => {
  const [installed, setInstalled] = useState(null as null | string);

  useEffect(() => {
    Backend.instance()
      .getVersion()
      .then(version => props.onComplete(version))
      .catch(async (e) => {
        let backend = Backend.instance();
        let root = await backend.getSdRoot();
        try {
          let prVersion = await backend.readFile(root + "ultimate/mods/hdr-pr/ui/hdr_version.txt");
          props.onComplete(prVersion);
        } catch (e) {
          console.error('Error while checking if HDR is installed!\n' + e);
          alert('Error while checking if HDR is installed!\n' + e);
          props.onComplete(null);
        }
      });
  }, []);

  return <div>checking if HDR is installed...</div>;
};
