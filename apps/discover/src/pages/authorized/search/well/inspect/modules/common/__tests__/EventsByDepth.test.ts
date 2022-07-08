import { mockNptEvents } from 'domain/wells/npt/internal/__fixtures/npt';

import { screen } from '@testing-library/react';

import { mockNdsEvents } from '__test-utils/fixtures/nds';
import { testRenderer } from '__test-utils/renderer';

import EventsByDepth, { Props } from '../Events/EventsByDepth';

const ndsEvents = mockNdsEvents;
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

// The mocks should be fixed and the tests should be enabled.
// eslint-disable-next-line jest/no-disabled-tests
describe.skip('EventsByDepth', () => {
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
