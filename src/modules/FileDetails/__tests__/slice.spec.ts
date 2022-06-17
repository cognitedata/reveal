import reducer, {
  initialState,
  fileInfoEdit,
  fileMetaDataEdit,
  toggleMetaDataTableEditMode,
  fileMetaDataAddRow,
  resetEditHistory,
} from 'src/modules/FileDetails/slice';
import { FileDetailsState } from 'src/modules/FileDetails/types';
import { updateFileInfoField } from 'src/store/thunks/Files/updateFileInfoField';

describe('Test file details reducers', () => {
  const mockState: FileDetailsState = {
    metadataEdit: false,
    fileDetails: { labels: [{ externalId: 'testlabel' }] },
    fileMetaData: { 0: { metaKey: 'foo', metaValue: 'bar' } },
    loadingField: 'labels',
  };
  test('should return the initial state for undefined state', () => {
    expect(reducer(undefined, { type: undefined })).toEqual(initialState);
  });
  describe('action fileInfoEdit', () => {
    test('should update file info', () => {
      const newState = reducer(
        mockState,
        fileInfoEdit({ key: 'labels', value: [{ externalId: 'testlabel2' }] })
      );
      expect(newState.fileDetails).toEqual({
        labels: [{ externalId: 'testlabel2' }],
      });
    });
    test('should set file info value to null', () => {
      const newState = reducer(
        mockState,
        fileInfoEdit({ key: 'labels' }) // no value provided
      );
      expect(newState.fileDetails).toEqual({
        labels: null,
      });
    });
  });
  describe('action fileMetaDataEdit', () => {
    test('should set new value', () => {
      const newState = reducer(
        mockState,
        fileMetaDataEdit({ rowIndex: 0, metaKey: 'key', metaValue: 'value' })
      );
      expect(newState.fileMetaData[0]).toEqual({
        metaKey: 'key',
        metaValue: 'value',
      });
    });
    test('should update value to empty string when no value is provided', () => {
      const newState = reducer(
        mockState,
        fileMetaDataEdit({ rowIndex: 1, metaKey: 'key' })
      );
      expect(newState.fileMetaData[1]).toEqual({
        metaKey: 'key',
        metaValue: '',
      });
    });
  });
  test('action resetEditHistory', () => {
    const newState = reducer(mockState, resetEditHistory());
    expect(newState.metadataEdit).toEqual(false);
    expect(newState.fileMetaData).toEqual({});
    expect(newState.fileDetails).toEqual({});
  });
  test('action fileMetaDataAddRow', () => {
    const newState = reducer(
      mockState,
      fileMetaDataAddRow([{ metaKey: 'foo', metaValue: 'bar' }])
    );
    expect(newState.metadataEdit).toEqual(true);
    expect(newState.fileMetaData).toEqual({
      0: { metaKey: 'foo', metaValue: 'bar' },
      1: { metaKey: '', metaValue: '' },
    });
  });
  describe('action toggleMetaDataTableEditMode', () => {
    test('Starting edit mode', () => {
      const startEditModeState: FileDetailsState = {
        ...mockState,
        metadataEdit: false,
      };
      const newState = reducer(
        startEditModeState,
        toggleMetaDataTableEditMode([{ metaKey: 'foo', metaValue: 'bar' }])
      );
      expect(newState.metadataEdit).toEqual(true);
      expect(newState.fileMetaData).toEqual({
        0: { metaKey: 'foo', metaValue: 'bar' },
      }); // new payload is set
    });
    test('Finishing edit mode', () => {
      const finishEditModeState: FileDetailsState = {
        ...mockState,
        metadataEdit: true,
        fileMetaData: {
          0: { metaKey: 'foo', metaValue: 'bar' },
          1: { metaKey: '', metaValue: '' }, // this row should be filtered
          2: { metaKey: '', metaValue: 'bar' }, // this row should be filtered
          3: { metaKey: 'foo', metaValue: '' }, // this row should be filtered
        },
      };
      const newState = reducer(
        finishEditModeState,
        toggleMetaDataTableEditMode([]) // don't care about payload when metadataEdit=true
      );
      expect(newState.metadataEdit).toEqual(false);
      expect(newState.fileMetaData).toEqual({
        0: { metaKey: 'foo', metaValue: 'bar' },
      });
    });
  });

  describe('Test extra reducers', () => {
    describe('action updateFileInfoField.fulfilled', () => {
      test('metadata as arg key', () => {
        const action = {
          type: updateFileInfoField.fulfilled,
          meta: {
            arg: {
              fileId: 1,
              key: 'metadata',
            },
          },
        };
        const newState = reducer(mockState, action);
        expect(newState.fileMetaData).toEqual({});
        expect(newState.loadingField).toEqual(null);
      });
      test('labels as arg key', () => {
        const action = {
          type: updateFileInfoField.fulfilled,
          meta: {
            arg: {
              fileId: 1,
              key: 'labels',
            },
          },
        };
        const newState = reducer(mockState, action);
        expect(newState.fileDetails).toEqual({});
        expect(newState.loadingField).toEqual(null);
      });
    });
    test('action updateFileInfoField.pending', () => {
      const action = {
        type: updateFileInfoField.pending,
        meta: {
          arg: {
            fileId: 1,
            key: 'abcd',
          },
        },
      };
      const newState = reducer(mockState, action);
      expect(newState.loadingField).toEqual('abcd');
    });
    test('action updateFileInfoField.rejected', () => {
      const action = {
        type: updateFileInfoField.rejected,
        meta: {
          arg: {
            fileId: 1,
            key: 'labels',
          },
        },
      };
      const newState = reducer(mockState, action);
      expect(newState.fileDetails).toEqual({});
      expect(newState.loadingField).toEqual(null);
    });
  });
});
