import { useAuthenticatedAuthContext } from '@cognite/react-container';
import { useMetrics } from '@cognite/metrics';
import { useFetchSnifferJobs } from 'queries/useFetchSnifferJobs';
import { Flex, Label, Button } from '@cognite/cogs.js';
import axios from 'axios';
import sidecar from 'utils/sidecar';
import { axiosRequestConfig } from 'utils/utils';

import { Container, StyledTable } from './elements';

export const Monitoring = () => {
  const metrics = useMetrics('monitoring');
  const { client, token } = useAuthenticatedAuthContext();
  const { snifferServiceBaseUrl } = sidecar;

  const { data, refetch } = useFetchSnifferJobs();

  const startJobs = async () => {
    metrics.track('click-start-all-jobs-button');
    axios
      .get(
        `${snifferServiceBaseUrl}/${client.project}/jobs/start-all`,
        axiosRequestConfig(token)
      )
      .then((_response) => {
        setTimeout(() => {
          refetch();
        }, 500);
      });
  };

  const stopJobs = async () => {
    metrics.track('click-stop-all-jobs-button');
    axios
      .get(
        `${snifferServiceBaseUrl}/${client.project}/jobs/stop-all`,
        axiosRequestConfig(token)
      )
      .then((_response) => {
        setTimeout(() => {
          refetch();
        }, 2000);
      });
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
            <th>Last Event found at</th>
            <th>CallBack URL </th>
            <th>Running Since </th>
            <th>Status </th>
          </tr>
        </thead>
        <tbody>
          {data?.map((job) => (
            <tr key={job.name}>
              <td>{job.name}</td>
              <td>
                {job.lastEventFoundAt
                  ? new Date(job.lastEventFoundAt).toLocaleString()
                  : 'No events found'}
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
          ))}
        </tbody>
      </StyledTable>
    </Container>
  );
};
