import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusCheckbox } from 'renderer/components/buttons/focus_checkbox';
import { Pages } from 'renderer/constants';
import { ACTIVE_CONFIG_FILE, BACKUP_STAGE_CONFIG, OFFICIAL_STAGE_CONFIG, Page, StageConfig, loadStageConfig, saveStageConfig } from 'renderer/operations/stage_config';
import { Stage, StageInfo } from 'renderer/operations/stage_info';
import { FocusButton } from '../../components/buttons/focus_button';
import { FullScreenDiv } from '../../components/fullscreen_div';
import StageListBox from './stage_list_box';
import { StagePreview } from './stage_preview';
import { useStageConfig } from './stage_config_provider';
import StageConfigToggler from './stage_config_toggler';

export default function StageConfigMenu() {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState(null as Stage | null);
  const [stages, setStages] = useState(null as string[] | null);
  const {initialized, setInitialized, enabled, setEnabled, pages, setPages, currentPage, setCurrentPage} = useStageConfig()
  
  const addNewPage = () => {
    const newPage = {
      name: `Page ${pages.length + 1}`,
      useOfficial: false,
      starters: [],
      counterpicks: []
    };
    setPages([...pages, newPage]);
  };
  
  const removePage = (index: number) => {
    const newPages = pages.filter((_, i) => i !== index);
    setPages(newPages);
  };

  useEffect(() => {
    if (initialized) {
      return;
    }

    loadStageConfig(ACTIVE_CONFIG_FILE)
      .then(async (stageConfig) => {
        setEnabled(stageConfig.enabled);
        setPages(stageConfig.pages);
        setCurrentPage(0);
        setInitialized(true);
      })
      .catch((e) => alert(`failed to preload stage config: ${e}`));
  }, [initialized, enabled, pages]);

  useEffect(() => {
    new StageInfo()
      .list()
      .then((list) => setStages(list.map((stage) => stage?.display_name)))
      .catch((e) => alert(`failed to set new options: ${e}`));
  }, [initialized, enabled, pages]);

  const page = pages[0] ?? {
    name: "Page 1",
    starters: [],
    counterpicks:[],
  };

  return (
    <FullScreenDiv>
      <div id="header-bar" className="border-bottom" style={{}}>
        <FocusButton
          text="Back"
          onClick={async () => {
            if (initialized) {
              await saveStageConfig(ACTIVE_CONFIG_FILE, {
                enabled,
                pages,
              });
            }
            navigate(Pages.MAIN_MENU);
          }}
          className="simple-button-bigger"
          onFocus={() => {}}
          autofocus
        />
        {initialized ? (
          <StageConfigToggler />
        ) : (
          <div />
        )}
      </div>
      {initialized && stages ? (
        <div id="main-content" className="stage-config-body">
          <div style={{ width: '40%' }}>
            <StageListBox
              category="Starter"
              stages={page.starters}
              options={stages}
              onUpdate={async (stages) => {
                const newPage: Page = {
                  ...page,
                  starters: stages
                }
                const newPages = [...pages]
                newPages[0] = newPage;
                setPages(newPages);
                await saveStageConfig(ACTIVE_CONFIG_FILE, {
                  enabled,
                  pages: newPages,
                });
              }}
              onHover={(stage) => setHoveredStage(stage)}
              disabled={page.useOfficial}
            />
            <StageListBox
              category="Counterpick"
              stages={page.counterpicks}
              options={stages}
              onUpdate={async (stages) => {
                const newPage: Page = {
                  ...page,
                  counterpicks: stages
                }
                const newPages = [...pages]
                newPages[0] = newPage;
                setPages(newPages);
                await saveStageConfig(ACTIVE_CONFIG_FILE, {
                  enabled,
                  pages: newPages,
                });
              }}
              onHover={(stage) => setHoveredStage(stage)}
              disabled={page.useOfficial}
            />
          </div>
          <div style={{ width: '60%', height: '100%' }}>
            <div style={{ margin: 10, height: '80%' }}>
              {hoveredStage !== null ? (
                <StagePreview stage={hoveredStage} />
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>loading...</div>
      )}
    </FullScreenDiv>
  );
}
