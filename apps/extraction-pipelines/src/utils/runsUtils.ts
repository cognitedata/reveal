import { RunsAPIResponse, RunResponse, Status, RunRow } from '../model/Runs';

const mapRuns = (response: RunsAPIResponse) => {
  const result: RunRow[] = [];
  response.items.forEach((item: RunResponse) => {
    item.statuses.forEach((status: Status) => {
      const run: RunRow = {
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
