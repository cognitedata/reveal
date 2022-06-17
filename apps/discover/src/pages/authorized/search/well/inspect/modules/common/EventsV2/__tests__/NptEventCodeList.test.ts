import { fireEvent, screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { ACTION_MESSAGE, NO_DEFINITION } from '../../../events/Npt/constants';
import { NptEventCodeList } from '../NptEventCodeList';

describe('NptEventCodeList', () => {
  it('should render expected result with definition and count', () => {
    const nptCodeDefinition = 'npt definition';
    testRenderer(NptEventCodeList, undefined, {
      events: [{ nptCode: 'npt_code' }, { nptCode: 'npt_code' }],
      nptCodeDefinitions: { npt_code: nptCodeDefinition },
    });
    fireEvent.mouseEnter(screen.getByTestId('info-icon'), { bubbles: true });

    expect(screen.getByText(nptCodeDefinition)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should render expected result with no-definition', () => {
    testRenderer(NptEventCodeList, undefined, {
      events: [{ nptCode: 'npt_code' }],
    });
    fireEvent.mouseEnter(screen.getByTestId('info-icon'), { bubbles: true });

    expect(screen.getByText(NO_DEFINITION)).toBeInTheDocument();
    expect(screen.getByText(ACTION_MESSAGE)).toBeInTheDocument();
  });
});
