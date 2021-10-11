import { screen } from '@testing-library/react';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import RelatedDocument from '../RelatedDocument';

jest.mock(
  '../../../../../../../../pages/authorized/search/search/SideBar/filters/RelatedDocumentFilters',
  () => ({
    RelatedDocumentFilters: () => (
      <div data-testid="document-filters">Document filters</div>
    ),
  })
);

describe('Related Document', () => {
  const defaultTestInit = async () =>
    testRenderer(
      RelatedDocument,
      getMockedStore({
        ...mockedWellStateWithSelectedWells,
      })
    );

  it(`should display filters item`, async () => {
    await defaultTestInit();

    const singleItem = screen.queryByTestId('document-filters');
    expect(singleItem?.textContent).toEqual('Document filters');
  });
});
