import { QueryResult, useQuery } from 'react-query';
import { getRuns } from '../utils/RunsAPI';
import { useAppEnv } from './useAppEnv';
import { StatusRow } from '../model/Runs';
import { SDKError } from '../model/SDKErrors';

export const useRuns = (
  externalId: string
): QueryResult<StatusRow[], SDKError> => {
  const { project } = useAppEnv();
  return useQuery<StatusRow[], SDKError>([project, externalId], getRuns, {
    retry: false,
  });
};
