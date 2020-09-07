import React from "react";
import Color from "color";
import "./SettingsElement.module.scss";
import {
  ISettingsElement,
  ISettingsElementProps,
} from "@/UserInterface/Components/Settings/Types";
import { ElementTypes } from "@/UserInterface/Components/Settings/ElementTypes";
import { CompactColorPicker } from "@/UserInterface/Components/CompactColorPicker/CompactColorPicker";
import { Icon } from "@/UserInterface/Components/Icon/Icon";
import { GenericSelect } from "@/UserInterface/Components/GenericSelect/GenericSelect";
import { CommonSelectBase } from "@/UserInterface/Components/GenericSelect/CommonSelectBase/CommonSelectBase";
import { ColorMapIcon } from "@/UserInterface/Components/Settings/ColorMapIcon/ColorMapIcon";
import { ColorTypeIcon } from "@/UserInterface/Components/Settings/ColorTypeIcon/ColorTypeIcon";
import { ToolbarToolTip } from "@/UserInterface/Components/ToolbarToolTip/ToolbarToolTip";

/**
 * Responsible for rendering dynamic inputs
 * @param props
 */
export function SettingsElement(props: ISettingsElementProps) {
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
      extraOptionsData,
    } = elmConfig;

    const disabled = elmConfig.isReadOnly || !elmConfig.useProperty;

    let element;

    switch (type) {
      case ElementTypes.Number:
      case ElementTypes.String:
        element = (
          <input
            type={type === ElementTypes.Number ? "number" : "text"}
            disabled={disabled}
            {...keyExtractor(null, type, name)}
            onChange={(event) => onChange(id, event.target.value)}
            value={value}
            className={disabled ? "textInput readOnlyInput" : "textInput"}
          />
        );
        break;
      case ElementTypes.Boolean:
        element = (
          <input
            type="checkbox"
            className="checkbox"
            disabled={disabled}
            {...keyExtractor(null, type, name)}
            onChange={(event) => onChange(id, event.target.checked)}
            checked={value}
          />
        );
        break;
      case ElementTypes.Color:
        element = (
          <CompactColorPicker
            value={value instanceof Color ? value.hex() : ""}
            id={id}
            onChange={onChange}
          />
        );
        break;
      case ElementTypes.Slider:
        element = (
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
        break;
      case ElementTypes.Select:
      case ElementTypes.ColorMap:
      case ElementTypes.ColorType:
        {
          const getIconNode = (elementType: string) => {
            if (elementType === ElementTypes.ColorMap) {
              return <CommonSelectBase iconNode={<ColorMapIcon />} />;
            }
            if (elementType === ElementTypes.ColorType) {
              return <CommonSelectBase iconNode={<ColorTypeIcon />} />;
            }
            return undefined;
          };
          element = (
            <div className="common-select">
              <GenericSelect
                key={keyExtractor(null, type, name).key}
                options={options}
                value={value}
                disabled={disabled}
                onChange={(e) => {
                  onChange(id, e);
                }}
                extraOptionsData={extraOptionsData}
                node={getIconNode(type)}
              />
            </div>
          );
        }
        break;
      case ElementTypes.ImageButton:
        element = (
          <div
            {...keyExtractor(null, type, name)}
            className={`input-icon ${
              icon?.selected ? "input-icon-selected" : ""
            }`}
          >
            <Icon type={icon?.type} name={icon?.name} />
          </div>
        );
        break;
      case ElementTypes.Group:
        element = subElements?.map((elm) => renderInputElement(elm));
        break;
      default:
        element = <></>;
    }

    return (
      <ToolbarToolTip
        key={elmConfig.id}
        name={elmConfig.name}
        tooltip={
          elmConfig.toolTip ? { text: `\n${elmConfig.toolTip}` } : undefined
        }
      >
        {element}
      </ToolbarToolTip>
    );
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
