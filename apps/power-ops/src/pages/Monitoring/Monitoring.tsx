import { memo } from 'react';
import {
  AuthConsumer,
  AuthContext,
  useAuthContext,
} from '@cognite/react-container';
import { CogniteClient } from '@cognite/sdk';
import { useFetchSnifferJobs } from 'queries/useFetchSnifferJobs';
import { Flex, Label } from '@cognite/cogs.js';
import axios from 'axios';
import sidecar from 'utils/sidecar';

import { Container } from '../elements';

const MonitoringPage: React.FC = () => (
  <AuthConsumer>
    {({ client }: AuthContext) =>
      client ? <Monitoring client={client} /> : null
    }
  </AuthConsumer>
);

const Monitoring = ({ client }: { client: CogniteClient }) => {
  const { authState } = useAuthContext();
  const { snifferServiceBaseUrl } = sidecar;

  const { data, refetch } = useFetchSnifferJobs({
    client,
    token: authState?.token || '',
  });

  const startJobs = async () => {
    axios
      .get(`${snifferServiceBaseUrl}/${client.project}/jobs/start-all`, {
        headers: { Authorization: `Bearer ${authState?.token}` },
      })
      .then((_response) => {
        setTimeout(() => {
          refetch();
        }, 500);
      });
  };

  const stopJobs = async () => {
    axios
      .get(`${snifferServiceBaseUrl}/${client.project}/jobs/stop-all`, {
        headers: { Authorization: `Bearer ${authState?.token}` },
      })
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
        <button type="button" onClick={() => startJobs()}>
          Start all jobs
        </button>
        <button type="button" onClick={() => stopJobs()}>
          Stop all jobs
        </button>
      </Flex>
      <table style={{ textAlign: 'left', borderSpacing: '8px' }}>
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
          {data?.length &&
            data.map((job: any) => {
              return (
                <tr key={job.name}>
                  <td>{job.name}</td>
                  <td>
                    {job.lastEventFound
                      ? new Date(job.lastEventFound).toLocaleString()
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
              );
            })}
        </tbody>
      </table>
    </Container>
  );
};

export default memo(MonitoringPage);
