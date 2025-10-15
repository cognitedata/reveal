import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { Quantity, UnitSystem } from '../../architecture';
import { DomainObjectPanelInput } from './DomainObjectPanelInput';
import { NumberPanelItem } from '../../architecture/base/domainObjectsHelpers/PanelInfo';

describe(DomainObjectPanelInput.name, () => {
  const unitSystem = new UnitSystem();

  test('Should show disabled input with label, value, unit', async () => {
    const item = createItem(true);
    renderInput(unitSystem, item);

    const unitElement = screen.queryByText(unitSystem.getUnit(item.quantity));
    expect(unitElement).toBeDefined();

    const labelElement = screen.queryByText(item.label ?? '');
    expect(labelElement).toBeDefined();

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toBeDefined();
    expect(inputElement).toHaveValue(item.value);
    expect(inputElement).toBeDisabled();
  });

  test('Should show enabled input and can be changed on blur or enter key', async () => {
    const item = createItem(false);
    renderInput(unitSystem, item);

    const inputElement = screen.getByRole('spinbutton');
    expect(inputElement).toBeDefined();
    expect(inputElement).toHaveValue(item.value);
    expect(inputElement).toBeEnabled();

    for (const time of [1, 2]) {
      await userEvent.click(inputElement);
      await userEvent.clear(inputElement);
      expect(inputElement).toHaveValue(null);
      await userEvent.type(inputElement, '4');
      expect(inputElement).toHaveValue(4);
      await userEvent.type(inputElement, '3');
      expect(inputElement).toHaveValue(43);
      if (time === 1) {
        await userEvent.keyboard('[Enter]'); // Enter key press
      } else {
        await userEvent.tab(); // Simulates pressing the Tab key, causing a blur
      }
      expect(item.setValue).toBeCalledTimes(time);
      expect(item.setValue).toHaveBeenCalledWith(43);
    }
  });

  test('Should give a minus sign and blur (corner case)', async () => {
    const item = createItem(false);
    renderInput(unitSystem, item);

    const inputElement = screen.getByRole('spinbutton');
    await userEvent.click(inputElement);
    await userEvent.clear(inputElement);
    expect(inputElement).toHaveValue(null);
    await userEvent.type(inputElement, '-');
    await userEvent.type(inputElement, '2');
    expect(inputElement).toHaveValue(-2);

    await userEvent.tab(); // Simulates pressing the Tab key, causing a blur
    expect(inputElement).toHaveValue(EXPECTED_VALUE); // Resets to original value
    expect(item.setValue).toBeCalledTimes(0); // Should not be called, because -2 is illegal
  });

  test('Should try to set illegal value', async () => {
    const item = createItem(false);
    renderInput(unitSystem, item);

    const inputElement = screen.getByRole('spinbutton');
    await userEvent.click(inputElement);
    await userEvent.clear(inputElement);
    await userEvent.type(inputElement, '41'); // 41 is illegal, must be >= 42
    await userEvent.tab(); // Simulates pressing the Tab key, causing a blur
    expect(inputElement).toHaveValue(EXPECTED_VALUE); // Resets to original value
    expect(item.setValue).toBeCalledTimes(0); // Should not be called, , because 41 is illegal
  });
});

const EXPECTED_VALUE = 42;

function createItem(readonly: boolean): NumberPanelItem {
  return new NumberPanelItem({
    value: EXPECTED_VALUE,
    setValue: readonly ? undefined : vi.fn(),
    verifyValue: readonly ? undefined : (v: number) => v >= EXPECTED_VALUE,
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
