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
      let indexParentRun;

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
          if (
            result.length === 0 ||
            (result.length === 1 && !result[0].status)
          ) {
            result.push(run);
          } else {
            indexParentRun = result.length - 1;
            result[indexParentRun].subRows.push(run);
          }
          break;
      }
    });
  });
  return result;
};

export default mapRuns;
