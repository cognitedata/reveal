import { Menu } from '@cognite/cogs.js';
import { units, UnitTypes } from 'utils/units';
import styled from 'styled-components/macro';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';

import React, { useEffect, useState } from 'react';

type Props = {
  originalUnit?: string;
  customUnitLabel?: string;
  selectedUnitType: UnitTypes | undefined;
  onCustomUnitLabelClick: (_: any) => void;
  onResetUnitClick: () => void;
  setSelectedUnitType: (_: any) => void;
  onChange?: (
    previous: UnitTypes | undefined,
    updated: UnitTypes | undefined
  ) => void;
};

const UnitDropdownUnitType = ({
  originalUnit,
  onResetUnitClick,
  setSelectedUnitType,
  onCustomUnitLabelClick,
  customUnitLabel,
  selectedUnitType,
  onChange,
}: Props) => {
  const originalUnitLabel =
    units.find((unitOption) => unitOption.value === originalUnit?.toLowerCase())
      ?.label || originalUnit;

  const [internalValue, setInternalValue] = useState<UnitTypes | undefined>(
    selectedUnitType
  );
  useEffect(() => {
    if (selectedUnitType !== internalValue) {
      /**
       * We can perform any actions here that need to be performed on unit type change
       */
      setInternalValue(selectedUnitType);
      onChange?.(internalValue, selectedUnitType);
    }
  }, [selectedUnitType, internalValue, onChange]);
  return (
    <>
      <Menu.Item key="reset-unit" onClick={() => onResetUnitClick()}>
        Set to default ({originalUnitLabel || 'N/A'})
      </Menu.Item>

      {Object.values(UnitTypes).map((unitType) => {
        if (unitType === 'Custom') {
          return (
            <Menu.Item
              key="add-custom-unit"
              onDoubleClick={(e) => {
                e.stopPropagation();
              }}
              onClick={(e) => {
                setSelectedUnitType(unitType);
                onCustomUnitLabelClick(customUnitLabel);
                e.stopPropagation();
              }}
              style={
                !!customUnitLabel && selectedUnitType === UnitTypes.CUSTOM
                  ? {
                      color: 'var(--cogs-midblue-3)',
                      backgroundColor: 'var(--cogs-midblue-6)',
                      borderRadius: 3,
                      padding: '2px 8px',
                    }
                  : { padding: '2px 8px' }
              }
            >
              <CustomLabelWrap>
                <TranslatedEditableText
                  value={customUnitLabel || ''}
                  onChange={(val) => {
                    setSelectedUnitType(unitType);
                    onCustomUnitLabelClick(val);
                  }}
                  placeholder="Custom unit label"
                  editing={!customUnitLabel}
                  hideButtons
                />
              </CustomLabelWrap>
            </Menu.Item>
          );
        }
        return (
          <Menu.Item
            key={unitType}
            onClick={() => {
              setSelectedUnitType(unitType);
              // setTopUnit(unitType);
            }}
            style={
              selectedUnitType === unitType
                ? {
                    color: 'var(--cogs-midblue-3)',
                    backgroundColor: 'var(--cogs-midblue-6)',
                    borderRadius: 3,
                  }
                : {}
            }
          >
            {unitType}
          </Menu.Item>
        );
      })}
    </>
  );
};

const CustomLabelWrap = styled.div`
  width: 100%;
  text-align: left;
`;

export default UnitDropdownUnitType;
