import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Categories } from 'src/modules/Review/types';
import { deselectAllSelectionsReviewPage } from 'src/store/commonActions';

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
      if (action.payload.category) {
        /* eslint-disable no-param-reassign */
        if (action.payload.selected) {
          state.categories[action.payload.category as Categories] = {
            selected: action.payload.selected,
          };
        } else if (state.categories[action.payload.category]) {
          delete state.categories[action.payload.category];
        }
        /* eslint-enable no-param-reassign */
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(deselectAllSelectionsReviewPage, (state) => {
      // eslint-disable-next-line no-param-reassign
      state.categories = {};
    });
  },
});

export type { State as AnnotationDetailPanelState };
export { initialState as annotationDetailPanelInitialState };

export const { selectCategory } = annotationDetailPanelSlice.actions;

export default annotationDetailPanelSlice.reducer;
