import { useMutation, useQueryClient } from '@tanstack/react-query';
import set from 'lodash/set';

import sdk from '@cognite/cdf-sdk-singleton';

import { useIoT, useSASToken } from '../context/IoTHubContext';
import { getIotHubUrl } from '../utils/getIotHubUrl';

import { QUERY_KEY } from '.';
import { useDeviceModules } from './useDeviceModules';
import { useExtractorPipelines } from './useExtractorPipelines';

export const useDeleteModule = (deviceId: string) => {
  const {
    iotParams: { resourceUri },
  } = useIoT();
  const { data: pipelines = [] } = useExtractorPipelines();
  const { data: deviceModules } = useDeviceModules(deviceId);
  const queryClient = useQueryClient();
  const token = useSASToken();
  return useMutation(['createModule'], async (externalId: string) => {
    const edgeAgent = getKeyAttributesInObj(
      deviceModules?.find((el) => el.moduleId === '$edgeAgent')?.properties
        .desired || {}
    );

    const newEdgeAgent = {
      ...edgeAgent,
    };

    const pipeline =
      newEdgeAgent.modules[externalId] &&
      newEdgeAgent.modules[externalId].env &&
      newEdgeAgent.modules[externalId].env['COGNITE_EXTRACTION_PIPELINE'] &&
      pipelines.find(
        (el) =>
          el.externalId ===
          newEdgeAgent.modules[externalId].env['COGNITE_EXTRACTION_PIPELINE']
            .value
      );
    if (pipeline) {
      await sdk.post(`/api/v1/projects/${sdk.project}/extpipes/delete`, {
        data: {
          items: [
            {
              id: pipeline.id,
            },
          ],
        },
      });
    }

    delete newEdgeAgent.modules[externalId];

    await fetch(
      `${getIotHubUrl(
        resourceUri
      )}/devices/${deviceId}/applyConfigurationContent?api-version=2020-09-30`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: token,
        },
        body: JSON.stringify({
          modulesContent: {
            $edgeAgent: {
              'properties.desired': newEdgeAgent,
            },
            $edgeHub: {
              'properties.desired': {
                ...getKeyAttributesInObj(
                  deviceModules?.find((el) => el.moduleId === '$edgeHub')
                    ?.properties.desired || {}
                ),
              },
            },
          },
        }),
      }
    );
    // delete the module as well
    const response2 = await fetch(
      `${getIotHubUrl(
        resourceUri
      )}/devices/${deviceId}/modules?api-version=2020-09-30`,
      {
        method: 'GET',
        headers: {
          authorization: token,
          'Content-Type': 'application/json',
        },
      }
    );
    const etagMap = (await response2.json()) as {
      moduleId: string;
      etag: string;
    }[];
    await fetch(
      `${getIotHubUrl(
        resourceUri
      )}/devices/${deviceId}/modules/${externalId}?api-version=2020-09-30`,
      {
        method: 'DELETE',
        headers: {
          'content-type': 'application/json',
          authorization: token,
          'If-match':
            etagMap?.find((el) => el.moduleId === externalId)?.etag || '',
        },
      }
    );
    const queryKey = QUERY_KEY.GET_DEVICE_MODULES(deviceId);

    queryClient.cancelQueries({ queryKey });
    queryClient.setQueryData(queryKey, (data: any) => {
      const newData = set(data, '[0].properties.desired', newEdgeAgent);
      return newData;
    });
  });
};

const getKeyAttributesInObj = (obj: any) => {
  return Object.entries(obj).reduce((prev, [key, val]) => {
    if (!key.startsWith('$')) {
      prev[key] = val;
    }
    return prev;
  }, {} as any);
};
