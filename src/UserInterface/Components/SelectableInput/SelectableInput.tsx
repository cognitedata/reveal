import React, { useRef, useState } from "react";
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
import Divider from "@material-ui/core/Divider";
import { HTMLUtils } from "@/UserInterface/Foundation/Utils/HTMLUtils";

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
  inputGroup: {
    display: "flex",
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
  },
  input: {
    flex: "auto",
    width: "50%",
    height: "100%",
  },
  button: {
    flex: "0 0 2ch",
    minWidth: "2ch",
    height: "100%",
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: "center",
    color: theme.palette.text.secondary,
  },
  divider: {
    height: "80%",
    margin: "auto",
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

export default function SelectableInput(props: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  optionHeight: number;
  maxOptions: number;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [displayValue, setDisplayValue] = useState(props.value);
  const classes = useStyles({
    optionHeight: props.optionHeight,
    maxOptions: props.maxOptions,
  });

  const updateValue = (event) => {
    const { value } = event.target;
    setDisplayValue(value);
    props.onChange(value);
  };

  const handleMenuItemClick = (event, index) => {
    const value = props.options[index];
    setSelectedIndex(index);
    setOpen(false);
    setDisplayValue(value);
    props.onChange(value);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
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
    HTMLUtils.onEnter(updateValue)(event);
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
            className={classes.inputGroup}
            color="primary"
            ref={anchorRef}
            aria-label="split button"
          >
            <InputBase
              className={classes.input}
              id="standard-number"
              type="number"
              fullWidth
              inputProps={{ "aria-label": "Z-Scale" }}
              value={displayValue}
              onChange={handleValueChange}
              onKeyUp={handleKeyPress}
            />
            <Divider className={classes.divider} orientation="vertical" />
            <Button
              className={classes.button}
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
              /* eslint-disable-next-line react/jsx-props-no-spreading */
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
                      {props.options.map((option, index) => (
                        <MenuItem
                          className={classes.menuItem}
                          key={option}
                          selected={index === selectedIndex}
                          onClick={(event) => handleMenuItemClick(event, index)}
                        >
                          {option}
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
