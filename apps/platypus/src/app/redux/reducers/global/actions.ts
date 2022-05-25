import { withToastForErrorWithArgs } from '@platypus-app/utils/redux-utils';
import { DataModel, DataModelVersion } from '@platypus/platypus-core';
import { createAsyncThunk } from '@reduxjs/toolkit';
import services from '../../../di';

export const fetchSolution = createAsyncThunk(
  'solution/fetchSolution',
  withToastForErrorWithArgs<{ solutionId: string }, DataModel>(
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
  withToastForErrorWithArgs<{ solutionId: string }, DataModelVersion[]>(
    async (args: { solutionId: string } | undefined) => {
      const result = await services().solutionSchemaHandler.versions({
        solutionId: args?.solutionId as string,
      });
      return result.getValue();
    }
  )
);
