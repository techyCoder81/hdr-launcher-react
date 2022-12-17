import React from 'react';
import { Remark } from 'react-remark';
import { Backend } from '../operations/backend';
import { getInstallType, getRepoName } from '../operations/install';

type Props = {
  versions: string[];
};

/**
 * changelog implementation
 */
export default class Changelog extends React.Component<Props> {
  state = {
    text: 'Getting Updates...',
  };

  constructor(props: Props) {
    super(props);
    var check = async () => {
      let logs = '';
      for (var version of props.versions) {
        await Backend.instance()
          .getJson(
            'https://github.com/HDR-Development/' +
              getRepoName(getInstallType(version)) +
              '/releases/download/' +
              version.split('-')[0] +
              '/CHANGELOG.md'
          )
          .then((str) => (logs += str + '\n'))
          .catch((e) => console.info(e));
      }
      this.setState({ text: logs });
    };
    check();
  }

  render() {
    return (
      <div>
        <p>
          <Remark>{this.state.text}</Remark>
        </p>
      </div>
    );
  }
}
