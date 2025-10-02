import { Input } from '@cognite/cogs.js';
import { useState, type ReactElement, useEffect } from 'react';
import { type UnitSystem, type LengthUnit } from '../../architecture/base/renderTarget/UnitSystem';
import { useSignalValue } from '@cognite/signals/react';
import { type NumberPanelItem } from '../../architecture/base/domainObjectsHelpers/PanelInfo';

type NumberInputProps = {
  item: NumberPanelItem;
  unitSystem: UnitSystem;
};

export function DomainObjectPanelInput({ item, unitSystem }: NumberInputProps): ReactElement {
  function getOriginalValue(): string {
    return unitSystem.toString(item.value, item.quantity, false);
  }
  const [value, setValue] = useState(getOriginalValue());
  const lengthUnit = useSignalValue<LengthUnit>(unitSystem.lengthUnit);
  useEffect(() => {
    setValue(getOriginalValue());
  }, [lengthUnit]);

  function onChange(newStringValue: string): void {
    if (item.setValue === undefined) {
      return;
    }
    const newValue = parseFloat(newStringValue);
    if (Number.isNaN(newValue)) {
      setValue('');
      return;
    }
    setValue(newStringValue);
  }

  function onApply(): void {
    if (item.setValue === undefined) {
      return;
    }
    const newValue = parseFloat(value);
    if (Number.isNaN(newValue)) {
      setValue(getOriginalValue());
      return;
    }
    const newMetricValue = unitSystem.convertFromUnit(newValue, item.quantity);
    if (item.verifyValue !== undefined && !item.verifyValue(newMetricValue)) {
      setValue(getOriginalValue());
      return;
    }
    item.setValue(newMetricValue);
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
      prefix={item.getText()}
      textAlign="right"
      disabled={item.setValue === undefined}
      suffix={unitSystem.getUnit(item.quantity)}
    />
  );
}
