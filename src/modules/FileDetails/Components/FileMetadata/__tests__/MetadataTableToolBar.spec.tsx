import React from 'react';

import { fireEvent, screen, waitFor } from '@testing-library/react';

import { testRenderer } from 'src/__test-utils/renderer';

import { MetadataTableToolBar } from 'src/modules/FileDetails/Components/FileMetadata/MetadataTableToolBar';
import { getMockedStore } from 'src/__test-utils/store.utils';
import { MetadataItem } from 'src/modules/FileDetails/Components/FileMetadata/Types';

describe('MetadataTableToolBar', () => {
  const TestComponent = (props: any) => {
    return <MetadataTableToolBar {...props} />;
  };

  const onAddRow = jest.fn();
  const onEditModeChange = jest.fn();

  const props = {
    editMode: false,
    metadata: [],
    onAddRow,
    onEditModeChange,
  };

  it('should render "Add row" and "Edit table" when `editMode` is false', () => {
    const store = getMockedStore();
    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Add row')).toBeInTheDocument();
    expect(screen.getByText('Edit table')).toBeInTheDocument();
  });

  it('should have current button states when metadata is empty', () => {
    const store = getMockedStore();
    testRenderer(TestComponent, store, props);
    expect(screen.getByText('Add row').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Edit table').closest('button')).toBeDisabled();
  });

  it('should dispatch action of type `fileDetailsSlice/fileMetaDataAddRow` when clicking on "Add row"', async () => {
    const store = getMockedStore();

    testRenderer(TestComponent, store, props);

    fireEvent.click(screen.getByText('Add row'));
    expect(onAddRow).toBeCalledTimes(1);
    await waitFor(() => {
      expect(store.getActions()).toEqual([
        {
          payload: [],
          type: 'fileDetailsSlice/fileMetaDataAddRow',
        },
      ]);
    });
  });

  it('should dispatch action of type `fileDetailsSlice/toggleMetaDataTableEditMode` when clicking on "Edit table"', async () => {
    const store = getMockedStore();
    const metadata = [{ key: 'asset', value: 2 } as MetadataItem];
    testRenderer(TestComponent, store, {
      ...props,
      metadata,
    });

    // Add row should still be active and so should Edit table
    expect(screen.getByText('Add row').closest('button')).not.toBeDisabled();
    expect(screen.getByText('Edit table').closest('button')).not.toBeDisabled();

    fireEvent.click(screen.getByText('Edit table'));
    expect(onEditModeChange).toBeCalledTimes(1);
    await waitFor(() => {
      expect(store.getActions()).toEqual([
        {
          payload: metadata,
          type: 'fileDetailsSlice/toggleMetaDataTableEditMode',
        },
      ]);
    });
  });
});
