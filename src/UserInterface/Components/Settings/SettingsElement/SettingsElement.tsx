import React from "react";
import Color from "color";
import {
  ISettingsElement,
  ISettingsElementProps,
} from "@/UserInterface/Components/Settings/Types";
import ElementTypes from "@/UserInterface/Components/Settings/ElementTypes";
import CompactColorPicker from "@/UserInterface/Components/CompactColorPicker/CompactColorPicker";
import Icon from "@/UserInterface/Components/Icon/Icon";
import "./SettingsElement.module.scss";
import { ColorMapSelector } from "@/UserInterface/Components/ColorMapSelector/ColorMapSelector";
import { GenericSelect } from "@/UserInterface/Components/GenericSelect/GenericSelect";

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
    <label htmlFor={`chBox-${sectionId}`}>{`${config.name}`}</label>
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

  const handleCheckboxChange = (id: string, e: any) => {
    onPropertyUseChange(id, e.target.checked);
  };

  // Renders input elements dynamically
  const renderInputElement = (elmConfig: ISettingsElement): any => {
    const {
      subValues: subElements,
      icon,
      id,
      type,
      name,
      value,
      options,
    } = elmConfig;

    const disabled = elmConfig.isReadOnly || !elmConfig.useProperty;

    switch (type) {
      case ElementTypes.Number:
      case ElementTypes.String:
        return (
          <input
            type={type === ElementTypes.Number ? "number" : "text"}
            disabled={disabled}
            {...keyExtractor(null, type, name)}
            onChange={(event) => onChange(id, event.target.value)}
            value={value}
            className={disabled ? "textInput readOnlyInput" : "textInput"}
          />
        );
      case ElementTypes.Boolean:
        return (
          <input
            type="checkbox"
            className="checkbox"
            disabled={disabled}
            {...keyExtractor(null, type, name)}
            onChange={(event) => onChange(id, event.target.checked)}
            checked={value}
          />
        );
      case ElementTypes.Select: {
        return (
          <div className="common-select">
            <GenericSelect
              key={keyExtractor(null, type, name).key}
              options={options}
              value={value}
              disabled={disabled}
              onChange={(e) => {
                onChange(id, e);
              }}
              node={<ColorMapSelector />}
            />
          </div>
        );
      }
      case ElementTypes.Color:
        return (
          <CompactColorPicker
            value={value instanceof Color ? value.hex() : ""}
            id={id}
            onChange={onChange}
          />
        );
      case ElementTypes.Slider:
        return (
          <input
            type="range"
            disabled={disabled}
            value={value}
            onChange={(event) => onChange(id, event.target.value)}
            className="slider"
            min="0"
            step="0.02"
            max="1"
          />
        );
      case ElementTypes.ColorMap: {
        return (
          <div className="common-select">
            <GenericSelect
              key={keyExtractor(null, type, name).key}
              options={options}
              value={value}
              disabled={disabled}
              onChange={(e) => {
                onChange(id, e);
              }}
              node={
                <ColorMapSelector
                  colorMapOptions={elmConfig.extraOptionsData}
                />
              }
            />
          </div>
        );
      }
      case ElementTypes.ImageButton:
        return (
          <div
            {...keyExtractor(null, type, name)}
            className={`input-icon ${
              icon?.selected ? "input-icon-selected" : ""
            }`}
          >
            <Icon type={icon?.type} name={icon?.name} />
          </div>
        );
      case ElementTypes.Group:
        return subElements?.map((elm) => renderInputElement(elm));
      default:
        return <></>;
    }
  };

  const displayCheckbox = !config.isReadOnly && config.isOptional;

  return (
    <section className="form-field">
      <div>{labelElement}</div>
      <div className={`input-wrap ${displayCheckbox ? "optional" : ""}`}>
        {displayCheckbox && (
          <div>
            <input
              type="checkbox"
              className="checkbox"
              checked={config.useProperty}
              onChange={(e) => handleCheckboxChange(config.id, e)}
            />
          </div>
        )}
        <div className="element">{renderInputElement(config)}</div>
      </div>
    </section>
  );
}
