import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testRenderer } from '__test-utils/renderer';
import { PressureUnit } from 'constants/units';

import { UnitFilter, Props } from '../UnitFilter';

describe('UnitFilter tests', () => {
  const testInit = async <T extends PressureUnit>(viewProps?: Props<T>) =>
    testRenderer(UnitFilter, undefined, viewProps);

  it('Should display default selection', async () => {
    await testInit<PressureUnit>({
      title: 'Test title',
      selected: PressureUnit.PPG,
      options: [PressureUnit.PPG, PressureUnit.PSI],
      onChange: jest.fn(),
    });

    expect(screen.getByText(PressureUnit.PPG)).toBeInTheDocument();
  });

  it('Click on drop down and all items are visible', async () => {
    await testInit<PressureUnit>({
      title: 'Test title',
      selected: PressureUnit.PPG,
      options: [PressureUnit.PPG, PressureUnit.PSI],
      onChange: jest.fn(),
    });

    await userEvent.click(screen.getByText(PressureUnit.PPG));

    expect(screen.getByText(PressureUnit.PSI)).toBeInTheDocument();
  });

  it('Clicking different item should trigger on change callback', async () => {
    const onChange = jest.fn();
    await testInit<PressureUnit>({
      title: 'Test title',
      selected: PressureUnit.PPG,
      options: [PressureUnit.PPG, PressureUnit.PSI],
      onChange,
    });

    await userEvent.click(screen.getByText(PressureUnit.PPG));
    expect(screen.getByText(PressureUnit.PSI)).toBeInTheDocument();
    await userEvent.click(screen.getByText(PressureUnit.PSI));
    expect(onChange).toBeCalledWith(PressureUnit.PSI);
  });
});
