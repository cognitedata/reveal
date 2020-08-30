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
import ButtonGroup from "@material-ui/core/ButtonGroup";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import withStyles from "@material-ui/core/styles/withStyles";
import { Util } from "@/Core/Primitives/Util";

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
  button: {
    flex: "0 0 2ch",
    minWidth: "2ch",
    height: "100%",
    borderRadius: 0,
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
  },
  buttonGroup: {
    height: "100%",
    width: "1rem",
    flex: "0 0 1rem",
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

const ColorButton = withStyles((theme) => ({
  root: {
    backgroundColor: "white",
    width: "100%",
    minWidth: "0.8rem",
    padding: 2,
    borderRadius: 0,
    minHeight: "0.8rem",
    height: "50%",
    "&:hover": {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))(Button);

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
  options: string[];
  value: string;
  onChange: (value: string) => void;
  optionHeight: number;
  maxOptions: number;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(3);
  const [displayValue, setDisplayValue] = useState(props.value);
  const classes = useStyles({
    optionHeight: props.optionHeight,
    maxOptions: props.maxOptions,
  });
  let selectedMenuItem;

  useEffect(() => {
    const value = props.options[selectedIndex];
    selectedMenuItem = document.getElementById(`item-id-${value}`);
    if (selectedMenuItem) selectedMenuItem.scrollIntoView();
  });

  const updateValue = (event) => {
    const { value } = event.target;
    const value2 = Util.getNumber(value);
    const closest = props.options.reduce((prev, curr) =>
      Math.abs(Util.getNumber(curr) - value2) <
      Math.abs(Util.getNumber(prev) - value2)
        ? curr
        : prev
    );
    const newIndex = props.options.indexOf(closest);
    setSelectedIndex(newIndex);
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

  const setPrevOption = () => {
    const newIndex =
      selectedIndex < props.options.length - 1
        ? selectedIndex + 1
        : props.options.length - 1;
    const value = props.options[newIndex];

    setSelectedIndex(newIndex);
    setDisplayValue(value);
    props.onChange(value);
  };

  const setNextOption = () => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : 0;
    const value = props.options[newIndex];

    setSelectedIndex(newIndex);
    setDisplayValue(value);
    props.onChange(value);
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
            <Input
              id="standard-number"
              fullWidth
              inputProps={{ "aria-label": "Z-Scale" }}
              value={displayValue}
              onChange={handleValueChange}
              onKeyUp={handleKeyPress}
            />
            <ButtonGroup
              className={classes.buttonGroup}
              orientation="vertical"
              color="primary"
              aria-label="vertical outlined primary button group"
            >
              <ColorButton>
                <ArrowDropUpIcon onClick={setPrevOption} />{" "}
              </ColorButton>
              <ColorButton>
                <ArrowDropDownIcon onClick={setNextOption} />{" "}
              </ColorButton>
            </ButtonGroup>
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
                          id={`item-id-${option}`}
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
