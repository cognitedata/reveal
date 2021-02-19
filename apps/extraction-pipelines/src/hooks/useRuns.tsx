import { useQuery } from 'react-query';
import { getRuns } from '../utils/RunsAPI';
import { useAppEnv } from './useAppEnv';
import { SDKError } from '../model/SDKErrors';
import { RunsAPIResponse } from '../model/Runs';

export const useRuns = (externalId?: string, nextCursor?: string) => {
  const { project } = useAppEnv();
  return useQuery<RunsAPIResponse, SDKError>(
    [project, externalId, nextCursor],
    (ctx) => {
      return getRuns(ctx.queryKey[0], ctx.queryKey[1], ctx.queryKey[2]);
    },
    {
      enabled: !!externalId,
    }
  );
};
