import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';
import { PressureUnit } from 'constants/units';

import { UnitSelector, Props } from '../../../filters/UnitSelector';

describe('View Mode Selector', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(UnitSelector, undefined, viewProps);

  it('should display default selections', async () => {
    await testInit({
      unit: PressureUnit.PPG,
      // reference: DepthMeasurementUnit.MD,
      onUnitChange: jest.fn(),
      // onReferenceChange: jest.fn(),
    });

    await fireEvent.mouseEnter(screen.getByTestId('menu-button'), {
      bubbles: true,
    });

    expect(screen.getByText(PressureUnit.PPG)).toBeInTheDocument();
    // expect(screen.getByText(DepthMeasurementUnit.MD)).toBeInTheDocument();
  });
});
