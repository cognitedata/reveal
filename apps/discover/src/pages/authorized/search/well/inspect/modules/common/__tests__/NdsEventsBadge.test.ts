import { NdsInternal } from 'domain/wells/nds/internal/types';

import { screen } from '@testing-library/react';

import { mockNdsEvents } from '__test-utils/fixtures/nds';
import { testRenderer } from '__test-utils/renderer';

import NdsEventsBadge, { Props } from '../Events/NdsEventsBadge';

const props = {
  events: mockNdsEvents as NdsInternal[],
};

describe('Nds Events Badge', () => {
  const page = (viewProps?: Props) =>
    testRenderer(NdsEventsBadge, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(props),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display events count`, async () => {
    await defaultTestInit();
    expect(await screen.findByText(props.events.length)).toBeInTheDocument();
  });
});
