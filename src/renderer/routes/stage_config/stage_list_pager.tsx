import { useCallback, useEffect, useState } from 'react';
import { FocusButton } from 'renderer/components/buttons/focus_button';
import { FocusCombo } from 'renderer/components/buttons/focus_combo';
import { Backend } from 'renderer/operations/backend';
import { Page } from 'renderer/operations/stage_config';
import { Stage, StageInfo } from 'renderer/operations/stage_info';
import { useStageConfig } from './stage_config_provider';

const MAX_PAGES = 8;
const BACKGROUND_COLOR = 'var(--main-button-bg-color)';

export default function StagePager() {
  const { initialized, pages, addPage, currentPage, setHoveredStage } =
    useStageConfig();
  const page = pages[currentPage];

  return (
    <div style={{ height: '331px', position: 'relative', padding: 0 }}>
      <div
        className="thick-border"
        style={{
          position: 'relative',
          top: '2.5%',
          left: '2.5%',
          height: '95%',
          width: '97.5%',
        }}
      >
        <h2
          style={{
            color: 'white',
            backgroundColor: BACKGROUND_COLOR,
            padding: 5,
          }}
          className="border-bottom"
        >
          Pages
        </h2>
        {initialized ? (
          pages.map((entry, idx) => <PageItem idx={idx} onHover={() => {}} />)
        ) : (
          <div />
        )}
        {pages.length < MAX_PAGES ? (
          <FocusButton
            className="hover-color"
            text="+"
            style={{
              width: '100%',
              color: 'lightgreen',
              fontWeight: 'bold',
              fontSize: 'large',
              paddingTop: 3,
              paddingBottom: 1,
              paddingLeft: 10,
              paddingRight: 10,
            }}
            onClick={async () => {
              addPage();
              setHoveredStage(null);
            }}
            onFocus={() => {}}
          />
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

/**
 * Represents a row in the stage list window, including a combo box (dropdown) and a 'remove' button
 * @param props.page the current page
 * @returns void
 */
function PageItem(props: { idx: number; onHover?: (page: Page) => void }) {
  const { pages, removePage, currentPage, setCurrentPage, setHoveredStage } =
    useStageConfig();
  const disabled = pages.length <= 1;
  return (
    <div>
      <FocusButton
        className={`hover-color${props.idx === currentPage ? '-selected' : ''}`}
        text={pages[props.idx].name}
        style={{
          width: disabled ? '100%' : '80%',
          color: 'white',
          fontSize: 'large',
          border: 1,
          paddingTop: 3,
          paddingBottom: 3,
        }}
        onClick={() => {
          setCurrentPage(props.idx);
          setHoveredStage(null);
        }}
        onFocus={() => {}}
      />
      {!disabled && (
        <FocusButton
          className="hover-color"
          style={{
            width: '20%',
            color: 'pink',
            fontWeight: 'bold',
            fontSize: 'large',
            paddingTop: 3,
            paddingBottom: 1,
          }}
          text="X"
          onFocus={() => {
            if (props.onHover) {
              props.onHover(pages[props.idx]);
            }
          }}
          onClick={() => {
            removePage(props.idx);
            setHoveredStage(null);
          }}
        />
      )}
    </div>
  );
}
