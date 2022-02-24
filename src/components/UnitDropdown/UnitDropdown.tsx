import { useState } from 'react';
import styled from 'styled-components/macro';
import { Menu, Button, Dropdown } from '@cognite/cogs.js';
import { units, UnitTypes } from 'utils/units';
import { makeDefaultTranslations } from 'utils/translations';

type UnitDropdownProps = {
  disabled?: boolean;
  unit?: string;
  originalUnit?: string;
  preferredUnit?: string;
  onOverrideUnitClick: (_: any) => void;
  onConversionUnitClick: (_: any) => void;
  onResetUnitClick: () => void;
  translations: typeof defaultTranslations;
};

const defaultTranslations = makeDefaultTranslations('Type', 'Input', 'Output');

const UnitDropdown = ({
  disabled,
  unit,
  originalUnit,
  preferredUnit,
  onOverrideUnitClick,
  onConversionUnitClick,
  onResetUnitClick,
  translations,
}: UnitDropdownProps) => {
  const t = { ...defaultTranslations, ...translations };

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

  const originalUnitLabel =
    units.find((unitOption) => unitOption.value === originalUnit?.toLowerCase())
      ?.label || originalUnit;

  const unitTypeMenuItems = [
    <Menu.Item
      key="reset-unit"
      onClick={() => onResetUnitClick()}
      style={{
        color: 'var(--cogs-danger)',
      }}
    >
      Set to default ({originalUnitLabel || 'none'})
    </Menu.Item>,
    ...Object.values(UnitTypes).map((unitType) => (
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
    )),
  ];

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
      disabled={disabled}
      content={
        <Menu>
          <MenuContainer>
            <UnitTypeContainer>
              <Menu.Header>
                <UnitMenuHeader>{t.Type}</UnitMenuHeader>
              </Menu.Header>
              {unitTypeMenuItems}
            </UnitTypeContainer>
            <UnitContainer>
              <Menu.Header>
                <UnitMenuHeader>{t.Input}</UnitMenuHeader>
              </Menu.Header>
              {unitOverrideMenuItems}
            </UnitContainer>
            <UnitContainer>
              <Menu.Header>
                <UnitMenuHeader>{t.Output}</UnitMenuHeader>
              </Menu.Header>
              {unitConversionMenuItems}
            </UnitContainer>
          </MenuContainer>
        </Menu>
      }
    >
      <Button
        disabled={disabled}
        icon="ChevronDown"
        type="tertiary"
        iconPlacement="right"
        style={{ height: 28 }}
      >
        {preferredUnitOption?.label || preferredUnit || '-'}
        {preferredUnit !== originalUnit && ' *'}
      </Button>
    </Dropdown>
  );
};

UnitDropdown.translationKeys = Object.keys(defaultTranslations);

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
  max-width: 170px;
  padding-right: 10px;
  overflow-y: scroll;
`;

const UnitContainer = styled.div`
  position: relative;
  max-width: 120px;
  padding: 0 10px;
  border-left: 1px solid var(--cogs-greyscale-grey3);
  overflow-y: scroll;
`;

export default UnitDropdown;
