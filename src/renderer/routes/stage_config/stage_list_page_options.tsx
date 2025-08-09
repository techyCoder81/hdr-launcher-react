import { FocusButton } from 'renderer/components/buttons/focus_button';
import { FocusCombo } from 'renderer/components/buttons/focus_combo';
import { useStageConfig } from './stage_config_provider';

const MAX_PAGES = 8;
const BACKGROUND_COLOR = 'var(--main-button-bg-color)';

export default function StagePageOptions() {
  const { pages, setPage, currentPage, setHoveredStage } = useStageConfig();
  const page = pages[currentPage];

  const defaultPreset = 'Use Preset List?';
  const presetListOptions = ['HDR Seasonal'];

  const defaultName = 'Change Page Name';
  const pageNameOptions = [
    `Page ${currentPage + 1}`,
    '1v1',
    'Singles',
    '2v2',
    'Doubles',
    'Gentleman',
    'Bracket',
    'Friendlies',
    'Casual',
    ...presetListOptions,
  ];

  return (
    <div style={{ height: '237px', position: 'relative', padding: 0 }}>
      <div
        className="thick-border"
        style={{
          position: 'relative',
          top: '2.5%',
          left: '2.5%',
          height: '95%',
          width: '95%',
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
          Options
        </h2>
        <PageDropdown
          options={[defaultName, ...pageNameOptions]}
          selected={defaultName}
          onChange={async (e) => {
            const newName = e.target.value;
            if (newName === defaultName) {
              return;
            }
            const newPage = {
              ...page,
              name: newName,
            };
            setPage(currentPage, newPage);
          }}
          onRemove={() => {}}
          showClear={false}
        />
        <PageDropdown
          options={[defaultPreset, ...presetListOptions]}
          selected={page.useOfficial ? presetListOptions[0] : defaultPreset}
          onChange={async (e) => {
            const newPage = {
              ...page,
              useOfficial: e.target.value !== defaultPreset,
            };
            setPage(currentPage, newPage);
            setHoveredStage(null);
          }}
          onRemove={() => {
            const newPage = {
              ...page,
              useOfficial: false,
            };
            setPage(currentPage, newPage);
            setHoveredStage(null);
          }}
          showClear={page.useOfficial}
        />
      </div>
    </div>
  );
}

function PageDropdown(props: {
  options: string[];
  onChange: (item: { target: { value: string } }) => void;
  onRemove: () => void;
  selected: string;
  showClear?: boolean;
}) {
  return (
    <div>
      <FocusCombo
        className="hover-color"
        style={{
          width: props.showClear ? '90%' : '100%',
          color: 'white',
          fontSize: 'large',
          paddingTop: 3,
          paddingBottom: 3,
        }}
        onChange={props.onChange}
        forcedValue={props.selected}
        onFocus={() => {}}
        options={props.options}
      />
      {props.showClear && (
        <FocusButton
          className="hover-color"
          style={{
            width: '10%',
            color: 'pink',
            fontWeight: 'bold',
            fontSize: 'large',
            paddingTop: 3,
            paddingBottom: 1,
          }}
          text="X"
          onFocus={() => {}}
          onClick={props.onRemove}
        />
      )}
    </div>
  );
}
