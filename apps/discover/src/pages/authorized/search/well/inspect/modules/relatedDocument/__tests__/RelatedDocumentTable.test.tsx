import '__mocks/mockCogniteSDK';
import { screen } from '@testing-library/react';

import { mockedWellStateWithSelectedWells } from '__test-utils/fixtures/well';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';
import { LOADING_TEXT } from 'components/EmptyState/constants';

import {
  RelatedDocumentTable,
  RelatedDocumentTableComponent,
} from '../RelatedDocumentTable';

describe('RelatedDocumentTable', () => {
  const testInit = async () =>
    testRenderer(
      RelatedDocumentTable,
      getMockedStore({ ...mockedWellStateWithSelectedWells })
    );

  it('should display loader on related document loading', async () => {
    await testInit();
    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });
});

describe('RelatedDocumentTableComponent', () => {
  const testInit = async () =>
    testRenderer(
      RelatedDocumentTableComponent,
      getMockedStore({ ...mockedWellStateWithSelectedWells })
    );

  it('should display loader on related document loading', async () => {
    await testInit();
    expect(screen.getByTestId('related-document-table')).toBeInTheDocument();
  });
});
