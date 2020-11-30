import { StatusRow, RunRow } from '../model/Runs';
import { Status } from '../model/Status';

const mapRuns = (response: StatusRow[]) => {
  const result: RunRow[] = [];
  response.forEach((status: StatusRow) => {
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
        indexParentRun = result.length - 1;
        result[indexParentRun].subRows.push(run);
        break;
    }
  });
  return result;
};

export default mapRuns;
