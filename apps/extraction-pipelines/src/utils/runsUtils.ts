import { RunResponse, StatusRow, RunRow } from '../model/Runs';
import { Status } from '../model/Status';

const mapRuns = (response: RunResponse[] = []) => {
  const result: RunRow[] = [];
  response.forEach((item: RunResponse) => {
    item.statuses.forEach((status: StatusRow) => {
      const run: RunRow = {
        timestamp: status.createdTime,
        status: undefined,
        statusSeen: Status.OK,
        subRows: [],
      };
      const index = result.length;
      switch (status.status) {
        case 'success':
          run.status = Status.OK;
          result.push(run);
          break;
        case 'failure':
          run.status = Status.FAIL;
          result.push(run);
          break;
        case 'seen':
          if (index === 0 || !result[index - 1].status) {
            result.push(run);
          } else {
            result[index - 1].subRows.push(run);
          }
          break;
      }
    });
  });
  return result;
};

export default mapRuns;
