import { useMutation, useQueryClient } from '@tanstack/react-query';
import set from 'lodash/set';

import sdk from '@cognite/cdf-sdk-singleton';

import { configs, defaultCredentitals } from '../common/data';
import { useIoT, useSASToken } from '../context/IoTHubContext';
import { getIotHubUrl } from '../utils/getIotHubUrl';

import { QUERY_KEY } from '.';
import { useDataSets } from './useDataSets';
import { useDeviceModules } from './useDeviceModules';
import { useProjectConfiguration } from './useProjectConfiguration';
import { useUserProfile } from './useUserProfile';

export const useCreateModule = (deviceId: string) => {
  const {
    iotParams: { resourceUri },
  } = useIoT();
  const { data: dataSets = [] } = useDataSets();
  const { data: userProfile } = useUserProfile();
  const { data: deviceModules } = useDeviceModules(deviceId);
  const queryClient = useQueryClient();
  const token = useSASToken();
  const { data: projectConfig = { oidcConfiguration: { tokenUrl: '' } } } =
    useProjectConfiguration();
  return useMutation(
    ['createModule'],
    async ({
      name,
      extratorType,
      config,
      dataSetExternalId,
    }: {
      name: string;
      extratorType: string;
      dataSetExternalId?: string;
      config: { [key in string]: string };
    }) => {
      const moduleId = name.replaceAll(/[^A-Za-z0-9]/g, '');
      const extPipelineExteralId = `${deviceId.replaceAll(
        /[^A-Za-z0-9]/g,
        ''
      )}_${moduleId}`;
      await sdk.post(`/api/v1/projects/${sdk.project}/extpipes`, {
        data: {
          items: [
            {
              externalId: extPipelineExteralId,
              name: name,
              description: 'string',
              ...(dataSetExternalId && {
                dataSetId: dataSetExternalId
                  ? dataSets.find((el) => el.externalId === dataSetExternalId)
                      ?.id
                  : undefined,
              }),
              createdBy: userProfile?.email,
              documentation: `# ${extratorType}`,
            },
          ],
        },
      });
      if (configs[extratorType]) {
        await sdk.post(`/api/v1/projects/${sdk.project}/extpipes/config`, {
          data: {
            externalId: extPipelineExteralId,
            config: configs[extratorType].defaultConfig,
          },
        });
      }

      const edgeAgent = getKeyAttributesInObj(
        deviceModules?.find((el) => el.moduleId === '$edgeAgent')?.properties
          .desired || {}
      );

      const env: { [key in defaultCredentitals]: string } = {
        ...(config as {
          COGNITE_CLIENT_ID: string;
          COGNITE_CLIENT_SECRET: string;
        }),
        ...(configs[extratorType]?.fixedCredentials || {}),
        COGNITE_BASE_URL: sdk.getBaseUrl(),
        COGNITE_PROJECT: sdk.project,
        COGNITE_EXTRACTION_PIPELINE: extPipelineExteralId,
        COGNITE_TOKEN_URL: projectConfig.oidcConfiguration.tokenUrl.replaceAll(
          'oauth2/token',
          'oauth2/v2.0/token'
        ),
        COGNITE_SCOPE: `${sdk.getBaseUrl()}/.default`,
        DATA_SET_EXTERNAL_ID: dataSetExternalId || '',
      };

      const newEdgeAgent = {
        ...edgeAgent,
        modules: {
          ...edgeAgent.modules,
          [moduleId]: {
            env: Object.entries(env).reduce(
              (prev, [key, value]) => ({
                ...prev,
                [key]: { value },
              }),
              {}
            ),
            restartPolicy: 'always',
            settings: { image: configs[extratorType]?.dockerImage || 'unset' },
            status: 'running',
            type: 'docker',
          },
        },
      };

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
      const queryKey = QUERY_KEY.GET_DEVICE_MODULES(deviceId);
      await queryClient.cancelQueries({ queryKey });
      await queryClient.setQueryData(queryKey, (data: any) => {
        const newData = set(data, '[0].properties.desired', newEdgeAgent);
        return newData;
      });
    }
  );
};

const getKeyAttributesInObj = (obj: any) => {
  return Object.entries(obj).reduce((prev, [key, val]) => {
    if (!key.startsWith('$')) {
      prev[key] = val;
    }
    return prev;
  }, {} as any);
};
