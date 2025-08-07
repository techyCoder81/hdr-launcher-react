import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusCheckbox } from 'renderer/components/buttons/focus_checkbox';
import { Pages } from 'renderer/constants';
import { ACTIVE_CONFIG_FILE, BACKUP_STAGE_CONFIG, OFFICIAL_STAGE_CONFIG, Page, loadStageConfig, saveStageConfig } from 'renderer/operations/stage_config';
import { Stage, StageInfo } from 'renderer/operations/stage_info';
import { FocusButton } from '../../components/buttons/focus_button';
import { FullScreenDiv } from '../../components/fullscreen_div';
import StageListBox from './stage_list_box';
import { StagePreview } from './stage_preview';
import { useStageConfig } from './stage_config_provider';
import StageConfigToggler from './stage_config_toggler';
import StagePager from './stage_list_pager';

export default function StageConfigMenu() {
  const navigate = useNavigate();
  const {
    initialized,
    setInitialized,
    stages,
    setStages,
    setHoveredStage,
    enabled,
    setEnabled,
    pages,
    setPages,
    setCurrentPage
  } = useStageConfig()

  useEffect(() => {
    if (initialized) {
      return;
    }

    loadStageConfig(ACTIVE_CONFIG_FILE)
      .then(async (stageConfig) => {
        setEnabled(stageConfig.enabled);
        setHoveredStage(null)
        setPages(stageConfig.pages);
        setCurrentPage(0);
        new StageInfo()
          .list()
          .then((list) => {
            setStages(list)
            setInitialized(true);
          })
          .catch((e) => alert(`failed to set stage options: ${e}`));
      })
      .catch((e) => alert(`failed to preload stage config: ${e}`));
  }, [initialized, enabled, pages]);

  return (
    <FullScreenDiv>
      <div id="header-bar" className="border-bottom" style={{}}>
        <FocusButton
          text="Cancel"
          onClick={() => {
            setInitialized(false);
            navigate(Pages.MAIN_MENU);
          }}
          className="simple-button-bigger"
          onFocus={() => {}}
          autofocus
        />
        {initialized ? (
          <FocusButton
            text="Reset"
            onClick={() => {
              setInitialized(false);
            }}
            className="simple-button-bigger"
            onFocus={() => {}}
            autofocus
          />
        ) : (
          <div />
        )}
        {initialized ? (
          <FocusButton
            text="Save & Exit"
            onClick={() => {
              saveStageConfig(ACTIVE_CONFIG_FILE, {
                enabled,
                pages
              })
              .then(() => {
                navigate(Pages.MAIN_MENU);
              })
              .catch((e) => alert(`failed to save stage config: ${e}`));
            }}
            className="simple-button-bigger"
            onFocus={() => {}}
            autofocus
          />
        ) : (
          <div />
        )}
        <StageConfigToggler />
      </div>
      {initialized && stages ? (
        <div id="main-content" className="stage-config-body">
          <div style={{ width: '15%' }}>
            <StagePager />
          </div>
          <div style={{ width: '25%' }}>
            <StageListBox
              category="Starter"
            />
            <StageListBox
              category="Counterpick"
            />
          </div>
          <div style={{ width: '60%', height: '100%' }}>
            <div style={{ margin: 10, height: '80%' }}>
              <StagePreview />
            </div>
          </div>
        </div>
      ) : (
        <div>loading...</div>
      )}
    </FullScreenDiv>
  );
}
