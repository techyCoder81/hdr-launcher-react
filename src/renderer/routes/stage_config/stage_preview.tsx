import React, { useEffect, useState } from 'react';
import { Backend } from 'renderer/operations/backend';
import logo from '../../../../assets/logo_full.png';
import { StageInfo, Stage } from '../../operations/stage_info';
import { useStageConfig } from './stage_config_provider';

export function StagePreview() {
  const { hoveredStage } = useStageConfig();
  const info = new StageInfo();

  const labelStyle = {
    border: '3px solid var(--main-button-border-color)',
    transform: 'skewX(-20deg)',
    boxShadow: '3px 3px 5px #333',
    backgroundColor: 'var(--main-button-bg-color)',
    color: 'var(--main-text-color)',
    fontSize: '2rem',
    textAlign: 'right' as const,
    position: 'relative' as const,
    display: 'inline-block' as const,
    paddingLeft: '50px',
    paddingRight: '5px',
    top: 15,
    left: -45,
  };

  const detailsStyle = {
    border: '2px solid var(--main-button-border-color)',
    transform: 'skewX(-20deg)',
    boxShadow: '3px 3px 5px #333',
    backgroundColor: 'var(--main-button-bg-color)',
    color: 'var(--main-text-color)',
    fontSize: '1.25rem',
    textAlign: 'right' as const,
    position: 'relative' as const,
    paddingLeft: '50px',
    paddingRight: '5px',
    display: 'inline-block' as const,
    top: 15,
    left: -45,
  };

  if (hoveredStage === null) {
    return (
      <div className="image preview">
        <img src={logo} alt="Logo" />
      </div>
    );
  }

  return (
    <div className="image preview" key={hoveredStage?.display_name}>
      <div style={{ left: 0, top: 0, position: 'absolute' }}>
        <div style={labelStyle}>{hoveredStage?.display_name}</div>
        <br />
        {/* <div style={detailsStyle}>Top Blastzone: {hoveredStage.blastzones.top}</div><br/>
        <div style={detailsStyle}>Side Blastzone: {hoveredStage.blastzones.side}</div><br/>
        <div style={detailsStyle}>Bottom Blastzone: {hoveredStage.blastzones.bottom}</div><br/> */}
      </div>
      <img
        style={{
          position: 'absolute',
          zIndex: -1,
          height: '100%',
          top: 0,
          left: 0,
        }}
        src={`/static/stage_2_${hoveredStage?.name_id.toLowerCase()}.jpg`}
        alt="Preview"
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          console.warn('failed to load preview!');
          currentTarget.src = logo;
        }}
      />
    </div>
  );
}
