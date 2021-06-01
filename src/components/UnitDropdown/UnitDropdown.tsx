import React from 'react';
import { Menu, Flex, Button, Dropdown } from '@cognite/cogs.js';
import { UnitMenuHeader, UnitMenuAside } from 'pages/ChartView/elements';
import { units } from 'utils/units';

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

  const preferredUnitOption = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  );

  const unitConversionOptions = inputUnitOption?.conversions?.map(
    (conversion) => units.find((unitOption) => unitOption.value === conversion)
  );

  const unitOverrideMenuItems = units.map((unitOption) => (
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
          <Flex direction="row" style={{ height: 150, overflow: 'hidden' }}>
            <div style={{ overflowY: 'scroll' }}>
              <Menu.Header>
                <UnitMenuHeader>Input</UnitMenuHeader>
              </Menu.Header>
              {unitOverrideMenuItems}
            </div>
            <UnitMenuAside style={{ overflowY: 'scroll' }}>
              <Menu.Header>
                <UnitMenuHeader>Output</UnitMenuHeader>
              </Menu.Header>
              {unitConversionMenuItems}
            </UnitMenuAside>
          </Flex>
        </Menu>
      }
    >
      <Button
        icon="Down"
        type="tertiary"
        iconPlacement="right"
        style={{ height: 28 }}
      >
        {preferredUnitOption?.label}
        {inputUnitOption?.value !== originalUnit?.toLowerCase() && ' *'}
      </Button>
    </Dropdown>
  );
};
