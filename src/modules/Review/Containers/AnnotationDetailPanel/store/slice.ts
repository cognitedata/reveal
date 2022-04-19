import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Categories } from 'src/modules/Review/types';

type CategoryState = {
  [index in Categories]?: { selected: boolean };
};

const categories: CategoryState = {};

type State = {
  categories: CategoryState;
};
const initialState: State = { categories };

const annotationDetailPanelSlice = createSlice({
  name: 'annotationDetailPanelSlice',
  initialState,
  reducers: {
    selectCategory(
      state,
      action: PayloadAction<{ category: Categories; selected: boolean }>
    ) {
      if (action.payload.category && action.payload.selected !== undefined) {
        // eslint-disable-next-line no-param-reassign
        state.categories[action.payload.category as Categories] = {
          selected: action.payload.selected,
        };
      }
    },
  },
});

export type { State as AnnotationDetailPanelState };
export { initialState as annotationDetailPanelInitialState };

export const { selectCategory } = annotationDetailPanelSlice.actions;

export default annotationDetailPanelSlice.reducer;
