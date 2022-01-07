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

export const makeReducerSelectAllFilesWithFilter =
  () =>
  (
    state: State,
    { payload }: PayloadAction<{ selectStatus: boolean; filter?: SelectFilter }>
  ) => {
    const { selectStatus } = payload;
    let selectedIds: number[] = [];
    if (payload.filter) {
      Object.keys(payload.filter).forEach((filter) => {
        switch (filter) {
          case 'geoLocation': {
            const geoLocationAvailable = payload.filter!.geoLocation;
            const allFiles = Object.values(state.files.byId) as FileState[];
            selectedIds = allFiles
              .filter((item) => !!item.geoLocation === geoLocationAvailable)
              .map((file) => file.id);
            break;
          }
          default:
            selectedIds = state.files.allIds;
        }
      });
    } else {
      selectedIds = state.files.allIds;
    }

    if (selectStatus) {
      selectedIds.forEach((id) => {
        if (!state.files.selectedIds.includes(id)) {
          state.files.selectedIds.push(id);
        }
      });
    }
    if (!selectStatus) {
      if (selectedIds.length === state.files.allIds.length) {
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
