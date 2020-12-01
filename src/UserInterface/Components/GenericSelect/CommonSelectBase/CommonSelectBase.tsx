import React from 'react';
import { InputBase, MenuItem, Theme, ListItemIcon } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Select from '@material-ui/core/Select';
import withStyles from '@material-ui/core/styles/withStyles';
import ListItemText from '@material-ui/core/ListItemText';
import {
  ISelectOption,
  ICommonSelectProps,
  ICommonSelectExtraOptionData,
} from '@/UserInterface/Components/Settings/Types';

const CommonSelect = withStyles(() => ({
  root: {
    height: '100%',
    padding: '5px 5px',
    flex: '1 1 auto',
    borderRadius: 0,
    boxSizing: 'border-box',
  },
  select: {
    display: 'flex',
    alignItems: 'center',
  },
}))(Select);

const CommonSelectInput = withStyles((theme: Theme) => ({
  root: {
    height: '100%',
    flex: '1 1 auto',
    width: '50px',
    borderRadius: 0,
  },
  input: {
    borderRadius: 0,
    position: 'relative',
    fontSize: theme.typography.button.fontSize,
    color: '#000',
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.primary.contrastText,
    transition: theme.transitions.create(['border-color']),
    '&:focus': {
      borderColor: '#80bdff',
    },
  },
}))(InputBase);

const WrappingListItemText = withStyles(() => ({
  primary: {
    display: 'flex',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}))(ListItemText);

const SelectOptionIcon = withStyles(() => ({
  root: {
    minWidth: 40,
  },
}))(ListItemIcon);

const useStyles = makeStyles(() => ({
  menuItem: {
    display: 'flex',
    padding: '0.3rem 0.3rem',
  },
}));

type CommonSelectBaseProps = ICommonSelectProps & {
  onChange?: (event: React.ChangeEvent<any>) => void;
  iconNode?: React.ReactElement<
    { data?: ICommonSelectExtraOptionData; value?: string },
    any
  >;
};

export const CommonSelectBase = (props: CommonSelectBaseProps) => {
  const {
    id,
    options,
    extraOptionsData,
    value,
    onChange,
    disabled,
    iconNode,
  } = props;
  const classes = useStyles();

  return (
    <CommonSelect
      labelId="common-select-base"
      id={id}
      value={value}
      disabled={disabled}
      onChange={onChange}
      input={<CommonSelectInput />}
    >
      {options?.map((option: ISelectOption, index: number) => {
        const getIconNode = () => {
          if (iconNode) {
            if (extraOptionsData) {
              return React.cloneElement(iconNode, {
                data: extraOptionsData[index],
                value: option.value,
              });
            }
          }
          return null;
        };

        return (
          <MenuItem
            className={classes.menuItem}
            value={option.value}
            key={option.value}
          >
            <SelectOptionIcon>{getIconNode()}</SelectOptionIcon>
            <WrappingListItemText>{option.label}</WrappingListItemText>
          </MenuItem>
        );
      })}
    </CommonSelect>
  );
};
