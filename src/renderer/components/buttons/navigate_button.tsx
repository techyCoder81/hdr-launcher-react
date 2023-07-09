import { useNavigate } from 'react-router-dom';
import { Pages } from 'renderer/constants';
import { FocusButton } from './focus_button';

export function NavigateButton(props: {
  text: string;
  page: Pages;
  className: string;
  onFocus?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <FocusButton
      text={`${props.text}\u00A0`}
      className={props.className}
      onClick={() => {
        navigate(props.page);
      }}
      onFocus={props.onFocus}
    />
  );
}
