import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

export const StyledTabs = withStyles(() => ({
  root: {
    minHeight: '30px',
    height: '100%',
  },
}))(Tabs);

export const StyledTab = withStyles((theme) => ({
  root: {
    padding: 0,
    textTransform: 'none',
    minWidth: '80px',
    minHeight: '30px',
    color: theme.palette.primary.contrastText,
    background: theme.palette.primary.light,
    border: '1px solid rgba(0, 0, 0, 0.1)',
    borderBottom: 0,
    boxShadow: theme.shadows[4],
    '&:hover': {
      color: theme.palette.secondary.contrastText,
      opacity: 1,
    },
    '&$selected': {
      background: theme.palette.secondary.light,
      color: theme.palette.secondary.contrastText,
    },
    '&:focus': {
      backgroundColor: theme.palette.secondary.dark,
      indicator: {
        backgroundColor: theme.palette.primary.dark,
      },
    },
  },
  selected: {},
  // eslint-disable-next-line react/jsx-props-no-spreading
}))((props: any) => <Tab disableRipple {...props} />);
