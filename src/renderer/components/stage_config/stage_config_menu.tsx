import { useEffect, useState } from 'react';
import { Backend } from '../../operations/backend';
import { StageConfig } from '../../operations/stage_config';
import { StageParams } from '../../operations/stage_info';
import { FocusButton } from '../buttons/focus_button';
import { FocusCheckbox } from '../buttons/focus_checkbox';
import { ExpandSidebar } from '../expand_sidebar';
import {StageEntry} from './stage_entry';
import * as LauncherConfig from '../../operations/launcher_config';
import { StagePreview } from './stage_preview';

export default function StageConfigMenu(props: { onComplete: () => void }) {
  const [stageData, setStageData] = useState([] as StageParams[]);
  const [isChanged, setChanged] = useState(false);
  const [isShowTourneyMode, showTourneyMode] = useState(false);
  const [focusedName, setFocusedName] = useState(null as string | null);

  useEffect(() => {
    LauncherConfig.isTournamentMode()
      .then(async (enabled) => {
        if (enabled != isShowTourneyMode) {
          // only set this if its different from the current setting
          showTourneyMode(enabled);
        }
        if (enabled) {
          await StageConfig.instance()
            .getAll()
            .then((stages) => setStageData(stages))
            .catch((e) => alert('error loading tourney stage data!'));
        }
      })
      .catch((e) => alert('error checking if tourney mode is on: ' + e));
  }, [isShowTourneyMode]);

  return (
    <div className={'overlay-progress scroll-hidden'}>
      <div className="border-bottom">
        <FocusButton
          autofocus={true}
          className="simple-button-bigger"
          onClick={async () => {
            if (isChanged) {
              let result = confirm('Would you like to save your changes?');
              if (result) {
                await StageConfig.instance()
                  .save()
                  .then(() => alert('changes saved successfully'))
                  .then(() => setChanged(false))
                  .then(() => StageConfig.instance().unload())
                  .catch((e) => alert('eror during save: ' + e));
              }
            }
            props.onComplete();
          }}
          text={'Exit'}
        />
        <FocusCheckbox
          onClick={async () => {
            try {
              let enabled = await LauncherConfig.isTournamentMode();

              // if the previous setting was enabled, and we are disabling,
              // offer to save first.
              if (enabled && isChanged) {
                let ok = confirm('Would you like to save your changes?');
                if (ok) {
                  await StageConfig.instance()
                    .save()
                    .then(() => alert('changes saved successfully'))
                    .then(() => setChanged(false))
                    .then(() => StageConfig.instance().unload())
                    .catch((e) => alert('eror during save: ' + e));
                } else {
                  setChanged(false);
                }
              }

              // turn off tourney mode (and remove the file and backup your settings)
              await LauncherConfig.setTournamentMode(!enabled);
              showTourneyMode(!enabled);
            } catch (e) {
              alert("Error while toggling tourney mode:" + e);
            }
          }}
          checkStatus={async () => {
            let enabled = await LauncherConfig.isTournamentMode();
            showTourneyMode(enabled);
            return enabled;
          }}
          className="simple-button-bigger"
          text="Tournament Mode "
        />
        {isShowTourneyMode ? (
          <FocusButton
            className="simple-button-bigger"
            onClick={async () => {
              StageConfig.instance()
                .setAll(true)
                .then(() => setChanged(true))
                .then(() => StageConfig.instance().getAll())
                .then((stages) => setStageData(stages))
                .catch((e) => alert(e));
            }}
            text="Enable All"
          />
        ) : (
          <div />
        )}
        {isShowTourneyMode ? (
          <FocusButton
            className="simple-button-bigger"
            onClick={async () => {
              StageConfig.instance()
                .setAll(false)
                .then(() => setChanged(true))
                .then(() => StageConfig.instance().getAll())
                .then((stages) => setStageData(stages))
                .catch((e) => alert(e));
            }}
            text="Disable All"
          />
        ) : (
          <div />
        )}
        {isShowTourneyMode ? (
          <FocusButton
            className="simple-button-bigger"
            onClick={async () => {
              let result = confirm(
                'Are you sure you wish to reset to defaults?'
              );
              if (result) {
                await StageConfig.instance()
                  .resetDefaults()
                  .then(() => StageConfig.instance().unload())
                  .then(() => setChanged(true))
                  .then(() => StageConfig.instance().getAll())
                  .then((stages) => setStageData(stages))
                  .then(() => alert('Stages have been reset to defaults!'))
                  .catch((e) => alert('error during save: ' + e));
              }
            }}
            text={'Reset Defaults'}
          />
        ) : (
          <div />
        )}
        {isShowTourneyMode && isChanged ? (
          <FocusButton
            className="simple-button-bigger"
            onClick={async () => {
              let result = confirm('Would you like to save your changes?');
              if (result) {
                await StageConfig.instance()
                  .save()
                  .then(() => setChanged(false))
                  .then(() => alert('changes saved successfully'))
                  .catch((e) => alert('eror during save: ' + e));
              }
            }}
            text={'Save'}
          />
        ) : (
          <div />
        )}
      </div>
      {isShowTourneyMode ? (
        <div className="stage-config-body border-bottom">
          <div className="scrolling-fit left-side">
            {stageData.map((stage) => (
              <StageEntry
                onClick={() => {
                  return StageConfig.instance()
                    .toggle(stage.name_id)
                    .then(() => setChanged(true))
                    .then(async () =>
                      setStageData(await StageConfig.instance().getAll())
                    )
                    .catch((e) => alert(e));
                }}
                enabled={stage.enabled}
                stageName={stage.name_id}
                onFocus={async () => {
                  setFocusedName(stage.name_id);
                }}
              />
            ))}
          </div>
          <div className="right-side">
            <StagePreview stageName={focusedName} />
          </div>
        </div>
      ) : (
        <div />
      )}
      <ExpandSidebar />
    </div>
  );
}
