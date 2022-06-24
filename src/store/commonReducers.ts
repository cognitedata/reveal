import { PayloadAction } from '@reduxjs/toolkit';
import { FileGeoLocation } from '@cognite/sdk';
import { SelectFilter } from 'src/modules/Common/types';

type FileState = {
  id: number;
  geoLocation?: FileGeoLocation;
};

type State = {
  files: {
    byId: Record<number, FileState>;
    allIds: number[];
    selectedIds: number[];
  };
};

const selectAllFilesFromListWithFilter = (
  fileIds: number[],
  state: State,
  selectStatus: boolean,
  filter?: SelectFilter
) => {
  let selectedIds: number[] = [];
  if (filter) {
    Object.keys(filter).forEach((filterKey) => {
      switch (filterKey) {
        case 'geoLocation': {
          const geoLocationAvailable = filter!.geoLocation;
          const allFiles = fileIds.map(
            (id) => state.files.byId[id]
          ) as FileState[];
          selectedIds = allFiles
            .filter((item) => !!item.geoLocation === geoLocationAvailable)
            .map((file) => file.id);
          break;
        }
        default:
          selectedIds = fileIds;
      }
    });
  } else {
    selectedIds = fileIds;
  }

  if (selectStatus) {
    selectedIds.forEach((id) => {
      if (!state.files.selectedIds.includes(id)) {
        state.files.selectedIds.push(id);
      }
    });
  }
  if (!selectStatus) {
    if (selectedIds.length === fileIds.length) {
      // eslint-disable-next-line no-param-reassign
      state.files.selectedIds = [];
    } else {
      // eslint-disable-next-line no-param-reassign
      state.files.selectedIds = state.files.selectedIds.filter(
        (id) => !selectedIds.includes(id)
      );
    }
  }
};

export const makeReducerSelectAllFilesWithFilter =
  () =>
  (
    state: State,
    {
      payload,
    }: PayloadAction<{
      selectStatus: boolean;
      overridedFileIds?: number[];
      filter?: SelectFilter;
    }>
  ) => {
    const { selectStatus, filter, overridedFileIds } = payload;
    const idsToSelectFrom = overridedFileIds || state.files.allIds;
    selectAllFilesFromListWithFilter(
      idsToSelectFrom,
      state,
      selectStatus,
      filter
    );
  };
