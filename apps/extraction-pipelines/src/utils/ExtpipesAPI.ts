import { CogniteClient } from '@cognite/sdk';
import { Extpipe, ExtpipeFieldValue, RegisterExtpipeInfo } from 'model/Extpipe';
import { ExtpipeAPIResponse } from 'model/ExtpipeAPIResponse';
import { get, getBaseUrl } from 'utils/baseURL';
import { getDataSets } from 'utils/DataSetAPI';
import { mapDataSetToExtpipe, mapUniqueDataSetIds } from 'utils/dataSetUtils';

export const getExtpipes = async (sdk: CogniteClient): Promise<Extpipe[]> => {
  const response = await get<ExtpipeAPIResponse>(sdk, '/');
  const dataSetIds = mapUniqueDataSetIds(response.data.items);
  try {
    const dataSetRes = await getDataSets(sdk, dataSetIds);
    return mapDataSetToExtpipe(response.data.items, dataSetRes);
  } catch (e) {
    return response.data.items;
  }
};

export const getExtpipeById = async (
  sdk: CogniteClient,
  extpipeId: number
): Promise<Extpipe> => {
  const response = await get<Extpipe>(sdk, `/${extpipeId}`);
  if (response.data.dataSetId) {
    try {
      const dataSetRes = await getDataSets(sdk, [
        { id: response.data.dataSetId },
      ]);
      return {
        ...response.data,
        ...(dataSetRes[0] && { dataSet: dataSetRes[0] }),
      } as Extpipe;
    } catch (e) {
      return response.data;
    }
  }
  return response.data;
};

type Update = {
  [key: string]: {
    set: ExtpipeFieldValue;
  };
};

export interface ExtpipeUpdateSpec {
  id: string;
  update: Update;
}

export const saveUpdate = async (
  sdk: CogniteClient,
  items: ExtpipeUpdateSpec[]
) => {
  const response = await sdk.post<ExtpipeAPIResponse>(
    `${getBaseUrl(sdk.project)}/update`,
    {
      data: {
        items,
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};

export const registerExtpipe = async (
  sdk: CogniteClient,
  extpipe: Partial<RegisterExtpipeInfo>
) => {
  const response = await sdk.post<ExtpipeAPIResponse>(
    `${getBaseUrl(sdk.project)}`,
    {
      data: {
        items: [extpipe],
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};

export const deleteExtractionPipeline = (
  sdk: CogniteClient,
  extPipeId: number
) => {
  return sdk.post(`${getBaseUrl(sdk.project)}/delete`, {
    withCredentials: true,
    responseType: 'text', // <- to avoid trying to parse response as json resulting in errors
    data: {
      items: [{ id: extPipeId }],
    },
  });
};
