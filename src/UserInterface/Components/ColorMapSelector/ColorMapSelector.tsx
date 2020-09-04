import React from "react";
import { InputBase, MenuItem, Theme } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Select from "@material-ui/core/Select";
import withStyles from "@material-ui/core/styles/withStyles";
import styled from "styled-components";
import ListItemText from "@material-ui/core/ListItemText";
import { ISelectOption } from "@/UserInterface/Components/Settings/Types";

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

const StyledInput = withStyles((theme: Theme) => ({
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

const useStyles = makeStyles(() => ({
  menuItem: {
    display: "flex",
    padding: "0.3rem 0.3rem",
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
  options?: ISelectOption[];
  colorMapOptions?: Array<string>[];
  value?: string;
  onChange?: (event: React.ChangeEvent<any>) => void;
  disabled?: boolean;
}) {
  const { options, colorMapOptions, value, onChange, disabled } = props;
  const classes = useStyles();

  return (
    <StyledSelect
      labelId="color-map-select"
      id="color-map-select"
      value={value}
      disabled={disabled}
      onChange={onChange}
      input={<StyledInput />}
    >
      {options?.map((option: ISelectOption, index: number) => {
        let colors: string[] = [];
        if (colorMapOptions) {
          colors = colorMapOptions[index];
        }
        return (
          <MenuItem
            className={classes.menuItem}
            value={option.value}
            key={option.value}
          >
            {colors.length > 0 && <ColorMap colors={colors} />}
            <StyledListItemText>{option.label}</StyledListItemText>
          </MenuItem>
        );
      })}
    </StyledSelect>
  );
}
