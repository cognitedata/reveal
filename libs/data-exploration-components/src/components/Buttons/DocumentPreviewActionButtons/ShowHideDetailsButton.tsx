import { IconButton } from '../IconButton/IconButton';
import { HIDE_DETAILS, SHOW_DETAILS } from './constants';

type Props = {
  showSideBar: boolean;
  onClick: () => void;
};

export const ShowHideDetailsButton = ({ showSideBar, onClick }: Props) => {
  return (
    <IconButton
      icon={showSideBar ? 'PanelRight' : 'PanelLeft'}
      tooltipContent={showSideBar ? HIDE_DETAILS : SHOW_DETAILS}
      aria-label="Toggle file preview sidebar view"
      onClick={onClick}
      type="ghost"
    />
  );
};
