import React, { useEffect, useRef, useState } from "react";
import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Grow from "@material-ui/core/Grow";
import Paper from "@material-ui/core/Paper";
import Popper from "@material-ui/core/Popper";
import MenuItem from "@material-ui/core/MenuItem";
import MenuList from "@material-ui/core/MenuList";
import makeStyles from "@material-ui/core/styles/makeStyles";
import InputBase from "@material-ui/core/InputBase";
import { HTMLUtils } from "@/UserInterface/Foundation/Utils/HTMLUtils";
import withStyles from "@material-ui/core/styles/withStyles";
import InputAdornment from "@material-ui/core/InputAdornment";
import { NumericUtils } from "@/UserInterface/Foundation/Utils/NumericUtils";

const DEFAULT_OPTION_HEIGHT = 40;
const DEFAULT_MAX_OPTIONS = 5;

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    width: "100%",
    height: "100%",
  },
  grid: {
    width: "100%",
    height: "100%",
  },
  gridItem: {
    width: "100%",
    height: "100%",
  },
  paper: {
    display: "flex",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    border: 0,
    borderRadius: 0,
  },
  inputAdornment: {
    height: "100%",
    width: "2ch",
    marginInlineStart: 0,
  },
  selectButton: {
    color: theme.palette.action.active,
    backgroundColor: theme.palette.background.paper,
    margin: 0,
    padding: 0,
    minWidth: "2ch",
    height: "100%",
    borderRadius: 0,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
  },
  menu: (props: { optionHeight: number; maxOptions: number }) => ({
    height: props.optionHeight * props.maxOptions,
    overflowX: "hidden",
    overflowY: "scroll",
  }),
  menuItem: (props: { optionHeight: number; maxOptions: number }) => ({
    height: props.optionHeight,
    width: "8ch",
    fontSize: theme.typography.fontSize,
    paddingLeft: "2ch",
    paddingRight: "2ch",
  }),
}));

const Input = withStyles(() => ({
  root: {
    flex: "auto",
    width: "50%",
    height: "100%",
  },
  input: {
    textAlign: "center",
  },
}))(InputBase);

export default function SelectableInput(props: {
  options?: { label: string; value: string }[];
  value?: string;
  onChange?: (value: string) => void;
  optionHeight?: number;
  maxOptions?: number;
}) {
  const { options, value, onChange, optionHeight, maxOptions } = props;
  const [displayValue, setDisplayValue] = useState(props.value);
  const classes = useStyles({
    optionHeight: optionHeight || DEFAULT_OPTION_HEIGHT,
    maxOptions: maxOptions || DEFAULT_MAX_OPTIONS,
  });
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const selectedIndex = NumericUtils.findIndexOfValueInOptions(options, value);

  useEffect(() => {
    const selectedMenuItem = document.getElementById(`item-id-${value}`);
    if (selectedMenuItem) selectedMenuItem.scrollIntoView();
  });

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  const updateParent = (val: string) => {
    if (onChange) {
      onChange(val);
    }
    setDisplayValue(value);
  };

  const handleEnter = (evt: any): void => {
    const val = evt.target.value;
    if (val) {
      updateParent(val);
    }
  };

  const handleMenuItemClick = (val: string): void => {
    setOpen(false);
    updateParent(val);
  };

  const handleToggle = (): void => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event): void => {
    // @ts-ignore
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleValueChange = (event) => {
    setDisplayValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    HTMLUtils.onEnter(handleEnter)(event);
  };

  return (
    <div className={classes.root}>
      <Grid
        container
        direction="column"
        alignItems="center"
        className={classes.grid}
      >
        <Grid item xs={12} className={classes.gridItem}>
          <Paper
            variant="outlined"
            className={classes.paper}
            color="primary"
            ref={anchorRef}
            aria-label="split button"
          >
            <Input
              id="standard-number"
              fullWidth
              inputProps={{ "aria-label": "Z-Scale" }}
              value={displayValue}
              onChange={handleValueChange}
              onKeyUp={handleKeyPress}
              endAdornment={
                <InputAdornment
                  position="end"
                  className={classes.inputAdornment}
                >
                  <Button
                    className={classes.selectButton}
                    color="primary"
                    size="small"
                    aria-controls={open ? "split-button-menu" : undefined}
                    aria-expanded={open ? "true" : undefined}
                    aria-label="select merge strategy"
                    aria-haspopup="menu"
                    onClick={handleToggle}
                  >
                    <ArrowDropDownIcon />
                  </Button>
                </InputAdornment>
              }
            />
          </Paper>
          <Popper
            open={open}
            anchorEl={anchorRef.current}
            role={undefined}
            modifiers={{
              preventOverflow: {
                enabled: true,
                boundariesElement: "window",
              },
            }}
            transition
            disablePortal
          >
            {({ TransitionProps, placement }) => (
              <Grow
                /* eslint-disable-next-line react/jsx-props-no-spreading */
                {...TransitionProps}
                style={{
                  transformOrigin:
                    placement === "bottom" ? "center top" : "center bottom",
                }}
              >
                <Paper>
                  <ClickAwayListener onClickAway={handleClose}>
                    <MenuList id="split-button-menu" className={classes.menu}>
                      {options?.map((option, index) => (
                        <MenuItem
                          className={classes.menuItem}
                          key={option.value}
                          id={`item-id-${option.label}`}
                          selected={index === selectedIndex}
                          onClick={() => handleMenuItemClick(option.value)}
                        >
                          {option.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </ClickAwayListener>
                </Paper>
              </Grow>
            )}
          </Popper>
        </Grid>
      </Grid>
    </div>
  );
}
