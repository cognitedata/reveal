import React from "react";
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select'
import { useDispatch } from "react-redux";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSortUp, faSortDown } from '@fortawesome/free-solid-svg-icons';

import {
  onTextInputChange,
  onSelectChange,
  onRangeChange,
  onChangeSettingAvailability
} from "../../../redux/actions/settings"
import Icon from "./Icon";
import CompactColorPicker from "./CompactColorPicker";
import { SectionElement } from "../../../interfaces/settings";
import Inputs from "../../../constants/Inputs";
import { isNumber } from "../../../utils/Settings"

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
      margin: "0.05rem 0rem",
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
      alignItems: "center",
    },
    textInput: {
      height: "0.8rem",
      borderWidth: "1px",
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
    checkbox: {
      position: "absolute",
      left: "-1.5rem",
      border: "1px solid black"
    },
    select: {
      width: "100%",
      display: "flex",
      background: "red"
    },
    option: {
      paddingLeft: "0.2rem",
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

function isAvailable(checked?: boolean) {
  if (typeof checked !== "boolean" || checked) return true;
  return false;
}

/**
 * Responsible for rendering dynamic inputs
 * @param props 
 */
export default function Input(props: {
  config: SectionElement,
  elementIndex: number,
  sectionId: number,
  subSectionId?: number
}) {

  const classes = useStyles();
  const { config, elementIndex, sectionId, subSectionId } = props;

  const dispatch = useDispatch();
  const labelElelent = config.label ? (<label>{`${config.label}:`}</label>) : null;

  // Generate keys for mapped components
  const keyExtractor = (extraIdentifier: number | string | null, elementType: string, subElementIndex?: number) => {
    let key = `${sectionId}-${elementIndex}-${elementType}`;
    if (extraIdentifier) key += `-${extraIdentifier}`
    if (subElementIndex) key += `-${subElementIndex}`;
    return { key }
  }

  // Renders input elements dynamically
  const renderInputElement = (
    config: SectionElement,
    checked?: boolean,
    subElementIndex?: number,
  ): any => {

    const { value, isReadOnly, options, subElements, icon } = config;

    switch (config.type) {
      case Inputs.INPUT:
        return (<input
          disabled={!isAvailable(checked)}
          {...keyExtractor(null, config.type, subElementIndex)}
          onChange={(event) => (!isReadOnly) ? dispatch(onTextInputChange(
            { sectionId, subSectionId, elementIndex, value: event.target.value, subElementIndex })) : null}
          value={value}
          className={
            isReadOnly ?
              `${classes.textInput} ${classes.readOnlyInput}`
              : classes.textInput}>
        </input >
        );
      case Inputs.SELECT:
        return (
          <div className="select-group"
            {...keyExtractor(null, config.type, subElementIndex)}
          >
            <Select
              value={value}
              disabled={!isAvailable(checked)}
              onChange={(event) =>
                dispatch(onSelectChange({
                  sectionId,
                  subSectionId,
                  elementIndex,
                  subElementIndex,
                  value: event.target.value
                }))}
            >
              {options!.map((option, idx) =>
                <MenuItem value={idx}
                  {...keyExtractor(idx, config.type, subElementIndex)}>
                  <div className={classes.option}>
                    {option.icon ?
                      <Icon
                        name={option.icon.name}
                        type={option.icon.type} />
                      : null}
                    <span className={classes.optionText}>{option.name}</span>
                  </div>
                </MenuItem>)}
            </Select>
            <div className="select-controls">
              <FontAwesomeIcon icon={faSortUp}
                onClick={() =>
                  isAvailable(checked) &&
                  dispatch(onSelectChange({
                    sectionId,
                    subSectionId,
                    elementIndex,
                    subElementIndex,
                    value: (isNumber(value) && value! > 0 ? value - 1 : 0)
                  }))}></FontAwesomeIcon>
              <FontAwesomeIcon icon={faSortDown} onClick={() =>
                isAvailable(checked) &&
                dispatch(onSelectChange({
                  sectionId,
                  subSectionId,
                  elementIndex,
                  subElementIndex,
                  value: (isNumber(value) && value! < options!.length - 1 ? value + 1 : options!.length - 1)
                }))}></FontAwesomeIcon>
            </div>
          </div>)
      case Inputs.COLOR_TABLE:
        return (<CompactColorPicker
          value={typeof value === "string" ? value : ""}
          sectionId={sectionId}
          subSectionId={subSectionId}
          elementIndex={elementIndex}
        ></CompactColorPicker>);
      case Inputs.RANGE:
        return <input type="range"
          disabled={!isAvailable(checked)}
          onChange={(event) =>
            dispatch(onRangeChange({
              sectionId,
              subSectionId,
              elementIndex,
              subElementIndex,
              value: event.target.value
            }))}
          className="slider"
          min="0"
          max="100">
        </input>;
      case Inputs.IMAGE_BUTTON:
        return <div
          {...keyExtractor(null, config.type, subElementIndex)}
          className={`input-icon ${icon!.selected ? "input-icon-selected" : ""}`}
        >
          <Icon
            type={icon!.type}
            name={icon!.name}
          />
        </div>
      case Inputs.INPUT_GROUP:
        return subElements!.map((element, idx) => renderInputElement(element, checked, idx));
      default:
        return null;
    }
  };

  return <section className={classes.formField}>
    <div className={classes.formLabel}>
      {labelElelent}
    </div>
    <div className={classes.formInput}>
      {config.hasOwnProperty("checked") ?
        <input
          type="checkbox"
          className={classes.checkbox}
          checked={config.checked}
          onChange={(event) => dispatch(onChangeSettingAvailability({
            sectionId,
            subSectionId,
            elementIndex,
          }))}
        >
        </input>
        : null}
      {renderInputElement(config, config.checked)}
    </div>
  </section>
}
