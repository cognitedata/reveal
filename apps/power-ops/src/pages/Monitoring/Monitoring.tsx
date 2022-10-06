import { Fragment } from 'react';
import { useMetrics } from '@cognite/metrics';
import { useFetchSnifferJobs } from 'queries/useFetchSnifferJobs';
import { Flex, Label, Button } from '@cognite/cogs.js';
import { useStartAllSnifferJobs } from 'queries/useStartAllSnifferJobs';
import { useStopAllSnifferJobs } from 'queries/useStopAllSnifferJobs';

import { Container, StyledTable } from './elements';
import { JobErrors } from './JobsErrors';

export const Monitoring = () => {
  const metrics = useMetrics('monitoring');
  const { data: jobs = [] } = useFetchSnifferJobs();
  const { mutate: startAllJobs } = useStartAllSnifferJobs();
  const { mutate: stopAllJobs } = useStopAllSnifferJobs();

  const startJobs = async () => {
    metrics.track('click-start-all-jobs-button');
    startAllJobs();
  };

  const stopJobs = async () => {
    metrics.track('click-stop-all-jobs-button');
    stopAllJobs();
  };

  return (
    <Container
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyItems: 'center',
        margin: '0 30px',
      }}
    >
      <Flex gap={8} style={{ alignSelf: 'end', marginBottom: '20px' }}>
        <Button type="secondary" onClick={() => startJobs()}>
          Start all jobs
        </Button>
        <Button type="secondary" onClick={() => stopJobs()}>
          Stop all jobs
        </Button>
      </Flex>
      <StyledTable>
        <thead>
          <tr>
            <th>Job Name</th>
            <th>Latest Info</th>
            <th>CallBack URL </th>
            <th>Running Since </th>
            <th>Status </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => {
            return (
              <Fragment key={job.name}>
                <tr>
                  <td>{job.name}</td>
                  <td>
                    <div>
                      {job.lastEventFoundAt
                        ? new Date(job.lastEventFoundAt).toLocaleString()
                        : 'No events found'}
                    </div>
                  </td>
                  <td>{job.callBackURL}</td>
                  <td>
                    {job.startedTime
                      ? new Date(job.startedTime).toLocaleString()
                      : 'No events found'}
                  </td>
                  <td>
                    <Label
                      variant={
                        // eslint-disable-next-line no-nested-ternary
                        job.status === 'running'
                          ? 'success'
                          : job.status === 'error'
                          ? 'danger'
                          : 'warning'
                      }
                    >
                      {job.status}
                    </Label>
                  </td>
                </tr>
                <tr>
                  <td colSpan={5}>
                    <JobErrors jobName={job.name} />
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </StyledTable>
    </Container>
  );
};
