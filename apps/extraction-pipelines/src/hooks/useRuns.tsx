import { QueryResult, useQuery } from 'react-query';
import { getRuns } from '../utils/RunsAPI';
import { useAppEnv } from './useAppEnv';
import { RunResponse } from '../model/Runs';
import { SDKError } from '../model/SDKErrors';

export const useRuns = (
  externalId: string
): QueryResult<RunResponse[], SDKError> => {
  const { project } = useAppEnv();
  return useQuery<RunResponse[], SDKError>([project, externalId], getRuns);
};
