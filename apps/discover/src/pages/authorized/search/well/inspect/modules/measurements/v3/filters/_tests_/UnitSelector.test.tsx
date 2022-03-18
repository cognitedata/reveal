import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testRenderer } from '__test-utils/renderer';
import { PressureUnit, DepthMeasurementUnit } from 'constants/units';

import { UnitSelector, Props } from '../UnitSelector';

describe('View Mode Selector', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(UnitSelector, undefined, viewProps);

  it('Should display default selections', async () => {
    await testInit({
      unit: PressureUnit.PPG,
      reference: DepthMeasurementUnit.MD,
      onUnitChange: jest.fn(),
      onReferenceChange: jest.fn(),
    });

    userEvent.hover(screen.getByTestId('menu-button'));

    expect(screen.getByText(PressureUnit.PPG)).toBeInTheDocument();
  });

  it('Click on drop down and all items are visible', async () => {
    await testInit({
      unit: PressureUnit.PPG,
      reference: DepthMeasurementUnit.MD,
      onUnitChange: jest.fn(),
      onReferenceChange: jest.fn(),
    });

    userEvent.hover(screen.getByTestId('menu-button'));

    userEvent.click(screen.getByText(PressureUnit.PPG));

    expect(screen.getByText(PressureUnit.PSI)).toBeInTheDocument();
  });

  it('Should trigger callback function', async () => {
    const onUnitChange = jest.fn();
    await testInit({
      unit: PressureUnit.PPG,
      reference: DepthMeasurementUnit.MD,
      onUnitChange,
      onReferenceChange: jest.fn(),
    });

    userEvent.hover(screen.getByTestId('menu-button'));

    userEvent.hover(screen.getByText(PressureUnit.PPG));
    userEvent.click(screen.getByText(PressureUnit.PSI));
    expect(onUnitChange).toBeCalledWith(PressureUnit.PSI);
  });
});
