import { useCallback, useEffect, useState } from 'react';

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
  setValue: (value: number | undefined) => void;
  minValue?: number;
  maxValue?: number;
  dropdownValues?: number[];
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
  const [prevDefinedValue, setPrevDefinedValue] = useState<number>(
    value ?? minValue
  );
  const [shouldShowDropdown, setShouldShowDropdown] = useState<boolean>(false);
  const { t } = useTranslation();

  const setValueWrapper = useCallback(
    (newValue: number | undefined): void => {
      if (value !== undefined) {
        setPrevDefinedValue(value);
      }
      setValue(newValue);
    },
    [value, setValue, setPrevDefinedValue]
  );

  useEffect(() => {
    if (inputRef === null) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        inputRef.blur();
        setShouldShowDropdown(false);
        setValueWrapper(clamp(value ?? prevDefinedValue, minValue, maxValue));
        return;
      }
    };
    inputRef.addEventListener('keydown', handleKeyDown);

    return () => {
      inputRef.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputRef, value, minValue, maxValue, prevDefinedValue, setValueWrapper]);

  const onValueChange = (stringValue: string) => {
    if (stringValue === '') {
      setValueWrapper(undefined);
      return;
    }
    const numericValue = Number(stringValue);
    if (Number.isNaN(numericValue)) {
      return;
    }
    setValueWrapper(numericValue);
  };

  const onAddValue = (valueToAdd: number) => {
    setShouldShowDropdown(false);
    if (value === undefined) {
      return;
    }
    if (dropdownValues !== undefined) {
      const nextIndex = lowerBound(dropdownValues, value) + valueToAdd;
      const clampedIndex = clamp(nextIndex, 0, dropdownValues.length - 1);
      setValueWrapper(dropdownValues[clampedIndex]);
      return;
    }

    setValueWrapper(clamp(value + valueToAdd, minValue, maxValue));
  };

  const onDropdownValueClicked = (dropdownValue: number) => {
    setShouldShowDropdown(false);
    setValueWrapper(dropdownValue);
  };

  return (
    <ToolBar style={{ boxShadow: 'none' }} direction="horizontal">
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
  .MuiInput-input {
    text-align: center;
  }
  max-width: 47px;
`;
