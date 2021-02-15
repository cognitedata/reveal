import { StatusRow, RunRow } from '../model/Runs';
import { Status } from '../model/Status';

const mapRuns = (response: StatusRow[] = []) => {
  const result: RunRow[] = [];
  response.forEach((item: StatusRow) => {
    const run: RunRow = {
      timestamp: item.createdTime,
      status: undefined,
      statusSeen: Status.OK,
      message: undefined,
      subRows: [],
    };
    const index = result.length;
    switch (item.status) {
      case 'success':
        run.status = Status.OK;
        result.push(run);
        break;
      case 'failure':
        run.status = Status.FAIL;
        run.message = item.message;
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
  return result;
};

export default mapRuns;
