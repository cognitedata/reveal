import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { HeartbeatsConnector, HeartbeatsOutages } from 'pages/Status/types';
import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SOURCES_KEY } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';
import { HeartbeatsReportResponse } from 'types/ApiInterface';
import { TEN_MINUTES } from 'utils/date';

const useSourcesQuery = () => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [SOURCES_KEY.default],
    async () => {
      return api!.reference.getSources();
    },
    {
      enabled: isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

export const useInstancesQuery = (source: string) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [SOURCES_KEY.instances],
    async () => {
      return api!.connectors.get(source);
    },
    {
      enabled: isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

const useSourceErrorDistributionQuery = ({
  source,
  after,
  enabled = true,
}: {
  source: string;
  after: number;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [SOURCES_KEY.errorDistribution, source, after],
    async () => {
      return api!.statistics.getErrorDistribution(source, after);
    },
    {
      enabled: enabled && isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

const useSourceHeartbeatQuery = ({
  source,
  instance,
  after,
  enabled = true,
}: {
  source: string;
  instance: string;
  after: number;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [SOURCES_KEY.heartbeats, source, instance, after],
    async () => {
      return api!.connectors.getHeartbeats(source, instance, after);
    },
    {
      enabled: enabled && isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

export const useHeartbeatsReportQuery = ({
  source,
  instance,
}: {
  source: string;
  instance: string;
}) => {
  const { api } = useContext(ApiContext);

  const isValid = useIsTokenAndApiValid();

  return useQuery(
    [SOURCES_KEY.heartbeats, 'report', source, instance],
    async () => {
      return api!.connectors.getHeartbeatsReport(source, instance);
    },
    {
      enabled: isValid,
      retry: 1,
      onSuccess: (data) => {
        return data;
      },
      staleTime: TEN_MINUTES,
    }
  );
};

export const useHeartbeatsOutagesReportQuery = (
  connectors: HeartbeatsConnector[]
) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [SOURCES_KEY.heartbeats, 'report', 'outages'],
    async () => {
      const reports = await Promise.allSettled(
        connectors.map((item) =>
          api!.connectors.getHeartbeatsReport(item.source, item.instance)
        )
      );

      const availableReports = reports
        .filter((item) => item.status === 'fulfilled')
        .map((item) => ({
          ...(item as PromiseFulfilledResult<HeartbeatsReportResponse>).value,
        }));

      return availableReports.reduce((acc, report) => {
        const transformedOutage = report.outages?.map((item) => {
          return {
            connector: report.connector,
            outage: item,
          };
        }) as HeartbeatsOutages[];

        return [...acc, ...transformedOutage];
      }, [] as HeartbeatsOutages[]);
    },
    {
      enabled: isValid,
      retry: 1,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
      staleTime: TEN_MINUTES,
    }
  );

  return { data: data || [], ...rest };
};

const useSourceTranslationStatisticsQuery = ({
  source,
  timeRange,
  enabled = true,
}: {
  source: string;
  timeRange: string;
  enabled?: boolean;
}) => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    [SOURCES_KEY.translationStatistics, source, timeRange],
    async () => {
      return api!.statistics.getTranslationStatistics(source, timeRange);
    },
    {
      enabled: enabled && isValid,
      onSuccess: (data) => {
        removeError();
        return data;
      },
      onError: (error: CustomError) => {
        addError(error.message, error.status);
      },
    }
  );

  return { data: data || [], ...rest };
};

export {
  useSourcesQuery,
  useSourceErrorDistributionQuery,
  useSourceHeartbeatQuery,
  useSourceTranslationStatisticsQuery,
};
