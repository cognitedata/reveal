import React from 'react';
import { Menu } from '@cognite/cogs.js';
import { units, UnitTypes } from 'utils/units';

type Props = {
  inputUnitOption: any;
  preferredUnit?: string;
  selectedUnitType: UnitTypes | undefined;
  onConversionUnitClick: (_: any) => void;
};

const UnitDropdownOutput = ({
  inputUnitOption,
  selectedUnitType,
  preferredUnit,
  onConversionUnitClick,
}: Props) => {
  const unitConversionOptions = inputUnitOption?.conversions?.map(
    (conversion: any) =>
      units.find((unitOption) => unitOption.value === conversion)
  );

  return (
    <>
      {unitConversionOptions?.map((unitOption: any) => (
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
      ))}
    </>
  );
};

export default UnitDropdownOutput;
