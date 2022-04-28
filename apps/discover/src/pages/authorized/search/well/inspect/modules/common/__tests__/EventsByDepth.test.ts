import { screen } from '@testing-library/react';

import { mockNdsV2Events } from '__test-utils/fixtures/nds';
import { mockNptEvents } from '__test-utils/fixtures/npt';
import { testRenderer } from '__test-utils/renderer';

import EventsByDepth, { Props } from '../Events/EventsByDepth';

const ndsEvents = mockNdsV2Events();
const nptEvents = mockNptEvents;

const props = {
  scaleBlocks: [100, 200, 300],
  minDepth: 100,
  maxDepth: 300,
  nptEvents,
  ndsEvents,
  isNptEventsLoadin: false,
  isNdsEventsLoading: false,
};

describe('EventsByDepth', () => {
  const page = (viewProps?: Props) =>
    testRenderer(EventsByDepth, undefined, viewProps);

  const defaultTestInit = async () => {
    return {
      ...page(props as Props),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display unit`, async () => {
    await defaultTestInit();
    expect(await screen.findByText(ndsEvents.length)).toBeInTheDocument();
  });
});
