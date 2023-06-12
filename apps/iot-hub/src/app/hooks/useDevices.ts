import { useQuery } from '@tanstack/react-query';

import { useIoT, useSASToken } from '../context/IoTHubContext';
import { getIotHubUrl } from '../utils/getIotHubUrl';

import { QUERY_KEY } from '.';

export type DeviceOverview = {
  deviceId: string;
  status: string;
  statusUpdateTime: string;
  connectionState: string;
  lastActivityTime: string;
  properties: {
    reported: {
      $metadata: { $lastUpdated: string };
    };
  };
};

export const useDevices = () => {
  const {
    isValidParams,
    iotParams: { resourceUri },
  } = useIoT();
  const sasToken = useSASToken();
  return useQuery(
    QUERY_KEY.GET_DEVICES(),
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
            query: 'SELECT * from devices WHERE capabilities.iotEdge = true',
          }),
        }
      );
      if (response.ok) {
        return (await response.json()) as DeviceOverview[];
      } else {
        throw new Error(await response.text());
      }
    },
    { enabled: isValidParams }
  );
};
