import React from 'react';
import logo from '../../../../assets/logo_full.png';
import { stageInfo } from '../../operations/stage_info';


// require() all of the stage previews
Object.keys(stageInfo).forEach((key) => {
  try {
    require('../../../../assets/stage_previews/stage_2_' +
      key.toLowerCase() +
      '.jpg');
  } catch {
    console.warn('Could not find stage preview for: ' + key);
  }
});

export function StagePreview(props: { stageName: string | null }) {
  if (props.stageName === null) {
    return (
      <div className="image preview">
        <img src={logo} alt="Logo" />
      </div>
    );
  }

  return (
    <div className="image preview" key={props.stageName}>
      <h1
        style={{
          border: '3px solid var(--main-button-border-color)',
          transform: 'skewX(-20deg)',
          boxShadow: '3px 3px 5px #333',
          backgroundColor: 'var(--main-button-bg-color)',
          color: 'var(--main-text-color)',
          fontSize: '2rem',
          textAlign: 'right',
          position: 'absolute',
          paddingLeft: '25px',
          top: 15,
          left: -20,
        }}
      >
        {(stageInfo[props.stageName]
          ? stageInfo[props.stageName].display_name
          : props.stageName) + '\u00A0'}
      </h1>
      <img 
        src={'/static/stage_2_' + props.stageName.toLowerCase() + '.jpg'} 
        alt="Preview"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          console.warn("failed to load preview!");
          currentTarget.src=logo;
        }}
      />
    </div>
  );
};
