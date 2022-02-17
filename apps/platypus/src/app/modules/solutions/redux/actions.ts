import { withToastForError } from '@platypus-app/utils/redux-utils';
import { createAsyncThunk } from '@reduxjs/toolkit';
import services from '@platypus-app/di';

export const fetchSolutions = createAsyncThunk(
  'solutions/fetchSolutions',
  withToastForError(async () => {
    const solutionsHandler = services().solutionHandler;
    const result = await solutionsHandler.list();
    if (!result.isSuccess) {
      throw Error(result.error.name);
    }
    return result.getValue();
  })
);
