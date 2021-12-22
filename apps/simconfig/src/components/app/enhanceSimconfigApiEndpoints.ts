import { api } from '@cognite/simconfig-api-sdk/rtk';

const ID_LIST = '__LIST__' as const;

export const enhanceSimconfigApiEndpoints = () => {
  api.enhanceEndpoints({
    addTagTypes: ['ModelCalculation', 'ModelFile', 'ModelFileVersion'],
    endpoints: {
      getModelCalculationList: {
        providesTags: (result) => [
          ...(result?.modelCalculationList ?? []).map(({ externalId }) => ({
            type: 'ModelCalculation' as const,
            id: externalId,
          })),
          { type: 'ModelCalculation', id: ID_LIST },
        ],
      },
      getModelCalculation: {
        providesTags: (result) => [
          {
            type: 'ModelCalculation',
            id: result?.externalId,
          },
        ],
      },
      getModelFileList: {
        providesTags: (result) => [
          ...(result?.modelFileList ?? []).map(({ externalId }) => ({
            type: 'ModelFile' as const,
            id: externalId,
          })),
          { type: 'ModelFile', id: ID_LIST },
        ],
      },
      getModelFile: {
        providesTags: (result) => [
          {
            type: 'ModelFile',
            id: result?.externalId,
          },
        ],
      },
      getModelFileVersionList: {
        providesTags: (result) => [
          ...(result?.modelFileList ?? []).map(({ externalId }) => ({
            type: 'ModelFile' as const,
            id: externalId,
          })),
        ],
      },

      createModelFile: {
        invalidatesTags: () => [{ type: 'ModelFile', id: ID_LIST }],
      },
      updateModelFileVersion: {
        invalidatesTags: () => ['ModelFile'],
      },
    },
  });
};
