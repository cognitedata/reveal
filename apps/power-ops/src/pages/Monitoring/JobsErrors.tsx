import { Loader } from '@cognite/cogs.js';
import { NotFoundPage } from 'pages/NotFound/NotFound';
import { useFetchSnifferJobErrors } from 'queries/useFetchSnifferJobErrors';

export const JobErrors = ({ jobName }: { jobName: string }) => {
  const { data: jobErrors, status } = useFetchSnifferJobErrors(jobName);

  if (status === 'loading') return <Loader darkMode={false} />;
  if (status === 'error')
    return <NotFoundPage message="Job Errors not found" />;

  return (
    <div>
      {jobErrors.map(
        (errorLog) =>
          errorLog.createdTime && (
            <div key={`errorLog_${errorLog.id}`}>
              <small>
                <code>
                  <b>{new Date(errorLog.createdTime).toLocaleString()}: </b>
                  {errorLog.message}
                </code>
              </small>
            </div>
          )
      )}
    </div>
  );
};
