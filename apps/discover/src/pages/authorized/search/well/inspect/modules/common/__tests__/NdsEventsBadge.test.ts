import { screen } from '@testing-library/react';

import { mockNdsV2Events } from '__test-utils/fixtures/nds';
import { testRenderer } from '__test-utils/renderer';

import NdsEventsBadge, { Props } from '../EventsV2/NdsEventsBadge';

const props = {
  events: mockNdsV2Events(),
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
