import { useTranslation } from '@data-exploration-lib/core';

import { IconButton } from '../IconButton/IconButton';

import { HIDE_DETAILS, SHOW_DETAILS } from './constants';

type Props = {
  showSideBar: boolean;
  onClick: () => void;
};

export const ShowHideDetailsButton = ({ showSideBar, onClick }: Props) => {
  const { t } = useTranslation();

  return (
    <IconButton
      icon={showSideBar ? 'PanelRight' : 'PanelLeft'}
      tooltipContent={
        showSideBar
          ? t('HIDE_DETAILS', HIDE_DETAILS)
          : t('SHOW_DETAILS', SHOW_DETAILS)
      }
      aria-label="Toggle file preview sidebar view"
      onClick={onClick}
      type="ghost"
    />
  );
};
