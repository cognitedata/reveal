import { useState } from 'react';
import styled from 'styled-components/macro';
import { Menu, Button, Dropdown } from '@cognite/cogs.js';
import { units, UnitTypes } from 'utils/units';

type UnitDropdownProps = {
  unit?: string;
  originalUnit?: string;
  preferredUnit?: string;
  onOverrideUnitClick: (_: any) => void;
  onConversionUnitClick: (_: any) => void;
};

export const UnitDropdown = ({
  unit,
  originalUnit,
  preferredUnit,
  onOverrideUnitClick,
  onConversionUnitClick,
}: UnitDropdownProps) => {
  const inputUnitOption = units.find(
    (unitOption) => unitOption.value === unit?.toLowerCase()
  );

  const [selectedUnitType, setSelectedUnitType] = useState<UnitTypes>(
    inputUnitOption?.type || UnitTypes.TEMPERATURE
  );

  const preferredUnitOption = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  );

  const unitConversionOptions = inputUnitOption?.conversions?.map(
    (conversion) => units.find((unitOption) => unitOption.value === conversion)
  );

  const unitTypeMenuItems = Object.values(UnitTypes).map((unitType) => (
    <Menu.Item
      key={unitType}
      onClick={() => setSelectedUnitType(unitType)}
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
  ));

  const unitOverrideMenuItems = units
    .filter((unitOption) => unitOption.type === selectedUnitType)
    .map((unitOption) => (
      <Menu.Item
        key={unitOption.value}
        onClick={() => onOverrideUnitClick(unitOption)}
        style={
          unit?.toLowerCase() === unitOption.value
            ? {
                color: 'var(--cogs-midblue-3)',
                backgroundColor: 'var(--cogs-midblue-6)',
                borderRadius: 3,
              }
            : {}
        }
      >
        {unitOption.label}
        {originalUnit?.toLowerCase() === unitOption.value && ' (original)'}
      </Menu.Item>
    ));

  const unitConversionMenuItems = unitConversionOptions?.map((unitOption) => (
    <Menu.Item
      key={unitOption?.value}
      onClick={() => onConversionUnitClick(unitOption)}
      style={
        preferredUnit?.toLowerCase() === unitOption?.value
          ? {
              color: 'var(--cogs-midblue-3)',
              backgroundColor: 'var(--cogs-midblue-6)',
              borderRadius: 3,
            }
          : {}
      }
    >
      {unitOption?.label}
    </Menu.Item>
  ));

  return (
    <Dropdown
      content={
        <Menu>
          <MenuContainer>
            <UnitTypeContainer>
              <Menu.Header>
                <UnitMenuHeader>Type</UnitMenuHeader>
              </Menu.Header>
              {unitTypeMenuItems}
            </UnitTypeContainer>
            <UnitContainer>
              <Menu.Header>
                <UnitMenuHeader>Input</UnitMenuHeader>
              </Menu.Header>
              {unitOverrideMenuItems}
            </UnitContainer>
            <UnitContainer>
              <Menu.Header>
                <UnitMenuHeader>Output</UnitMenuHeader>
              </Menu.Header>
              {unitConversionMenuItems}
            </UnitContainer>
          </MenuContainer>
        </Menu>
      }
    >
      <Button
        icon="Down"
        type="ghost"
        iconPlacement="right"
        style={{ height: 28 }}
      >
        {preferredUnitOption?.label}
        {inputUnitOption?.value !== originalUnit?.toLowerCase() && ' *'}
      </Button>
    </Dropdown>
  );
};

const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 185px;
  overflow: hidden;
`;

const UnitMenuHeader = styled.span`
  word-break: break-word;
  text-transform: none;
  font-weight: 400;
  color: var(--cogs-greyscale-grey6);
`;

const UnitTypeContainer = styled.div`
  width: 130px;
  padding-right: 10px;
  overflow-y: scroll;
`;

const UnitContainer = styled.div`
  position: relative;
  width: 90px;
  padding: 0 10px;
  border-left: 1px solid var(--cogs-greyscale-grey3);
  overflow-y: scroll;
`;
