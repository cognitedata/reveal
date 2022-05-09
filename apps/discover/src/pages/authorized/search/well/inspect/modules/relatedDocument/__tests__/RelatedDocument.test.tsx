import '__mocks/mockContainerAuth'; // should be first
import '__mocks/mockCogniteSDK';
import { screen } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockDocumentSearch } from 'services/documentSearch/__mocks/getMockDocumentSearch';
import { getMockLabelsPost } from 'services/labels/__mocks/getMockLabels';
import { getMockConfigGet } from 'services/projectConfig/__mocks/getMockConfigGet';
import { getMockSavedSearchRelatedGet } from 'services/savedSearches/__mocks/getMockSavedSearchRelatedGet';

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
