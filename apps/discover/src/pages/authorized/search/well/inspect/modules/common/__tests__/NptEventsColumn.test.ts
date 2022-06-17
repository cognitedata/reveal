import { screen } from '@testing-library/react';

import { mockNptEvents } from '__test-utils/fixtures/npt';
import { testRenderer } from '__test-utils/renderer';

import NptEventsColumn, {
  EMPTY_STATE_TEXT,
  LOADING_TEXT,
  Props,
} from '../EventsV2/NptEventsColumn';

const props = {
  scaleBlocks: [],
  events: [],
  isEventsLoading: false,
};

describe('NptEventsColumn Tests', () => {
  const page = (viewProps?: Props) =>
    testRenderer(NptEventsColumn, undefined, viewProps);

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

  it(`Should display events`, async () => {
    await defaultTestInit({
      ...props,
      events: mockNptEvents,
      scaleBlocks: [0, 200],
    });
    expect(await screen.findByText(mockNptEvents.length)).toBeInTheDocument();
  });
});
