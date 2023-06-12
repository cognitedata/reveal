import { useQuery } from '@tanstack/react-query';

import { useIoT, useSASToken } from '../context/IoTHubContext';
import { getIotHubUrl } from '../utils/getIotHubUrl';

import { QUERY_KEY } from '.';

export type Module = {
  type: 'docker';
  settings: {
    image: string;
  };
  version: '1.0';
  env: { [key in string]: { value: string } };
  status: string;
  restartPolicy: string;
};

export type Device = {
  deviceId: string;
  status: string;
  moduleId: string;
  deviceEtag: string;
  statusUpdateTime: string;
  connectionState: string;
  lastActivityTime: string;
  properties: {
    desired: {
      schemaVersion: '1.1';
      runtime: {
        type: 'docker';
        settings: {};
      };
      modules?: { [key in string]: Module };
    };
    reported: {
      systemModules?: {
        [key in string]: {
          runtimeStatus: string;
          lastStartTimeUtc: string;
          type: 'docker';
        };
      };
      $metadata: {
        $lastUpdated: string;
        version: {
          $lastUpdated: string;
          commit: {
            $lastUpdated: string;
          };
          build: {
            $lastUpdated: string;
          };
          version: {
            $lastUpdated: string;
          };
        };
        systemModules: {
          [key in string]: {
            $lastUpdated: string;
            exitCode: {
              $lastUpdated: string;
            };
            runtimeStatus: {
              $lastUpdated: string;
            };
            settings: {
              $lastUpdated: string;
              imageHash: {
                $lastUpdated: string;
              };
              image: {
                $lastUpdated: string;
              };
              createOptions: {
                $lastUpdated: string;
              };
            };
            startupOrder: {
              $lastUpdated: string;
            };
            lastStartTimeUtc: {
              $lastUpdated: string;
            };
            imagePullPolicy: {
              $lastUpdated: string;
            };
            lastExitTimeUtc: {
              $lastUpdated: string;
            };
            type: {
              $lastUpdated: string;
            };
          };
        };
      };
      modules?: {
        [key in string]: {
          lastStartTimeUtc: string;
        };
      };
    };
  };
};

export const useDeviceModules = (deviceId: string) => {
  const {
    isValidParams,
    iotParams: { resourceUri },
  } = useIoT();
  const sasToken = useSASToken();
  return useQuery(
    QUERY_KEY.GET_DEVICE_MODULES(deviceId),
    async () => {
      const response = await fetch(
        `${getIotHubUrl(resourceUri)}/devices/query?api-version=2020-09-30`,
        {
          method: 'POST',
          headers: {
            authorization: sasToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `SELECT * FROM devices.modules WHERE moduleId in ['$edgeAgent', '$edgeHub'] and deviceId in ['${deviceId}']`,
          }),
        }
      );
      if (response.ok) {
        const data = (await response.json()) as Device[];
        return data;
      } else {
        throw new Error(await response.text());
      }
    },
    { enabled: isValidParams }
  );
};
