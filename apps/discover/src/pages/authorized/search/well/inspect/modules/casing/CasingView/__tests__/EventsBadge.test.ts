import { screen } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import EventsBadge from '../NptEventsBadge';

const props = {
  events: [
    { nptCode: 'CODE1' },
    { nptCode: 'CODE2' },
    { nptCode: 'CODE3' },
    { nptCode: 'CODE4' },
    { nptCode: 'CODE5' },
    { nptCode: 'CODE6' },
  ],
};

describe('Events Badge', () => {
  const page = (viewProps?: any) =>
    testRenderer(EventsBadge, undefined, viewProps);

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
