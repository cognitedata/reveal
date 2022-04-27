import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import EventsColumn, {
  EMPTY_STATE_TEXT,
  LOADING_TEXT,
  Props,
} from '../NptEventsColumn';

const props = {
  scaleBlocks: [],
  events: [],
  isEventsLoading: false,
};

describe('Events Column', () => {
  const page = (viewProps?: Props) =>
    testRenderer(EventsColumn, undefined, viewProps);

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
});
