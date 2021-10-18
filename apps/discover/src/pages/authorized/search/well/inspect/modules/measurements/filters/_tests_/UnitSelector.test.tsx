import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { UnitSelector, Props } from '../UnitSelector';

describe('View Mode Selector', () => {
  const testInit = async (viewProps?: Props) =>
    testRenderer(UnitSelector, undefined, viewProps);

  it('should display default selections', async () => {
    await testInit({
      unit: 'PPG',
      reference: 'MD',
      onUnitChange: jest.fn(),
      onReferenceChange: jest.fn(),
    });
    expect(screen.getByText('PPG')).toBeInTheDocument();
    expect(screen.getByText('MD')).toBeInTheDocument();
  });
});
