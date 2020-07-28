import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { ColorResult, CompactPicker } from "react-color";

import Color from "color";
import {onInputChange} from "@/UserInterface/Redux/actions/settings";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      position: "relative"
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
    cover: {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px"
    },
    picker: {
      position: "fixed",
      zIndex: 999
    },
    colorBox: {
      width: "0.5rem",
      height: "0.5rem",
      borderWidth: "1px",
      borderColor: "#c4c4c4",
      borderStyle: "solid"
    },
    colorName: {
      marginLeft: "0.1rem"
    }
  })
);

/**
 * CompactColorPicker component
 */
export default function CompactColorPicker(props: {
  value: string;
  elementIndex: string;
  subElementIndex?: string;
}) {
  const classes = useStyles();
  const { value: color, elementIndex, subElementIndex } = props;
  const dispatch = useDispatch();
  const [visible, setVisibility] = useState(false);

  const handleClose = () => {
    setVisibility(false);
  };

  return (
    <div className={classes.container}>
      <div className={classes.colorDisplay} onClick={() => setVisibility(!visible)}>
        <span className={classes.colorBox} style={{ backgroundColor: color }} />
        <span className={classes.colorName}>
          <b>{color}</b>
        </span>
      </div>
      {visible && (
        <div className={classes.picker}>
          <div className={classes.cover} onClick={handleClose} />
          <CompactPicker
            color={color}
            onChangeComplete={(reactColor: ColorResult) => {
              dispatch(
                onInputChange({
                  elementIndex,
                  subElementIndex,
                  value: Color({ r: reactColor.rgb.r, g: reactColor.rgb.g, b: reactColor.rgb.b })
                })
              );
            }}
          />
        </div>
      )}
    </div>
  );
}
