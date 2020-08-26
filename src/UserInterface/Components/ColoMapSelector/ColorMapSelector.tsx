import React from "react";
import { InputBase, MenuItem, Theme } from "@material-ui/core";
import ArrowDropUpIcon from "@material-ui/icons/ArrowDropUp";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import withStyles from "@material-ui/core/styles/withStyles";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import styled from "styled-components";
import ListItemText from "@material-ui/core/ListItemText";

const ColorButton = withStyles((theme) => ({
  root: {
    color: theme.palette.action.active,
    backgroundColor: theme.palette.background.paper,
    width: "100%",
    minWidth: "100%",
    borderRadius: 0,
    border: "none",
    padding: 0,
    minHeight: "50%",
    "&:hover": {
      border: "none",
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
    "&:focus": {
      border: "none",
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.dark,
    },
  },
}))(Button);

const StyledSelect = withStyles(() => ({
  root: {
    height: "100%",
    padding: "5px 5px",
    flex: "1 1 auto",
    borderRadius: 0,
    boxSizing: "border-box",
  },
  select: {
    display: "flex",
    alignItems: "center",
  },
}))(Select);

const StyledInput = withStyles((theme) => ({
  root: {
    height: "100%",
    flex: "1 1 auto",
    width: "50px",
    borderRadius: 0,
  },
  input: {
    borderRadius: 0,
    position: "relative",
    fontSize: theme.typography.button.fontSize,
    color: theme.palette.primary.contrastText,
    backgroundColor: theme.palette.background.paper,
    borderColor: theme.palette.primary.contrastText,
    transition: theme.transitions.create(["border-color"]),
    "&:focus": {
      borderColor: "#80bdff",
    },
  },
}))(InputBase);

const StyledListItemText = withStyles(() => ({
  primary: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
}))(ListItemText);

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
    width: "100%",
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 0,
    borderColor: theme.palette.primary.main,
    boxSizing: "border-box",
  },
  menuItem: {
    display: "flex",
    padding: "0.3rem 0.3rem",
  },
  buttonGroup: {
    height: "100%",
    width: "1rem",
    flex: "0 0 1rem",
  },
}));
export interface ColorMapProps {
  readonly colors?: string[];
}

const ColorMap = styled.div<ColorMapProps>`
  height: 100%;
  min-height: 1rem;
  min-width: 2rem;
  border-radius: 0.15rem;
  margin-inline-end: 0.5rem;
  background-image: linear-gradient(
    to right,
    ${(props) => (props.colors ? props.colors.join(",") : "")}
  );
`;

export function ColorMapSelector(props: {
  options?: string[];
  colorMapOptions?: Array<string>[];
  value?: string;
  onChange?: (val: string) => void;
  disabled?: boolean;
}) {
  const { options, colorMapOptions, value, onChange, disabled } = props;
  const classes = useStyles();

  const updateState = (updateVal: string) => {
    if (onChange) {
      onChange(updateVal);
    }
  };
  const handleChange = (event) => {
    updateState(event.target.value);
  };
  const findIndexOfValueInOptions = (valueOptions: string[], val?: string) => {
    // will return -1 if value is not found in options
    return valueOptions.findIndex((optionValue) => optionValue === val) || 0;
  };
  const setPrevOption = () => {
    if (options) {
      const newIndex = findIndexOfValueInOptions(options, value) - 1;
      if (newIndex < 0) return;
      updateState(options[newIndex]);
    }
  };
  const setNextOption = () => {
    if (options) {
      const newIndex = findIndexOfValueInOptions(options, value) + 1;
      if (newIndex >= options.length) return;
      updateState(options[newIndex]);
    }
  };

  return (
    <Box display="flex" className={classes.root}>
      <StyledSelect
        labelId="color-map-select"
        id="color-map-select"
        value={value}
        disabled={disabled}
        onChange={handleChange}
        input={<StyledInput />}
      >
        {options?.map((option: string, index: number) => {
          let colors: string[] = [];
          if (colorMapOptions) {
            colors = colorMapOptions[index];
          }
          return (
            <MenuItem className={classes.menuItem} value={option} key={option}>
              {colors.length && <ColorMap colors={colors} />}
              <StyledListItemText>{option}</StyledListItemText>
            </MenuItem>
          );
        })}
      </StyledSelect>
      <ButtonGroup
        className={classes.buttonGroup}
        orientation="vertical"
        color="primary"
        aria-label="vertical outlined primary button group"
      >
        <ColorButton onClick={setPrevOption} disabled={disabled}>
          <ArrowDropUpIcon />{" "}
        </ColorButton>
        <ColorButton onClick={setNextOption} disabled={disabled}>
          <ArrowDropDownIcon />{" "}
        </ColorButton>
      </ButtonGroup>
    </Box>
  );
}
