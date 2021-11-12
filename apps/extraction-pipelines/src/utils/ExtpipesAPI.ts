import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { Extpipe, ExtpipeFieldValue, RegisterExtpipeInfo } from 'model/Extpipe';
import { ExtpipeAPIResponse } from 'model/ExtpipeAPIResponse';
import { get, getBaseUrl } from 'utils/baseURL';
import { getDataSets } from 'utils/DataSetAPI';
import { mapDataSetToExtpipe, mapUniqueDataSetIds } from 'utils/dataSetUtils';

export const getExtpipes = async (project: string): Promise<Extpipe[]> => {
  const response = await get<ExtpipeAPIResponse>('/', project);
  const dataSetIds = mapUniqueDataSetIds(response.data.items);
  try {
    const dataSetRes = await getDataSets(dataSetIds);
    return mapDataSetToExtpipe(response.data.items, dataSetRes);
  } catch (e) {
    return response.data.items;
  }
};

export const getExtpipeById = async (
  extpipeId: number,
  project: string
): Promise<Extpipe> => {
  const response = await get<Extpipe>(`/${extpipeId}`, project);
  if (response.data.dataSetId) {
    try {
      const dataSetRes = await getDataSets([{ id: response.data.dataSetId }]);
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
  project: string,
  items: ExtpipeUpdateSpec[]
) => {
  const response = await sdkv3.post<ExtpipeAPIResponse>(
    `${getBaseUrl(project)}/update`,
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
  project: string,
  extpipe: Partial<RegisterExtpipeInfo>
) => {
  const response = await sdkv3.post<ExtpipeAPIResponse>(
    `${getBaseUrl(project)}`,
    {
      data: {
        items: [extpipe],
      },
      withCredentials: true,
    }
  );
  return response.data.items[0];
};

export const deleteExtractionPipeline = (extPipeId: number) => {
  return sdkv3.post(`${getBaseUrl(sdkv3.project)}/delete`, {
    withCredentials: true,
    responseType: 'text', // <- to avoid trying to parse response as json resulting in errors
    data: {
      items: [{ id: extPipeId }],
    },
  });
};
