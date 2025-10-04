import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Quantity, UnitSystem } from '../../architecture';
import { DomainObjectPanelInput } from './DomainObjectPanelInput';
import { NumberPanelItem } from '../../architecture/base/domainObjectsHelpers/PanelInfo';
import '@testing-library/jest-dom';
import { translate } from '../../architecture/base/utilities/translation/translateUtils';

describe(DomainObjectPanelInput.name, () => {
  test('Should show disabled input with label, value, unit', async () => {
    const unitSystem = new UnitSystem();
    const item = createItem(true);
    renderInput(unitSystem, item);

    const unit = screen.queryByText(unitSystem.getUnit(item.quantity));
    expect(unit).toBeDefined();

    const label = screen.queryByText(translate(item.translationInput));
    expect(label).toBeDefined();

    const input = screen.getByRole('spinbutton');
    expect(input).toBeDefined();
    expect(input).toHaveValue(item.value);
    expect(input).toBeDisabled();
  });

  test('Should show enabled input and can be changed on blur or enter key', async () => {
    const unitSystem = new UnitSystem();
    const item = createItem(false);
    renderInput(unitSystem, item);

    const input = screen.getByRole('spinbutton');
    expect(input).toBeDefined();
    expect(input).toHaveValue(item.value);
    expect(input).toBeEnabled();

    for (const time of [1, 2]) {
      await userEvent.click(input);
      await userEvent.clear(input);
      expect(input).toHaveValue(null);
      await userEvent.type(input, '1');
      expect(input).toHaveValue(1);
      await userEvent.type(input, '2');
      expect(input).toHaveValue(12);
      if (time === 1) {
        await userEvent.keyboard('[Enter]'); // Enter key press
      } else {
        await userEvent.tab(); // Simulates pressing the Tab key, causing a blur
      }
      expect(item.setValue).toBeCalledTimes(time);
      expect(item.setValue).toHaveBeenCalledWith(12);
    }
  });
});

function createItem(readonly: boolean): NumberPanelItem {
  return new NumberPanelItem({
    value: 42,
    setValue: readonly ? undefined : vi.fn(),
    quantity: Quantity.Length,
    translationInput: { key: 'RADIUS' }
  });
}

function renderInput(unitSystem: UnitSystem, item: NumberPanelItem): void {
  render(
    <div style={{ display: 'flex' }}>
      <DomainObjectPanelInput unitSystem={unitSystem} item={item} />
    </div>
  );
}
