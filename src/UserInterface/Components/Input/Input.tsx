import React from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUp } from "@fortawesome/free-solid-svg-icons/faSortUp";
import { faSortDown } from "@fortawesome/free-solid-svg-icons/faSortDown";

import { onInputChange, onChangeSettingAvailability } from "@/UserInterface/Redux/actions/settings";
import Icon from "../Icon/Icon";
import CompactColorPicker from "../CompactColorPicker/CompactColorPicker";
import Inputs from "@/UserInterface/Components/Settings/ElementTypes";
import { isNumber } from "@/UserInterface/Foundation/Utils/numericUtils";
import Color from "color";
import {SectionElement} from "@/UserInterface/Components/Settings/Types";
import {State} from "@/UserInterface/Redux/State/State";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%"
    },
    formField: {
      flex: 1,
      display: "flex",
      position: "relative",
      margin: "0.05rem 0rem"
    },
    formLabel: {
      flex: 1,
      display: "flex",
      marginLeft: ".5rem",
      fontSize: ".7rem",
      alignItems: "center",
      fontWeight: 500
    },
    formInput: {
      flex: 1,
      display: "flex",
      position: "relative",
      alignItems: "center"
    },
    textInput: {
      height: "0.8rem",
      borderWidth: "1px",
      borderColor: "#c4c4c4",
      borderStyle: "solid",
      fontSize: ".6rem",
      padding: ".1rem",
      flex: 1,
      fontWeight: 400,
      width: 0
    },
    readOnlyInput: {
      background: "#ffffc4"
    },
    checkbox: {
      position: "absolute",
      left: "-1.5rem",
      border: "1px solid black",
      margin: 0
    },
    select: {
      width: "100%",
      display: "flex"
    },
    option: {
      paddingLeft: "0.2rem",
      fontSize: ".6rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start"
    },
    optionText: {
      marginLeft: "0.5rem"
    }
  })
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
  config: SectionElement;
  elementIndex: string;
  sectionId: string;
  subSectionId?: string;
}) {
  const classes = useStyles();
  const { config, elementIndex, sectionId } = props;
  const settings = useSelector((state: State) => state.settings); //TODO: get rid of the reference to store here
  const { subElements } = settings;

  const dispatch = useDispatch();
  const labelElement = config.label ? <label>{`${config.label}:`}</label> : null;

  // Generate keys for mapped Components
  const keyExtractor = (
    extraIdentifier: number | string | null,
    elementType: string,
    subElementIndex?: string
  ) => {
    let key = `${sectionId}-${elementIndex}-${elementType}`;
    if (extraIdentifier) key += `-${extraIdentifier}`;
    if (subElementIndex) key += `-${subElementIndex}`;
    return { key };
  };

  // Renders input elements dynamically
  const renderInputElement = (
    elmConfig: SectionElement,
    checked?: boolean,
    subElementIndex?: string
  ): any => {
    const { value, isReadOnly, options, subElementIds, icon } = elmConfig;

    switch (elmConfig.type) {
      case Inputs.INPUT:
        return (
          <input
            disabled={!isAvailable(checked)}
            {...keyExtractor(null, elmConfig.type, subElementIndex)}
            onChange={event =>
              !isReadOnly
                ? dispatch(
                    onInputChange({
                      elementIndex,
                      subElementIndex,
                      value: event.target.value
                    })
                  )
                : null
            }
            value={value}
            className={
              isReadOnly ? `${classes.textInput} ${classes.readOnlyInput}` : classes.textInput
            }
          />
        );
      case Inputs.SELECT:
        return (
          <div className="select-group" {...keyExtractor(null, elmConfig.type, subElementIndex)}>
            <Select
              value={value}
              disabled={!isAvailable(checked)}
              onChange={event => {
                dispatch(
                  onInputChange({ elementIndex, subElementIndex, value: event.target.value })
                );
              }}
            >
              {options!.map((option, idx) => (
                <MenuItem
                  value={idx}
                  {...keyExtractor(idx, elmConfig.type, subElementIndex)}
                  key={idx}
                >
                  <div className={"select-option " + classes.option}>
                    {option.icon ? <Icon name={option.icon.name} type={option.icon.type} /> : null}
                    <span className={classes.optionText}>{option.name}</span>
                  </div>
                </MenuItem>
              ))}
            </Select>
            <div className="select-controls">
              <FontAwesomeIcon
                icon={faSortUp}
                onClick={() =>
                  isAvailable(checked) &&
                  dispatch(
                    onInputChange({
                      elementIndex,
                      subElementIndex,
                      value: isNumber(value) && value! > 0 ? value - 1 : 0
                    })
                  )
                }
              />
              <FontAwesomeIcon
                icon={faSortDown}
                onClick={() =>
                  isAvailable(checked) &&
                  dispatch(
                    onInputChange({
                      elementIndex,
                      subElementIndex,
                      value:
                        isNumber(value) && value! < options!.length - 1
                          ? value + 1
                          : options!.length - 1
                    })
                  )
                }
              />
            </div>
          </div>
        );
      case Inputs.COLOR_TABLE:
        return (
          <CompactColorPicker
            value={value instanceof Color ? value.hex() : ""}
            elementIndex={elementIndex}
          />
        );
      case Inputs.RANGE:
        return (
          <input
            type="range"
            disabled={!isAvailable(checked)}
            onChange={event =>
              dispatch(
                onInputChange({
                  elementIndex,
                  subElementIndex,
                  value: event.target.value
                })
              )
            }
            className="slider"
            min="0"
            max="100"
          />
        );
      case Inputs.IMAGE_BUTTON:
        return (
          <div
            {...keyExtractor(null, elmConfig.type, subElementIndex)}
            className={`input-icon ${icon!.selected ? "input-icon-selected" : ""}`}
          >
            <Icon type={icon!.type} name={icon!.name} />
          </div>
        );
      case Inputs.INPUT_GROUP:
        return subElementIds!.map(id => renderInputElement(subElements[id], checked, id));
      default:
        return null;
    }
  };

  return (
    <section className={classes.formField}>
      <div className={classes.formLabel}>{labelElement}</div>
      <div className={classes.formInput}>
        {config.hasOwnProperty("checked") ? (
          <input
            type="checkbox"
            className={classes.checkbox}
            checked={config.checked}
            onChange={event =>
              dispatch(
                onChangeSettingAvailability({
                  elementIndex,
                  value: !config.checked
                })
              )
            }
          />
        ) : null}
        {renderInputElement(config, config.checked)}
      </div>
    </section>
  );
}
