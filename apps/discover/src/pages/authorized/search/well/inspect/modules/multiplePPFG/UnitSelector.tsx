import React, { useState } from 'react';

import { ExpandButton } from 'components/buttons';
import { Dropdown } from 'components/dropdown';

import { UnitSelectorWrapper } from './elements';

type Props = { defaultUnit?: string; onChange?: (item: string) => void };

type UnitSelection = {
  id: number;
  unit: string;
  title: string;
};

const unitSelections: UnitSelection[] = [
  { id: 1, unit: 'ppg', title: 'PPG' },
  { id: 2, unit: 'psi', title: 'PSI' },
  { id: 3, unit: 'sg', title: 'SG' },
];

export const UnitSelector: React.FC<Props> = ({
  defaultUnit = 'psi',
  onChange,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<UnitSelection>(
    unitSelections.find((row) => row.unit === defaultUnit) as UnitSelection
  );

  const selectedUnitHandle = (_e: React.MouseEvent, item: UnitSelection) => {
    setSelectedUnit(item);
    if (onChange) {
      onChange(item.unit);
    }
  };

  return (
    <UnitSelectorWrapper>
      <span>Pressure Unit : </span>
      <Dropdown
        handleChange={selectedUnitHandle}
        selected={{ ...selectedUnit }}
        items={unitSelections}
        displayField="title"
        valueField="id"
        label="Pressure Unit"
      >
        <ExpandButton text={selectedUnit.title} />
      </Dropdown>
    </UnitSelectorWrapper>
  );
};
