import { fireEvent, screen } from '@testing-library/react';
import { getDateOrDefaultText } from 'utils/date';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { RelatedDocumentDateRange } from '../RelatedDocumentDateRange';

describe('Date Range', () => {
  const store = getMockedStore();
  const page = (viewProps?: any) =>
    testRenderer(RelatedDocumentDateRange, store, viewProps);

  const defaultTestInit = async () => {
    return { ...page() };
  };

  afterAll(jest.clearAllMocks);
  beforeEach(jest.clearAllMocks);

  it(`show min max date`, async () => {
    await defaultTestInit();
    const button = screen.getByText('Date Range');
    await fireEvent.click(button);

    const minMaxDate = screen.getAllByDisplayValue(
      getDateOrDefaultText(new Date())
    );
    expect(minMaxDate.length).toBeGreaterThan(0);
  });
});
