import ApiContext from 'contexts/ApiContext';
import APIErrorContext from 'contexts/APIErrorContext';
import { useIsTokenAndApiValid } from 'hooks/useIsTokenAndApiValid';
import { useContext } from 'react';
import { useQuery } from 'react-query';
import { SOURCES_KEY } from 'services/configs/queryKeys';
import { CustomError } from 'services/CustomError';

const useSourcesQuery = () => {
  const { api } = useContext(ApiContext);
  const { addError, removeError } = useContext(APIErrorContext);

  const isValid = useIsTokenAndApiValid();

  const { data, ...rest } = useQuery(
    SOURCES_KEY.default,
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
