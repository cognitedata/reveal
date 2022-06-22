import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { NO_DEFINITION } from '../../../components/constants';
import { NptTooltip } from '../NptTooltip';

describe('NptTooltip', () => {
  it('should render expected output with empty input', () => {
    testRenderer(NptTooltip);
    expect(screen.getByText(NO_DEFINITION)).toBeInTheDocument();
  });

  it('should', () => {
    testRenderer(NptTooltip, undefined, {
      event: { nptCode: 'npt_code' },
      definitions: { npt_code: 'code definition' },
    });

    expect(screen.getByText('code definition')).toBeInTheDocument();
  });
});
