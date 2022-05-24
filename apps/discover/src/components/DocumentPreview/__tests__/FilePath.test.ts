import { screen } from '@testing-library/react';
import { getPathsFromDoc } from 'utils/getPathsFromDocument';

import { getMockDocument } from '__test-utils/fixtures/document';
import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import { FilePath } from '../FilePath';

describe('FilePath', () => {
  const store = getMockedStore();

  const page = (viewProps?: { paths: string[] }) =>
    testRenderer(FilePath, store, viewProps);

  test('should not render anything if there is no filepath value provided or empty', async () => {
    const mockDocument = getMockDocument();
    page({
      paths: getPathsFromDoc({
        ...mockDocument,
        doc: { ...mockDocument.doc, filepath: '' },
      }),
    });

    expect(screen.queryByText('Original path')).not.toBeInTheDocument();
  });

  test('should render one path element', async () => {
    const mockDocument = getMockDocument();
    page({
      paths: getPathsFromDoc(mockDocument),
    });

    expect(screen.getByText('Original path')).toBeInTheDocument();
    expect(screen.getAllByTestId('document-parent-path').length).toEqual(1);
  });

  test('should render multiple paths if available', async () => {
    const mockDocument = getMockDocument();
    page({
      paths: getPathsFromDoc({ ...mockDocument, duplicates: [mockDocument] }),
    });

    expect(screen.getByText('Original paths')).toBeInTheDocument();
    expect(screen.getAllByTestId('document-parent-path').length).toEqual(2);
  });
});
