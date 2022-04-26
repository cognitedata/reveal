import { screen, fireEvent } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { getMockSavedSearchRelatedGet } from 'services/savedSearches/__mocks/getMockSavedSearchRelatedGet';

import { testRenderer } from '__test-utils/renderer';

import { RelatedDocumentSearch } from '../RelatedDocumentSearch';

const mockServer = setupServer(getMockSavedSearchRelatedGet());

describe('Related Document search', () => {
  beforeAll(() => mockServer.listen());
  afterAll(() => mockServer.close());

  const defaultTestInit = async () =>
    testRenderer(RelatedDocumentSearch, undefined, null);

  it(`should press enter`, async () => {
    await defaultTestInit();

    const input = screen.getByTestId('input-search');
    fireEvent.change(input, { target: { value: 'search-phrase' } });

    fireEvent.keyUp(input, { key: 'Enter', code: 'Enter' });
    expect(input).toHaveValue('search-phrase');
  });
});
