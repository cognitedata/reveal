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

import { shortDateTime } from '_helpers/date';
import layers from '_helpers/zindex';
import withStyles from 'styles/withStyles';

const styles = (theme) => ({
  speedDial: {
    position: 'fixed',
    bottom: 100,
    right: 32,
    zIndex: layers.SEARCH_HISTORY,
  },
  icon: {
    width: 20,
    height: 20,
  },
  errorIcon: {
    width: 20,
    height: 20,
    fill: theme.palette.error.main,
    color: theme.palette.error.main,
  },
  fabLoader: {
    position: 'absolute',
    height: '56px !important',
    width: '56px !important',
    left: 0,
    top: 0,
    color: theme.palette.primary.opacity80,
    fill: theme.palette.primary.opacity80,
  },
});

const getIcon = (slices) => {
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

const SearchHistory = withStyles(styles)((props) => {
  const { classes, handleOnItemClick, sliceSearches, isVisible } = props;
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

  const selectItem = (item) => {
    setOpen(false);
    handleOnItemClick(item);
  };

  const { t } = useTranslation('SeismicData');

  return (
    <>
      <SpeedDial
        ariaLabel={t('Data search history')}
        className={classes.speedDial}
        hidden={!isVisible}
        aria-label="Date history"
        icon={
          <SpeedDialIcon
            aria-label="Progress"
            icon={
              <>
                {isLoading && (
                  <CircularProgress className={classes.fabLoader} />
                )}
                <Icon />{' '}
              </>
            }
          />
        }
        onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {sliceSearches.map((slice) => (
          <SpeedDialAction
            key={slice.id}
            aria-label="Date"
            icon={
              // eslint-disable-next-line no-nested-ternary
              slice.isLoading ? (
                <>
                  <ImageSearch style={{ width: 20, height: 20 }} />
                  <CircularProgress
                    style={{ position: 'absolute' }}
                    className={classes.icon}
                  />
                </>
              ) : slice.hasError ? (
                <BrokenImage className={classes.errorIcon} />
              ) : (
                <ImageSearch className={classes.icon} />
              )
            }
            tooltipTitle={shortDateTime(slice.time)}
            onClick={() => selectItem(slice)}
          />
        ))}
      </SpeedDial>
    </>
  );
});

export default SearchHistory;
