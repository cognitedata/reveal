import { CSSProperties, useState } from 'react';
import styled from 'styled-components/macro';
import { Menu, Button, Dropdown } from '@cognite/cogs.js';
import { units, UnitTypes } from 'utils/units';
import { makeDefaultTranslations, translationKeys } from 'utils/translations';
import UnitDropDownInput from './UnitDropDownInput';
import UnitDropdownOutput from './UnitDropdownOutput';
import UnitDropdownUnitType from './UnitDropdownUnitType';

type UnitDropdownProps = {
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

type UnitType =
  | {
      label: string;
      value: string;
      conversions: string[];
      type: UnitTypes;
    }
  | undefined;

const UnitDropdown = ({
  unit,
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
  const [open, setOpen] = useState(false);
  const t = { ...defaultTranslations, ...translations };

  const inputUnitOptionToSelect = units.find(
    (unitOption) => unitOption.value === unit?.toLowerCase()
  );

  const [inputUnitOption, setInputUnitOption] = useState<UnitType>(
    inputUnitOptionToSelect
  );

  const [selectedUnitType, setSelectedUnitType] = useState<
    UnitTypes | undefined
  >(inputUnitOptionToSelect?.type);

  const preferredUnitOption = units.find(
    (unitOption) => unitOption.value === preferredUnit?.toLowerCase()
  );

  const onInputUnitTypeChange = (_previous: any, _updated: any) => {
    const unitToSelect = units.find(
      (unitOption) => unitOption.value === unit?.toLowerCase()
    );
    setInputUnitOption(unitToSelect);
  };

  const onUnitTypeChange = (_previous: any, _updated: any) => {
    if (_updated === inputUnitOptionToSelect?.type) {
      setInputUnitOption(inputUnitOptionToSelect);
    } else {
      setInputUnitOption(undefined);
    }
  };

  return (
    <Dropdown
      onClickOutside={() => setOpen(false)}
      disabled={disabled}
      visible={open}
      content={
        open && (
          <Menu style={{ ...style }}>
            <MenuContainer>
              <UnitTypeContainer>
                <Menu.Header>
                  <UnitMenuHeader>{t.Type}</UnitMenuHeader>
                </Menu.Header>
                <UnitDropdownUnitType
                  originalUnit={originalUnit}
                  customUnitLabel={customUnitLabel}
                  selectedUnitType={selectedUnitType}
                  setSelectedUnitType={setSelectedUnitType}
                  onResetUnitClick={onResetUnitClick}
                  onCustomUnitLabelClick={onCustomUnitLabelClick}
                  onChange={onUnitTypeChange}
                />
              </UnitTypeContainer>
              <UnitContainer>
                <Menu.Header>
                  <UnitMenuHeader>{t.Input}</UnitMenuHeader>
                </Menu.Header>
                <UnitDropDownInput
                  originalUnit={originalUnit}
                  unit={unit}
                  selectedUnitType={selectedUnitType}
                  onOverrideUnitClick={onOverrideUnitClick}
                  onChange={onInputUnitTypeChange}
                />
              </UnitContainer>
              <UnitContainer>
                <Menu.Header>
                  <UnitMenuHeader>{t.Output}</UnitMenuHeader>
                </Menu.Header>
                <UnitDropdownOutput
                  selectedUnitType={selectedUnitType}
                  inputUnitOption={inputUnitOption}
                  preferredUnit={preferredUnit}
                  onConversionUnitClick={onConversionUnitClick}
                />
              </UnitContainer>
            </MenuContainer>
          </Menu>
        )
      }
    >
      <Button
        onClick={() => setOpen(!open)}
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

export default UnitDropdown;
