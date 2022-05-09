import { fireEvent, screen } from '@testing-library/react';
import { shortDate } from 'utils/date';

import { testRenderer } from '__test-utils/renderer';

import { RelatedDocumentDateRange } from '../RelatedDocumentDateRange';

describe('Date Range', () => {
  const page = (viewProps?: any) =>
    testRenderer(RelatedDocumentDateRange, undefined, viewProps);

  const defaultTestInit = async () => {
    return { ...page() };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`show min max date`, async () => {
    await defaultTestInit();
    const button = screen.getByText('Date Range');
    await fireEvent.click(button);

    const minMaxDate = screen.getAllByDisplayValue(shortDate(new Date()));
    expect(minMaxDate.length).toBeGreaterThan(0);
  });
});
