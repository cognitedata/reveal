import React from "react";
import Color from "color";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSortUp } from "@fortawesome/free-solid-svg-icons/faSortUp";
import { faSortDown } from "@fortawesome/free-solid-svg-icons/faSortDown";
import { ISettingsElement } from "@/UserInterface/Components/Settings/Types";
import ElementTypes from "@/UserInterface/Components/Settings/ElementTypes";
import CompactColorPicker from "@/UserInterface/Components/CompactColorPicker/CompactColorPicker";
import Icon from "@/UserInterface/Components/Icon/Icon";
import { isNumber } from "@/UserInterface/Foundation/Utils/numericUtils";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
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
      fontWeight: 400,
      width: 0,
    },
    readOnlyInput: {
      background: "#ffffc4",
    },
    checkbox: {
      position: "absolute",
      left: "-1.5rem",
      border: "1px solid black",
      margin: 0,
    },
    select: {
      width: "100%",
      display: "flex",
    },
    option: {
      paddingLeft: "0.2rem",
      fontSize: ".6rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
    },
    optionText: {
      marginLeft: "0.5rem",
    },
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
export default function SettingsElement(props: {
  config: ISettingsElement;
  sectionId: string;
  onChange: (id: string, value: any) => void;
}) {
  const classes = useStyles();
  const { config, onChange, sectionId } = props;

  const labelElement = config.name ? <label>{`${config.name}:`}</label> : null;

  // Generate keys for mapped components
  const keyExtractor = (
    extraIdentifier: number | string | null,
    elementName: string,
    elementType: string
  ) => {
    let key = `${sectionId}-${elementType}-${elementName}`;
    if (extraIdentifier) key += `-${extraIdentifier}`;
    return { key };
  };

  // Renders input elements dynamically
  const renderInputElement = (
    elmConfig: ISettingsElement,
    checked?: boolean
  ): any => {
    const { value, isReadOnly, options, subElements, icon } = elmConfig;

    switch (elmConfig.type) {
      case ElementTypes.INPUT:
        return (
          <input
            disabled={!isAvailable(checked)}
            {...keyExtractor(null, elmConfig.type, elmConfig.name)}
            onChange={(event) =>
              !isReadOnly ? onChange(elmConfig.name, event.target.value) : null
            }
            value={value}
            className={
              isReadOnly
                ? `${classes.textInput} ${classes.readOnlyInput}`
                : classes.textInput
            }
          />
        );
      case ElementTypes.SELECT:
        return (
          <div
            className="select-group"
            {...keyExtractor(null, elmConfig.type, elmConfig.name)}
          >
            <Select
              value={value}
              disabled={!isAvailable(checked)}
              onChange={(event) => {
                onChange(elmConfig.name, event.target.value);
              }}
            >
              {options!.map((option, idx) => (
                <MenuItem
                  value={idx}
                  {...keyExtractor(idx, elmConfig.type, elmConfig.name)}
                  key={idx}
                >
                  <div className={`select-option ${classes.option}`}>
                    {option.icon ? (
                      <Icon name={option.icon.name} type={option.icon.type} />
                    ) : null}
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
                  onChange(
                    elmConfig.name,
                    isNumber(value) && value! > 0 ? value - 1 : 0
                  )
                }
              />
              <FontAwesomeIcon
                icon={faSortDown}
                onClick={() =>
                  isAvailable(checked) &&
                  onChange(
                    elmConfig.name,
                    isNumber(value) && value! < options!.length - 1
                      ? value + 1
                      : options!.length - 1
                  )
                }
              />
            </div>
          </div>
        );
      case ElementTypes.COLOR_TABLE:
        return (
          <CompactColorPicker
            value={value instanceof Color ? value.hex() : ""}
            id={elmConfig.name}
            onChange={onChange}
          />
        );
      case ElementTypes.RANGE:
        return (
          <input
            type="range"
            disabled={!isAvailable(checked)}
            onChange={(event) => onChange(elmConfig.name, event.target.value)}
            className="slider"
            min="0"
            max="100"
          />
        );
      case ElementTypes.IMAGE_BUTTON:
        return (
          <div
            {...keyExtractor(null, elmConfig.type, elmConfig.name)}
            className={`input-icon ${
              icon!.selected ? "input-icon-selected" : ""
            }`}
          >
            <Icon type={icon!.type} name={icon!.name} />
          </div>
        );
      case ElementTypes.INPUT_GROUP:
        return subElements!.map((elm) => renderInputElement(elm, checked));
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
            onChange={(event) => onChange(config.name, event.target.value)}
          />
        ) : null}
        {renderInputElement(config, config.checked)}
      </div>
    </section>
  );
}
