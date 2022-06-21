import { NdsInternal } from 'domain/wells/nds/internal/types';

import { screen } from '@testing-library/react';

import { mockNdsEvents } from '__test-utils/fixtures/nds';
import { testRenderer } from '__test-utils/renderer';

import NdsEventsColumn, {
  EMPTY_STATE_TEXT,
  LOADING_TEXT,
  Props,
} from '../Events/NdsEventsColumn';

const props = {
  scaleBlocks: [],
  events: [],
  isEventsLoading: false,
};

describe('NdsEventsColumn Tests', () => {
  const page = (viewProps?: Props) =>
    testRenderer(NdsEventsColumn, undefined, viewProps);

  const ndsEvents = mockNdsEvents as NdsInternal[];

  const defaultTestInit = async (props: Props) => {
    return {
      ...page(props),
    };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`should display loader on events loading`, async () => {
    await defaultTestInit({ ...props, isEventsLoading: true });
    expect(await screen.findByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it(`should display empty state`, async () => {
    await defaultTestInit({ ...props, events: [] });
    expect(await screen.findByText(EMPTY_STATE_TEXT)).toBeInTheDocument();
  });

  /**
   * Doesn't make any sense to mock old NDS event and write a test. Do once old sdk is cleaned up
   */
  it(`Should display events`, async () => {
    await defaultTestInit({
      ...props,
      events: ndsEvents,
      scaleBlocks: [0, 200],
    });
    expect(await screen.findByText(ndsEvents.length)).toBeInTheDocument();
  });
});
