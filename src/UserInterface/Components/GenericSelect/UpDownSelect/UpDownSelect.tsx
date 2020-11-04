import React from 'react';
import ArrowDropUpIcon from '@material-ui/icons/ArrowDropUp';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import makeStyles from '@material-ui/core/styles/makeStyles';
import withStyles from '@material-ui/core/styles/withStyles';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { Theme } from '@material-ui/core/styles';
import { ICommonSelectProps } from '@/UserInterface/Components/Settings/Types';
import { NumericUtils } from '@/UserInterface/Foundation/Utils/numericUtils';

const ArrowButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.action.active,
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    minWidth: '100%',
    borderRadius: 0,
    border: 'none',
    padding: 0,
    minHeight: '50%',
    '&:hover': {
      border: 'none',
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
    '&:focus': {
      border: 'none',
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))(Button);

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 0,
    borderColor: '#b5b5b5',
    boxSizing: 'border-box',
  },
  buttonGroup: {
    height: '100%',
    width: '1rem',
    flex: '0 0 1rem',
  },
}));

interface UpDownSelectProps extends ICommonSelectProps {
  node: React.ReactElement<ICommonSelectProps, any>;
}

export const UpDownSelect = (props: UpDownSelectProps) => {
  const { options, extraOptionsData, value, onChange, disabled, node } = props;
  const classes = useStyles();

  const updateState = (updateVal: string) => {
    if (onChange) {
      onChange(updateVal);
    }
  };
  const handleChange = (event) => {
    if (event.target) {
      updateState(event.target.value);
    } else {
      updateState(event);
    }
  };

  const setPrevOption = () => {
    if (options) {
      const newIndex =
        NumericUtils.findIndexOfValueInOptions(options, value) - 1;
      if (newIndex < 0) return;
      updateState(options[newIndex].value);
    }
  };
  const setNextOption = () => {
    if (options) {
      const newIndex =
        NumericUtils.findIndexOfValueInOptions(options, value) + 1;
      if (newIndex >= options.length) return;
      updateState(options[newIndex].value);
    }
  };

  return (
    <Box display="flex" className={`up-down-select ${classes.root}`}>
      {React.cloneElement(node, {
        options,
        value,
        onChange: handleChange,
        disabled,
        extraOptionsData,
      })}
      <ButtonGroup
        className={classes.buttonGroup}
        orientation="vertical"
        color="primary"
        aria-label="vertical outlined primary button group"
      >
        <ArrowButton onClick={setPrevOption} disabled={disabled}>
          <ArrowDropUpIcon />{' '}
        </ArrowButton>
        <ArrowButton onClick={setNextOption} disabled={disabled}>
          <ArrowDropDownIcon />{' '}
        </ArrowButton>
      </ButtonGroup>
    </Box>
  );
};
