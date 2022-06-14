import { withToastForErrorWithArgs } from '@platypus-app/utils/redux-utils';
import { DataModel, DataModelVersion } from '@platypus/platypus-core';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { rootInjector, TOKENS } from '@platypus-app/di';

export const fetchSolution = createAsyncThunk(
  'solution/fetchSolution',
  withToastForErrorWithArgs<{ solutionId: string }, DataModel>(
    async (args: { solutionId: string } | undefined) => {
      const dataModelsHandler = rootInjector.get(TOKENS.dataModelsHandler);
      const result = await dataModelsHandler.fetch({
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
      const dataModelVersionHandler = rootInjector.get(
        TOKENS.dataModelVersionHandler
      );
      const result = await dataModelVersionHandler.versions({
        solutionId: args?.solutionId as string,
      });
      return result.getValue();
    }
  )
);
