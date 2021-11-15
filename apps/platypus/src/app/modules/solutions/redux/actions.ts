import { withToastForError } from '@platypus-app/utils/redux-utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import services from '../di';

export const fetchSolutions = createAsyncThunk(
  'solutions/fetchSolutions',
  withToastForError(async () => {
    const solutionsHandler = services().solutionsHandler;
    const result = await solutionsHandler.list();
    if (!result.isSuccess) {
      throw Error(result.error);
    }
    return result.getValue();
  })
);
