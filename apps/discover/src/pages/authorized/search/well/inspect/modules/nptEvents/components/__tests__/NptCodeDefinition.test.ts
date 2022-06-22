import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ACTION_MESSAGE, NO_DEFINITION } from '../constants';
import { NptCodeDefinition } from '../NptCodeDefinition';

describe('NptCodeDefinition', () => {
  it('should render info icon with empty messages', async () => {
    testRenderer(NptCodeDefinition);
    fireEvent.mouseEnter(screen.getByTestId('info-icon'), { bubbles: true });

    expect(screen.getByText(NO_DEFINITION)).toBeInTheDocument();
    expect(screen.getByText(ACTION_MESSAGE)).toBeInTheDocument();
  });

  it('should render tooltip with definition', async () => {
    const testDefinition = 'Test definition';
    testRenderer(NptCodeDefinition, undefined, {
      nptCodeDefinition: testDefinition,
    });

    fireEvent.mouseEnter(screen.getByTestId('info-icon'), { bubbles: true });
    expect(screen.getByText(testDefinition)).toBeInTheDocument();
  });
});
