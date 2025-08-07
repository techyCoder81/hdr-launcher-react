import { useStageConfig } from './stage_config_provider';
import FocusTimer from 'renderer/operations/focus_singleton';

interface StageConfigTogglerProps {
  className?: string;
  onFocus?: () => void;
  autofocus?: boolean;
}

export default function StageConfigToggler({ 
  className = "simple-button-bigger", 
  onFocus,
  autofocus = false
}: StageConfigTogglerProps) {
  const { initialized, enabled, setEnabled } = useStageConfig();

  const handleToggle = async (): Promise<void> => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
  };

  if (!initialized) {
    return (<div />);
  }

  return (
    <button
      className={className}
      autoFocus={autofocus}
      onMouseMove={(e) => e.currentTarget.focus()}
      onMouseEnter={(e) => e.currentTarget.focus()}
      onMouseLeave={(e) => e.currentTarget.blur()}
      onBlur={(e) => {
        // Same focus behavior as FocusCheckbox
        if (!FocusTimer.request()) {
          e.currentTarget.focus();
        }
      }}
      onFocus={() => {
        if (onFocus) {
          onFocus();
        }
      }}
      onClick={() => {
        handleToggle().catch((e) => console.error('Toggle failed:', e));
      }}
    >
      Enabled&nbsp;
      <input
        className="focus-check"
        type="checkbox"
        readOnly
        checked={enabled} // Directly use context state - no internal state management!
      />
    </button>
  );
}