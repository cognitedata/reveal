import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { CircularProgress } from '@material-ui/core';
import BrokenImage from '@material-ui/icons/BrokenImage';
import Filter1 from '@material-ui/icons/Filter1';
import Filter2 from '@material-ui/icons/Filter2';
import Filter3 from '@material-ui/icons/Filter3';
import Filter4 from '@material-ui/icons/Filter4';
import Filter5 from '@material-ui/icons/Filter5';
import Filter6 from '@material-ui/icons/Filter6';
import Filter7 from '@material-ui/icons/Filter7';
import Filter8 from '@material-ui/icons/Filter8';
import Filter9 from '@material-ui/icons/Filter9';
import Filter9Plus from '@material-ui/icons/Filter9Plus';
import ImageSearch from '@material-ui/icons/ImageSearch';
import { SpeedDial, SpeedDialIcon, SpeedDialAction } from '@material-ui/lab';
import { TS_FIX_ME } from 'core';

import { shortDateTime } from '_helpers/date';
import { SliceCollection } from 'modules/seismicSearch/types';

const getIcon = (slices: TS_FIX_ME) => {
  switch (slices.length || 0) {
    case 1:
      return Filter1;
    case 2:
      return Filter2;
    case 3:
      return Filter3;
    case 4:
      return Filter4;
    case 5:
      return Filter5;
    case 6:
      return Filter6;
    case 7:
      return Filter7;
    case 8:
      return Filter8;
    case 9:
      return Filter9;

    default:
      return Filter9Plus;
  }
};
interface SearchHistoryProps {
  sliceSearches: SliceCollection;
  isVisible: boolean;
  handleOnItemClick: (item: TS_FIX_ME) => void;
}

const SearchHistory: React.FC<SearchHistoryProps> = ({
  handleOnItemClick,
  sliceSearches,
  isVisible,
}) => {
  const [open, setOpen] = React.useState(false);

  const Icon = useMemo(() => {
    return getIcon(sliceSearches);
  }, [sliceSearches]);

  const isLoading = useMemo(() => {
    return sliceSearches.filter((s) => s.isLoading).length > 0;
  }, [sliceSearches]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const selectItem = (item: TS_FIX_ME) => {
    setOpen(false);
    handleOnItemClick(item);
  };

  const { t } = useTranslation('SeismicData');

  return (
    <>
      <SpeedDial
        ariaLabel={t('Data search history')}
        hidden={!isVisible}
        aria-label="Date history"
        icon={
          <SpeedDialIcon
            aria-label="Progress"
            icon={
              <>
                {isLoading && <CircularProgress />}
                <Icon />{' '}
              </>
            }
          />
        }
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {sliceSearches.map((slice: TS_FIX_ME) => (
          <SpeedDialAction
            key={slice.id}
            aria-label="Date"
            icon={
              // eslint-disable-next-line no-nested-ternary
              slice.isLoading ? (
                <>
                  <ImageSearch style={{ width: 20, height: 20 }} />
                  <CircularProgress style={{ position: 'absolute' }} />
                </>
              ) : slice.hasError ? (
                <BrokenImage />
              ) : (
                <ImageSearch />
              )
            }
            tooltipTitle={shortDateTime(slice.time)}
            onClick={() => selectItem(slice)}
          />
        ))}
      </SpeedDial>
    </>
  );
};

export default SearchHistory;
