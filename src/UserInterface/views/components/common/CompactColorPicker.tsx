import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { CompactPicker } from "react-color"

import { onCompactColorChange } from "../../../store/actions/settings"

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      position: "relative",
    },
    colorDisplay: {
      height: "1rem",
      borderWidth: "1px",
      borderColor: "#c4c4c4",
      borderStyle: "solid",
      fontSize: ".6rem",
      paddingLeft: ".1rem",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      backgroundColor: "white"
    },
    picker: {
      position: "absolute",
      zIndex: 900,
      left: 0,
    },
    colorBox: {
      width: "0.5rem",
      height: "0.5rem",
      borderWidth: "1px",
      borderColor: "#c4c4c4",
      borderStyle: "solid",
    },
    colorName: {
      marginLeft: "0.1rem"
    }
  }),
);

export default function CompactColorPicker(props)
{
  const classes = useStyles();

  const { value: color, mainId, subIndex, elementIndex } = props;
  const dispatch = useDispatch();
  const [visible, setVisibility] = useState(false);

  return <div className={classes.container}>

    <div className={classes.colorDisplay} onClick={() => setVisibility(!visible)}>
      <span className={classes.colorBox} style={{ backgroundColor: color }}></span>
      <span className={classes.colorName}><b>{color}</b></span>
    </div>
    {visible && <div className={classes.picker}>
      <CompactPicker
        color={color}
        onChangeComplete={({ hex }) => dispatch(onCompactColorChange({
          mainId,
          subIndex,
          elementIndex,
          value: hex
        }))}
      /></div>}
  </div>
} 