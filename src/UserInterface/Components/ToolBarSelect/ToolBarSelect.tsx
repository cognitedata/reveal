import React, { useState } from "react";
import { Util } from "@/Core/Primitives/Util";
import { HTMLUtils } from "@/UserInterface/Foundation/Utils/HTMLUtils";
import { Button, TextField, Select } from "@material-ui/core";
import Tooltip from "@material-ui/core/Tooltip";
import {
  createStyles,
  makeStyles,
  Theme,
  withStyles,
} from "@material-ui/core/styles";

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      marginLeft: "2px",
    },
    input: {
      position: "absolute",
      "& div": {
        backgroundColor: "rgba(255, 255, 255, 255)",
        border: "none !important",
        borderRadius: "4px 0px 0px 4px",
        "& input": {
          padding: "1px !important",
          textAlign: "right",
        },
      },
    },
    select: {
      position: "absolute",
      backgroundColor: "rgba(255, 255, 255, 255)",
      border: "none !important",
      borderRadius: "4px 4px 4px 4px",
      "& select": {
        margin: "0px !important",
      },
      "&:hover": {
        border: "none !important",
      },
      "&:after": {
        borderBottom: "none",
      },
    },
    controls: {
      fontSize: "1rem",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    controlOption: {
      boxShadow: "none !important",
      position: "initial",
      "&:hover": {
        backgroundColor: "lightblue",
        borderColor: "lightblue",
      },
    },
    updateButton: {
      position: "absolute",
      visibility: "hidden",
    },
  })
);

// Custom tooltip with white background
const CustomToolTip = withStyles((theme: Theme) => ({
  tooltip: {
    backgroundColor: theme.palette.common.white,
    color: "rgba(0, 0, 0, 0.87)",
    boxShadow: theme.shadows[1],
    fontSize: "0.7rem",
  },
}))(Tooltip);

export default function ToolBarSelect(props: {
  options: string[];
  currentValue: string;
  onChange: (value: string) => void;
  tooltip?: {
    text: string;
    placement?: "bottom" | "right-start";
  };
  iconSize?: { width: number; height: number };
}) {
  const { options, currentValue, onChange, tooltip, iconSize } = props;
  const classes = useStyles();
  const [displayValue, setDisplayValue] = useState(currentValue);

  const groupStyle = iconSize
    ? { width: iconSize.width, height: iconSize.height }
    : {};
  const inputStyle = iconSize
    ? { width: iconSize.width - 20, height: iconSize.height }
    : {};
  const dropDownStyle = iconSize
    ? { width: iconSize.width, height: iconSize.height - 0.5 }
    : {};
  const optionTextStyle = iconSize ? { fontSize: iconSize.height / 2 } : {};

  const updateValue = (event) => {
    const { value } = event.target;
    const updatedValue = Util.getNumber(value) > 0 ? value : "0.1";
    setDisplayValue(updatedValue);
    onChange(updatedValue);
  };

  const handleValueChange = (event) => {
    setDisplayValue(event.target.value);
  };

  const handleKeyPress = (event) => {
    return HTMLUtils.onEnter(updateValue)(event);
  };

  const dropDown = () => {
    return (
      <div className={classes.root} style={groupStyle}>
        <Button className={classes.updateButton} />
        <Select
          className={classes.select}
          native
          style={dropDownStyle}
          value={currentValue}
          onChange={updateValue}
        >
          {options
            ? options.map((option) => (
                <option key={option} style={optionTextStyle}>
                  {option}
                </option>
            ))
            : null}
        </Select>
        <TextField
          className={classes.input}
          type="number"
          variant="outlined"
          style={inputStyle}
          value={displayValue}
          onChange={handleValueChange}
          onKeyUp={handleKeyPress}
        />
      </div>
    );
  };

  return (
    <div className="icon">
      {tooltip ? (
        <CustomToolTip
          title={
            <div className="image-tooltip">
              <span>{tooltip.text}</span>
            </div>
          }
          placement={tooltip.placement}
        >
          {dropDown()}
        </CustomToolTip>
      ) : (
        dropDown()
      )}
    </div>
  );
}
