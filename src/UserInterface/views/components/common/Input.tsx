import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select'
import { useDispatch } from "react-redux";

import { onTextInputChange, onSelectChange } from "../../../store/actions/settings"
import Icon from "./Icon";
import CompactColorPicker from "./CompactColorPicker";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    },
    formContainer: {
      width: "100%",
      backgroundImage: "linear-gradient(to right, #e9e9e9, #d5d5d5)",
      display: "flex",
      flexDirection: "column",
      padding: "0.5rem 0",
    },
    formField: {
      flex: 1,
      display: "flex",
      position: "relative",
      marginBottom: "0.1rem"
    },
    formLabel: {
      flex: 1,
      display: "flex",
      marginLeft: ".5rem",
      fontSize: ".7rem",
      fontWeight: 400,
    },
    formInput: {
      flex: 1,
      display: "flex",
      position: "relative",
    },
    textInput: {
      height: "0.9rem",
      borderWidth: "1.2px",
      borderColor: "#c4c4c4",
      borderStyle: "solid",
      fontSize: ".6rem",
      padding: ".1rem",
      flex: 1,
      fontWeight: 500,
      width: 0
    },
    readOnlyInput: {
      background: "#ffffc4"
    },
    select: {
      height: "1.2rem",
      borderWidth: "1.2px",
      borderColor: "#c4c4c4",
      borderStyle: "solid",
      fontSize: ".6rem",
      fontWeight: 500,
      flex: 1
    },
    checkbox: {
      position: "absolute",
      left: "-.8rem"
    },
    option: {
      fontFamily: "Roboto",
      fontSize: ".6rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    optionText: {
      marginLeft: "0.5rem",
      color: "#6a0dad"
    }
  }),
);

export default function Input(props: { config, index, mainId, subIndex })
{
  const classes = useStyles();
  const { config, index, mainId, subIndex } = props;
  const { label, value, isReadOnly, options } = config;

  const dispatch = useDispatch();
  const labelElelent = (<label>{`${label}:`}</label>);
  let inputElement = null;

  switch (config.type)
  {
    case "input":
      inputElement = (<input
        onChange={(event) =>
        {
          if (!isReadOnly)
            dispatch(onTextInputChange(
              { mainId, subIndex, elementIndex: index, value: event.target.value }))
        }}
        value={value}
        className={
          isReadOnly ?
            `${classes.textInput} ${classes.readOnlyInput}`
            : classes.textInput}>
      </input>
      );
      break;
    case "input-group":
      inputElement = value.map((val, idx) =>
        <input
          key={`${mainId}-${subIndex}-group-${idx}`}
          className={`${classes.textInput} ${isReadOnly ? classes.readOnlyInput : ""}`}
          value={val}
          onChange={() => { }}
        >
        </input>);
      break;
    case "select":
      inputElement = (
        <Select
          value={value}
          onChange={(event) =>
            dispatch(onSelectChange({
              mainId,
              subIndex,
              elementIndex: index,
              value: event.target.value
            }))}
        >
          {options.map((option, idx) =>
            <MenuItem value={idx} key={
              `${mainId}-${subIndex}-select-${index}-${idx}`}>
              <div className={classes.option}>
                {option.icon ?
                  <Icon
                    name={option.icon.name}
                    type={option.icon.type}>
                  </Icon> : null}
                <span className={classes.optionText}>{option.name}</span>
              </div>
            </MenuItem>)}
        </Select>);
      break;
    case "color-table":
      inputElement = (<CompactColorPicker
        value={value}
        mainId={mainId}
        subIndex={subIndex}
        elementIndex={index}
      ></CompactColorPicker>);
      break;
    default:
      inputElement = (<input className={classes.textInput}></input>);
  }

  return <section className={classes.formField}>
    <div className={classes.formLabel}>
      {labelElelent}
    </div>
    <div className={classes.formInput}>
      {inputElement}
    </div>
  </section>
}