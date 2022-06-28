import { CSSProperties, useState } from 'react';
import styled from 'styled-components/macro';
import { Menu, Button, Dropdown } from '@cognite/cogs.js';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import TranslatedEditableText from 'components/EditableText/TranslatedEditableText';
import units from 'models/charts/units/data/units';
import { UnitTypes } from 'models/charts/units/types/UnitTypes';

type UnitDropdownProps = {
  open?: boolean;
  unit?: string;
  style?: CSSProperties;
  disabled?: boolean;
  translations: typeof defaultTranslations;
  originalUnit?: string;
  preferredUnit?: string;
  customUnitLabel?: string;
  onOverrideUnitClick: (_: any) => void;
  onConversionUnitClick: (_: any) => void;
  onCustomUnitLabelClick: (_: any) => void;
  onResetUnitClick: () => void;
};

const defaultTranslations = makeDefaultTranslations('Type', 'Input', 'Output');

const UnitDropdown = ({
  unit,
  open,
  style,
  disabled,
  translations,
  originalUnit,
  preferredUnit,
  customUnitLabel,
  onOverrideUnitClick,
  onConversionUnitClick,
  onCustomUnitLabelClick,
  onResetUnitClick,
}: UnitDropdownProps) => {
  const t = { ...defaultTranslations, ...translations };

  const inputUnitOption = units.find(
    (unitOption) => unitOption.value === unit?.toLowerCase()
  );

  const [selectedUnitType, setSelectedUnitType] = useState<
    UnitTypes | undefined
  >(inputUnitOption?.type);

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
    <Menu.Item key="reset-unit" onClick={() => onResetUnitClick()}>
      Set to default ({originalUnitLabel || 'N/A'})
    </Menu.Item>,
    ...Object.values(UnitTypes).map((unitType) => {
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
      );
    }),
  ];

  const inputUnitsMenuItems = units
    .filter((unitOption) => unitOption.type === selectedUnitType)
    .map((unitOption) => (
      <Menu.Item
        key={unitOption.value}
        onClick={() => onOverrideUnitClick(unitOption)}
        style={
          selectedUnitType !== UnitTypes.CUSTOM &&
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

  const preferredUnitsMenuItems = unitConversionOptions?.map((unitOption) => (
    <Menu.Item
      key={unitOption?.value}
      onClick={() => onConversionUnitClick(unitOption)}
      style={
        selectedUnitType !== UnitTypes.CUSTOM &&
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
      visible={open}
      content={
        <Menu style={{ ...style }}>
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
              {inputUnitsMenuItems}
            </UnitContainer>
            <UnitContainer>
              <Menu.Header>
                <UnitMenuHeader>{t.Output}</UnitMenuHeader>
              </Menu.Header>
              {preferredUnitsMenuItems}
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
        className="unit-btn"
      >
        {preferredUnitOption?.label ||
          preferredUnit ||
          customUnitLabel ||
          originalUnit ||
          '-'}
        {preferredUnit !== originalUnit && ' *'}
      </Button>
    </Dropdown>
  );
};

UnitDropdown.defaultTranslations = defaultTranslations;
UnitDropdown.translationKeys = translationKeys(defaultTranslations);
UnitDropdown.translationNamespace = 'UnitDropdown';

const MenuContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: 225px;
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

const CustomLabelWrap = styled.div`
  width: 100%;
  text-align: left;
`;

export default UnitDropdown;
