import { withToastForErrorWithArgs } from '@platypus-app/utils/redux-utils';
import { Solution, SolutionSchema } from '@platypus/platypus-core';
import { createAsyncThunk } from '@reduxjs/toolkit';
import services from '../../../di';

export const fetchSolution = createAsyncThunk(
  'solution/fetchSolution',
  withToastForErrorWithArgs<{ solutionId: string }, Solution>(
    async (args: { solutionId: string } | undefined) => {
      const result = await services().solutionHandler.fetch({
        solutionId: args?.solutionId as string,
      });
      return result.getValue();
    }
  )
);

export const fetchVersions = createAsyncThunk(
  'solution/fetchVersions',
  withToastForErrorWithArgs<{ solutionId: string }, SolutionSchema[]>(
    async (args: { solutionId: string } | undefined) => {
      const result = await services().solutionSchemaHandler.versions({
        solutionId: args?.solutionId as string,
      });
      return result.getValue();
    }
  )
);
