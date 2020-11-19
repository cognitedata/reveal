import {
  RunsAPIResponse,
  IntegrationProps,
  RunAPIProps,
  RunsProps,
} from '../model/Runs';

const mapRuns = (response: RunsAPIResponse) => {
  const result: RunsProps[] = [];
  response.items.forEach((item: IntegrationProps) => {
    item.statuses.forEach((status: RunAPIProps) => {
      const run: RunsProps = {
        timestamp: status.timestamp,
        status: '',
        statusSeen: 'OK',
        subRows: [],
      };
      let indexParentRun;

      switch (status.status) {
        case 'success':
          run.status = 'OK';
          result.push(run);
          break;
        case 'failure':
          run.status = 'FAIL';
          result.push(run);
          break;
        case 'seen':
          indexParentRun = result.length - 1;
          result[indexParentRun].subRows.push(run);
          break;
      }
    });
  });
  return result;
};

export default mapRuns;
