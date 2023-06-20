import { useEffect, useState } from 'react';

import styled from 'styled-components';

import { clamp } from 'lodash';

import {
  Button,
  Dropdown,
  InputExp,
  Menu,
  ToolBar,
  Tooltip,
} from '@cognite/cogs.js';

import { translationKeys } from '../../common';
import { useTranslation } from '../../hooks/useTranslation';
import { lowerBound } from '../../utils/lowerBound';

type SizeEditorProps = {
  value: number | undefined;
  minValue?: number;
  maxValue?: number;
  dropdownValues?: number[];
  setValue: (value: number | undefined) => void;
  suffix?: string;
};

export const SizeEditor: React.FC<SizeEditorProps> = ({
  value,
  setValue,
  suffix,
  dropdownValues,
  minValue = Number.NEGATIVE_INFINITY,
  maxValue = Number.POSITIVE_INFINITY,
}: SizeEditorProps) => {
  const [inputRef, setInputRef] = useState<HTMLInputElement | null>(null);
  const [shouldShowDropdown, setShouldShowDropdown] = useState<boolean>(false);
  const { t } = useTranslation();

  useEffect(() => {
    if (inputRef === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        setValue(clamp(value ?? minValue, minValue, maxValue));
        setShouldShowDropdown(false);
        inputRef.blur();
        return;
      }
    };
    inputRef.addEventListener('keydown', handleKeyDown);

    return () => {
      inputRef.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef, value, minValue, maxValue, setValue]);

  const onValueChange = (stringValue: string) => {
    if (stringValue === '') {
      setValue(undefined);
      return;
    }
    const numericValue = Number(stringValue);
    if (Number.isNaN(numericValue)) {
      return;
    }
    setValue(numericValue);
  };

  const onAddValue = (valueToAdd: number) => {
    setShouldShowDropdown(false);
    if (value === undefined) {
      return;
    }
    if (dropdownValues !== undefined) {
      const nextIndex = lowerBound(dropdownValues, value) + valueToAdd;
      const clampedIndex = clamp(nextIndex, 0, dropdownValues.length - 1);
      setValue(dropdownValues[clampedIndex]);
      return;
    }

    setValue(clamp(value + valueToAdd, minValue, maxValue));
  };

  const onDropdownValueClicked = (dropdownValue: number) => {
    setShouldShowDropdown(false);
    setValue(dropdownValue);
  };

  return (
    <ToolBar direction="horizontal">
      <>
        <Tooltip
          content={t(
            translationKeys.SIZE_EDITOR_DECREASE_SIZE,
            'Decrease size'
          )}
        >
          <Button
            aria-label="Decrement size"
            icon="CaretDown"
            type="ghost"
            onClick={() => onAddValue(-1)}
          />
        </Tooltip>
        <Dropdown
          visible={shouldShowDropdown}
          placement="top-start"
          content={
            dropdownValues !== undefined && (
              <Menu>
                {dropdownValues.map((dropdownValue) => (
                  <Menu.Item
                    key={dropdownValue}
                    toggled={
                      value !== undefined && dropdownValue === Math.trunc(value)
                    }
                    onClick={() => onDropdownValueClicked(dropdownValue)}
                  >
                    {`${dropdownValue}${suffix ?? ''}`}
                  </Menu.Item>
                ))}
              </Menu>
            )
          }
        >
          <StyledInput
            aria-label="Edit size"
            onChange={(evt) => onValueChange(evt.target.value)}
            onBlur={(evt) => onValueChange(evt.target.value)}
            onClick={() => setShouldShowDropdown(true)}
            variant="ghost"
            value={value === undefined ? undefined : Math.trunc(value)}
            suffix={suffix}
            ref={(ref) => setInputRef(ref)}
          />
        </Dropdown>
        <Tooltip
          content={t(
            translationKeys.SIZE_EDITOR_INCREASE_SIZE,
            'Increase size'
          )}
        >
          <Button
            aria-label="Increment size"
            icon="CaretUp"
            type="ghost"
            onClick={() => onAddValue(1)}
          />
        </Tooltip>
      </>
    </ToolBar>
  );
};

const StyledInput = styled(InputExp)`
  max-width: 47px;
`;
