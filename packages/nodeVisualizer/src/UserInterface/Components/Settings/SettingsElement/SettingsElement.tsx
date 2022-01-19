import React from 'react';
import Color from 'color';
import {
  ISettingsElement,
  ISettingsElementProps,
} from '@/UserInterface/Components/Settings/Types';
import { ElementTypes } from '@/UserInterface/Components/Settings/ElementTypes';
import { CompactColorPicker } from '@/UserInterface/Components/CompactColorPicker/CompactColorPicker';
import { Icon } from '@/UserInterface/Components/Icon/Icon';
import { CommonSelectBase } from '@/UserInterface/Components/GenericSelect/CommonSelectBase/CommonSelectBase';
import { ToolbarToolTip } from '@/UserInterface/Components/ToolbarToolTip/ToolbarToolTip';
import { Checkbox, Input } from '@cognite/cogs.js';
import styled from 'styled-components';

/**
 * Responsible for rendering dynamic inputs
 * @param props
 */

export const SettingsElement = (props: ISettingsElementProps) => {
  const { config, onPropertyValueChange: onChange, sectionId } = props;

  const labelElement = config.name ? (
    <StyledLabel htmlFor={`chBox-${sectionId}`}>{`${config.name}`}</StyledLabel>
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

    let element;

    switch (type) {
      case ElementTypes.Number:
      case ElementTypes.String:
        element = (
          <Input
            fullWidth
            type={type === ElementTypes.Number ? 'number' : 'text'}
            disabled={disabled}
            name={name}
            onChange={(event) => onChange(id, event.target.value)}
            value={value}
            style={{ padding: '0 5px' }}
          />
        );
        break;
      case ElementTypes.Boolean:
        element = (
          <Checkbox
            name={name}
            disabled={disabled}
            onChange={(event) => onChange(id, event)}
            value={value}
          />
        );
        break;
      case ElementTypes.Color:
        // todo: should be styled properly
        element = (
          <CompactColorPicker
            value={value instanceof Color ? value.hex() : ''}
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
            min="0"
            step="0.02"
            max="1"
          />
        );
        break;
      case ElementTypes.Select:
      case ElementTypes.ColorMap:
      case ElementTypes.ColorType: {
        const selectValue = options?.find((el) => el.value === value);
        element = (
          <CommonSelectBase
            key={keyExtractor(null, type, name).key}
            options={options}
            value={selectValue}
            disabled={disabled}
            onChange={(e) => {
              onChange(id, e.value);
            }}
          />
        );
        break;
      }
      case ElementTypes.ImageButton:
        element = <Icon type={icon?.type} name={icon?.name} />;
        break;
      case ElementTypes.Group:
        element = subElements?.map((elm) => renderInputElement(elm));
        break;
      default:
        element = <></>;
    }

    return (
      <InputFieldWrapper>
        <ToolbarToolTip
          key={elmConfig.id}
          name={elmConfig.name}
          tooltip={
            elmConfig.toolTip ? { text: `\n${elmConfig.toolTip}` } : undefined
          }
        >
          {element}
        </ToolbarToolTip>
      </InputFieldWrapper>
    );
  };

  return (
    <StyledSection>
      {labelElement}
      {renderInputElement(config)}
    </StyledSection>
  );
};

const StyledSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
`;

const StyledLabel = styled.label`
  flex: 1;
  margin-right: 5px;
`;
const InputFieldWrapper = styled.div`
  flex: 3;
  display: flex;
  flex-direction: row;
  justify-content: stretch;

  > span {
    width: 100%;
  }

  .cogs-select {
    width: 100%;
  }
`;
