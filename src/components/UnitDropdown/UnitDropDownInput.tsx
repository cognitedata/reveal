import { Menu } from '@cognite/cogs.js';
import React, { useEffect, useState } from 'react';
import { units, UnitTypes } from 'utils/units';

type Props = {
  selectedUnitType: UnitTypes | undefined;
  onOverrideUnitClick: (_: any) => void;
  originalUnit?: string;
  unit?: string;
  onChange?: (
    previous: string | undefined,
    updated: string | undefined
  ) => void;
};

const UnitDropDownInput = ({
  selectedUnitType,
  originalUnit,
  unit,
  onOverrideUnitClick,
  onChange,
}: Props) => {
  const [internalValue, setInternalValue] = useState<string | undefined>(unit);
  useEffect(() => {
    if (unit !== internalValue) {
      /**
       * We can perform any actions here that need to be performed on input unit change
       */
      setInternalValue(unit);
      onChange?.(internalValue, unit);
    }
  }, [unit, internalValue, onChange]);
  return (
    <>
      {units
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
        ))}
    </>
  );
};

export default UnitDropDownInput;
