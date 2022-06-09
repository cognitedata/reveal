import '__mocks/mockContainerAuth'; // should be first
import '__mocks/mockCogniteSDK';
import { getMockDocumentSearch } from 'domain/documents/service/__mocks/getMockDocumentSearch';
import { getMockLabelsPost } from 'domain/labels/service/__mocks/getMockLabels';
import { getMockSavedSearchRelatedGet } from 'domain/savedSearches/service/__mocks/getMockSavedSearchRelatedGet';

import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import RelatedDocument from '../RelatedDocument';

const mockServer = setupServer(
  getMockLabelsPost(),
  getMockDocumentSearch(),
  getMockSavedSearchRelatedGet(),
  getMockConfigGet()
);

describe('Related Document', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  async function defaultTestInit() {
    return testRenderer(
      RelatedDocument,
      getMockedStore({
        ...mockedWellStateWithSelectedWells,
      })
    );
  }

  it(`should display filters item`, async () => {
    await defaultTestInit();

    expect(screen.getByText('File Type')).toBeInTheDocument();
    expect(screen.getByText('Date Range')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
  });
});
