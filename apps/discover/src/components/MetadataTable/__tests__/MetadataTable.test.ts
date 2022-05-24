import { screen } from '@testing-library/react';
import { Store } from 'redux';

import { testRenderer } from '__test-utils/renderer';
import { getMockedStore } from '__test-utils/store.utils';

import MetadataTable from '../MetadataTable';

type Prop = {
  metadata: { label: string; value: string }[];
};

describe('meta data table', () => {
  const page = (viewStore: Store, viewProps?: Prop) =>
    testRenderer(MetadataTable, viewStore, viewProps);

  const defaultTestInit = async (viewProps?: Prop) => {
    const store = getMockedStore();
    return { ...page(store, viewProps), store };
  };

  it(`should show meta data in the table`, async () => {
    await defaultTestInit({
      metadata: [
        { label: 'Author', value: 'test-author' },
        { label: 'Location', value: 'test-location' },
      ],
    });

    const checkLabel = screen.getByText('Author');
    expect(checkLabel).toBeInTheDocument();
    const checkLabel2 = screen.getByText('Location');
    expect(checkLabel2).toBeInTheDocument();

    const checkValue = screen.getByText('test-author');
    expect(checkValue).toBeInTheDocument();
    const checkValue2 = screen.getByText('test-location');
    expect(checkValue2).toBeInTheDocument();
  });
});
