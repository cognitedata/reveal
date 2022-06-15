import { withToastForErrorWithArgs } from '@platypus-app/utils/redux-utils';
import { DataModel, DataModelVersion } from '@platypus/platypus-core';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { rootInjector, TOKENS } from '@platypus-app/di';

export const fetchDataModel = createAsyncThunk(
  'dataModel/fetchDataModel',
  withToastForErrorWithArgs<{ dataModelId: string }, DataModel>(
    async (args: { dataModelId: string } | undefined) => {
      const dataModelsHandler = rootInjector.get(TOKENS.dataModelsHandler);
      const result = await dataModelsHandler.fetch({
        dataModelId: args?.dataModelId as string,
      });
      return result.getValue();
    }
  )
);

export const fetchVersions = createAsyncThunk(
  'dataModel/fetchVersions',
  withToastForErrorWithArgs<{ dataModelId: string }, DataModelVersion[]>(
    async (args: { dataModelId: string } | undefined) => {
      const dataModelVersionHandler = rootInjector.get(
        TOKENS.dataModelVersionHandler
      );
      const result = await dataModelVersionHandler.versions({
        dataModelId: args?.dataModelId as string,
      });
      return result.getValue();
    }
  )
);
