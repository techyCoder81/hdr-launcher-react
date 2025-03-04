import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FocusCheckbox } from 'renderer/components/buttons/focus_checkbox';
import { Pages } from 'renderer/constants';
import { ACTIVE_CONFIG_FILE, BACKUP_STAGE_CONFIG, ConfigData, loadConfigData, OFFICIAL_STAGE_CONFIG, save } from 'renderer/operations/stage_config';
import { Stage, StageInfo } from 'renderer/operations/stage_info';
import { FocusButton } from '../../components/buttons/focus_button';
import { FullScreenDiv } from '../../components/fullscreen_div';
import StageListBox from './stage_list_box';
import { StagePreview } from './stage_preview';

export default function StageConfigMenu() {
  const navigate = useNavigate();
  const [hoveredStage, setHoveredStage] = useState(null as Stage | null);
  const [config, setConfig] = useState(null as null | ConfigData);
  const [options, setOptions] = useState(null as null | string[]);

  useEffect(() => {
    if (config !== null) {
      return;
    }

    loadConfigData(ACTIVE_CONFIG_FILE)
      .then(async (data) => {
        let enabled = data.enabled;
        if (data.useOfficial) {
          data = await loadConfigData(OFFICIAL_STAGE_CONFIG);
          data.enabled = enabled;
        }
        setConfig(data);
      })
      .catch((e) => alert(`failed to preload stage config: ${e}`));
  }, []);

  useEffect(() => {
    new StageInfo()
      .list()
      .then((list) => setOptions(list.map((stage) => stage?.display_name)))
      .catch((e) => alert(`failed to set new options: ${e}`));
  }, [config]);

  return (
    <FullScreenDiv>
      <div id="header-bar" className="border-bottom" style={{}}>
        <FocusButton
          text="Back"
          onClick={async () => {
            if (config !== null) {
              save(ACTIVE_CONFIG_FILE, config);
            }
            navigate(Pages.MAIN_MENU);
          }}
          className="simple-button-bigger"
          onFocus={() => {}}
          autofocus
        />
        {config ? (
          <FocusCheckbox
            text="Enabled"
            onClick={async () => {
              config.enabled = !config.enabled;
              save(ACTIVE_CONFIG_FILE, config);
            }}
            className="simple-button-bigger"
            onFocus={() => {}}
            checkStatus={async () => {
              return config.enabled;
            }}
          />
        ) : (
          <div />
        )}
        {config ? (
          <FocusCheckbox
            text="Use Seasonal Stagelist"
            onClick={async () => {
              config.useOfficial = !config.useOfficial;
              if (config.useOfficial === true) {
                // save the current stagelist to the backup file, then load the official stagelist
                await save(BACKUP_STAGE_CONFIG, config);
                loadConfigData(OFFICIAL_STAGE_CONFIG).then(async (data) => {
                  const newConfig = new ConfigData(
                    config.enabled,
                    true,
                    data.starters,
                    data.counterpicks
                  );
                  await save(ACTIVE_CONFIG_FILE, newConfig); 
                  setConfig(newConfig);
                  navigate(Pages.STAGE_CONFIG_REFRESH);
                })
              } else {
                // load the stagelist from the backup file
                loadConfigData(BACKUP_STAGE_CONFIG).then(async (data) => {
                  const newConfig = new ConfigData(
                    config.enabled,
                    false,
                    data.starters,
                    data.counterpicks
                  );
                  await save(ACTIVE_CONFIG_FILE, newConfig); 
                  setConfig(newConfig);
                  navigate(Pages.STAGE_CONFIG_REFRESH);
                })
              }
            }}
            className="simple-button-bigger"
            onFocus={() => {}}
            checkStatus={async () => {
              return config.useOfficial;
            }}
          />
        ) : (
          <div />
        )}
      </div>
      {config && options ? (
        <div id="main-content" className="stage-config-body">
          <div style={{ width: '40%' }}>
            <StageListBox
              category="Starter"
              stages={config.starters}
              options={options}
              onUpdate={(stages) => {
                const newConfig = new ConfigData(
                  config.enabled,
                  config.useOfficial,
                  stages,
                  config.counterpicks
                );
                save(ACTIVE_CONFIG_FILE, newConfig);
                setConfig(newConfig);
              }}
              onHover={(stage) => setHoveredStage(stage)}
              disabled={config.useOfficial}
            />
            <StageListBox
              category="Counterpick"
              stages={config.counterpicks}
              options={options}
              onUpdate={(stages) => {
                const newConfig = new ConfigData(
                  config.enabled,
                  config.useOfficial,
                  config.starters,
                  stages
                );
                save(ACTIVE_CONFIG_FILE, newConfig);
                setConfig(newConfig);
              }}
              onHover={(stage) => setHoveredStage(stage)}
              disabled={config.useOfficial}
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
