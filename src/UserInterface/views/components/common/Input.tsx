import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select'
import { useDispatch } from "react-redux";

import { onTextInputChange, onSelectChange, onRangeChange } from "../../../store/actions/settings"
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
      alignItems: "center",
      fontWeight: 500,
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
    },
  }),
);

export default function Input(props: { config, elementIndex, mainId, subIndex })
{
  const classes = useStyles();
  const { config, elementIndex, mainId, subIndex } = props;

  const dispatch = useDispatch();
  const labelElelent = config.label ? (<label>{`${config.label}:`}</label>) : null;

  const keyExtractor = (other, subElementIndex, elementType) =>
  {
    let key = `${mainId}-${subIndex}-${elementIndex}-${elementType}`;
    if (other) key += `-${other}`
    if (subElementIndex) key += `-${subElementIndex}`;
    return { key }
  }

  const inputElement = (config, subElementIndex) =>
  {
    const { value, isReadOnly, options, subElements, icon } = config;
    switch (config.type)
    {
      case "input":
        return (<input
          {...keyExtractor(null, subElementIndex, config.type)}
          onChange={(event) => (!isReadOnly) ? dispatch(onTextInputChange(
            { mainId, subIndex, elementIndex, value: event.target.value, subElementIndex })) : null}
          value={value}
          className={
            isReadOnly ?
              `${classes.textInput} ${classes.readOnlyInput}`
              : classes.textInput}>
        </input >
        );
      case "select":
        return (
          <Select
            {...keyExtractor(null, subElementIndex, config.type)}
            value={value}
            onChange={(event) =>
              dispatch(onSelectChange({
                mainId,
                subIndex,
                elementIndex,
                subElementIndex,
                value: event.target.value
              }))}
          >
            {options.map((option, idx) =>
              <MenuItem value={idx}
                {...keyExtractor(idx, subElementIndex, config.type)}>
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
      case "color-table":
        return (<CompactColorPicker
          value={value}
          mainId={mainId}
          subIndex={subIndex}
          elementIndex={elementIndex}
        ></CompactColorPicker>);
      case "range":
        return <input type="range"
          onChange={(event) =>
            dispatch(onSelectChange({
              mainId,
              subIndex,
              elementIndex,
              subElementIndex,
              value: event.target.value
            }))}
          className="slider"
          min="0"
          max="100">
        </input>;
      case "image-button":
        return <div
          {...keyExtractor(null, subElementIndex, config.type)}
          className={`input-icon ${icon.selected ? "input-icon-selected" : ""}`}
        >
          <Icon
            type={icon.type}
            name={icon.name}
          />
        </div>
      case "input-group":
        return subElements.map((element, idx) => inputElement(element, idx));
      default:
        return null;
    }
  };

  return <section className={classes.formField}>
    <div className={classes.formLabel}>
      {labelElelent}
    </div>
    <div className={classes.formInput}>
      {inputElement(config, null)}
    </div>
  </section>
}