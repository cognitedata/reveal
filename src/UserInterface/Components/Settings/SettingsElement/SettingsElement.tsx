import React, { useState } from "react";
import Color from "color";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretUp } from "@fortawesome/free-solid-svg-icons/faCaretUp";
import { faCaretDown } from "@fortawesome/free-solid-svg-icons/faCaretDown";
import {
  ISettingsElement,
  ISettingsElementProps,
  ISelectOption,
} from "@/UserInterface/Components/Settings/Types";
import ElementTypes from "@/UserInterface/Components/Settings/ElementTypes";
import CompactColorPicker from "@/UserInterface/Components/CompactColorPicker/CompactColorPicker";
import Icon from "@/UserInterface/Components/Icon/Icon";
import "./SettingsElement.module.scss";
import { Box } from "@material-ui/core";
import { ColorMapSelector } from "@/UserInterface/Components/ColoMapSelector/ColorMapSelector";

/**
 * Responsible for rendering dynamic inputs
 * @param props
 */
export default function SettingsElement(props: ISettingsElementProps) {
  const {
    config,
    onPropertyValueChange: onChange,
    sectionId,
    onPropertyUseChange,
  } = props;

  const labelElement = config.name ? (
    <label htmlFor={`chBox-${sectionId}`}>{`${config.name}:`}</label>
  ) : null;

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

  const handleCheckboxChange = (name: string, e: any) => {
    onPropertyUseChange(name, e.target.checked);
  };

  // Renders input elements dynamically
  const renderInputElement = (elmConfig: ISettingsElement): any => {
    const { isReadOnly, subValues: subElements, icon, name, value } = elmConfig;

    const disabled = config.isReadOnly || !config.useProperty;

    switch (elmConfig.type) {
      case ElementTypes.INPUT:
        return (
          <input
            disabled={disabled}
            {...keyExtractor(null, elmConfig.type, elmConfig.name)}
            onChange={(event) =>
              !isReadOnly ? onChange(elmConfig.name, event.target.value) : null
            }
            value={value}
            className={
              isReadOnly ? `${"textInput"} ${"readOnlyInput"}` : "textInput"
            }
          />
        );
      case ElementTypes.SELECT: {
        const options = config.options as ISelectOption[];
        const [selectedValue, setSelectedValue] = useState(
          elmConfig.value ?? (options.length > 0 && options[0].value)
        );

        // TODO: Create separe component for each of the types and ove this method select renderer
        const handleSelectUpDown = (isUp: boolean) => {
          if (!elmConfig.isReadOnly) {
            const selectedIndex = options.findIndex(
              (ele) => ele.value === selectedValue
            );

            let nextIndex;
            if (isUp) {
              nextIndex =
                selectedIndex <= 0 ? options.length - 1 : selectedIndex - 1;
            } else {
              nextIndex =
                selectedIndex === options.length - 1 ? 0 : selectedIndex + 1;
            }
            setSelectedValue(options[nextIndex].value);
            onChange(name, options[nextIndex].value);
          }
        };

        return (
          <div
            className="select-group"
            {...keyExtractor(null, elmConfig.type, elmConfig.name)}
          >
            <Select
              value={selectedValue}
              disabled={disabled}
              onChange={(e) => {
                setSelectedValue(e.target.value);
                onChange(elmConfig.name, e.target.value);
              }}
            >
              {options?.map((option) => (
                <MenuItem
                  value={option.value}
                  key={
                    keyExtractor("select", elmConfig.type, elmConfig.name).key
                  }
                >
                  <div className="select-element-option">
                    {option.iconSrc ? <Icon src={option.iconSrc} /> : null}
                    <span className="optionText">{option.label}</span>
                  </div>
                </MenuItem>
              ))}
            </Select>
            <div className="select-controls">
              <FontAwesomeIcon
                icon={faCaretUp}
                onClick={() => handleSelectUpDown(true)}
              />
              <FontAwesomeIcon
                icon={faCaretDown}
                onClick={() => handleSelectUpDown(false)}
              />
            </div>
          </div>
        );
      }
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
            disabled={disabled}
            value={elmConfig.value}
            onChange={(event) => onChange(elmConfig.name, event.target.value)}
            className="slider"
            min="0"
            max="100"
          />
        );
      case ElementTypes.COLORMAP_SELECT: {
        const options = elmConfig.options as string[];
        return (
          <Box height="1.5rem" width="100%">
            <ColorMapSelector
              options={options}
              colorMapOptions={elmConfig.colorMapOptions}
              value={value}
              disabled={disabled}
              onChange={(colorMap) => {
                onChange(elmConfig.name, colorMap);
              }}
            />
          </Box>
        );
      }
      case ElementTypes.IMAGE_BUTTON:
        return (
          <div
            {...keyExtractor(null, elmConfig.type, elmConfig.name)}
            className={`input-icon ${
              icon?.selected ? "input-icon-selected" : ""
            }`}
          >
            <Icon type={icon?.type} name={icon?.name} />
          </div>
        );
      case ElementTypes.INPUT_GROUP:
        return subElements?.map((elm) => renderInputElement(elm));
      default:
        return <></>;
    }
  };

  return (
    <section className="form-field">
      <div>{labelElement}</div>
      <div className="input-wrap">
        <div>
          {!config.isReadOnly && config.isOptional && (
            <input
              type="checkbox"
              className="checkbox"
              checked={config.useProperty}
              onChange={(e) => handleCheckboxChange(config.name, e)}
            />
          )}
        </div>
        <div className="element">{renderInputElement(config)}</div>
      </div>
    </section>
  );
}
