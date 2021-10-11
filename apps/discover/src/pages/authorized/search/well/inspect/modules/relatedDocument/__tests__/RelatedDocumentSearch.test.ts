import { screen, fireEvent } from '@testing-library/react';

import { testRenderer } from '__test-utils/renderer';

import { RelatedDocumentSearch } from '../RelatedDocumentSearch';

describe('Related Document search', () => {
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
