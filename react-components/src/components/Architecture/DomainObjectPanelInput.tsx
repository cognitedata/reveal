import { Input } from '@cognite/cogs.js';
import { useState, type ReactElement, useEffect } from 'react';
import { type UnitSystem, type LengthUnit } from '../../architecture/base/renderTarget/UnitSystem';
import { useSignalValue } from '@cognite/signals/react';
import { type NumberPanelItem } from '../../architecture/base/domainObjectsHelpers/PanelInfo';

type Props = {
  item: NumberPanelItem;
  unitSystem: UnitSystem;
};

export function DomainObjectPanelInput({ item, unitSystem }: Props): ReactElement {
  function getOriginalValue(): string {
    return unitSystem.toString(item.value, item.quantity, false);
  }
  const [value, setValue] = useState(getOriginalValue());
  const lengthUnit = useSignalValue<LengthUnit>(unitSystem.lengthUnit);
  useEffect(() => {
    setValue(getOriginalValue());
  }, [lengthUnit]);

  function onChange(newStringValue: string): void {
    const newValue = parseFloat(newStringValue);
    if (Number.isNaN(newValue)) {
      setValue('');
      return;
    }
    setValue(newStringValue);
  }

  function onApply(): void {
    if (!item.trySetValue(parseFloat(value), unitSystem)) {
      setValue(getOriginalValue());
    }
  }

  return (
    <Input
      style={{ marginTop: 2, marginBottom: 2 }}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      onBlur={() => {
        onApply();
      }}
      onKeyDownCapture={(event) => {
        if (event.key === 'Enter') onApply();
      }}
      hideSpinButtons
      type="number"
      size="small"
      value={value}
      fullWidth={true}
      prefix={item.label}
      textAlign="right"
      disabled={item.setValue === undefined}
      suffix={unitSystem.getUnit(item.quantity)}
    />
  );
}
