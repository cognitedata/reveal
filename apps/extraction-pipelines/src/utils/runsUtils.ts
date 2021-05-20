import moment, { Moment } from 'moment';
import { RunRow, StatusRow, StatusRun } from 'model/Runs';
import { Status } from 'model/Status';

export enum RunStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  SEEN = 'seen',
}

const STATUS_RUN_STATUS_MAP: Readonly<Map<Status, RunStatus>> = new Map<
  Status,
  RunStatus
>([
  [Status.OK, RunStatus.SUCCESS],
  [Status.FAIL, RunStatus.FAILURE],
  [Status.SEEN, RunStatus.SEEN],
]);

export const mapStatusRun = (status?: Status): RunStatus | undefined => {
  return status ? STATUS_RUN_STATUS_MAP.get(status) : undefined;
};

export const mapStatus = (apiStatus?: RunStatus | string): Status => {
  if (apiStatus?.toLowerCase() === RunStatus.SUCCESS) {
    return Status.OK;
  }
  if (apiStatus?.toLowerCase() === RunStatus.FAILURE) {
    return Status.FAIL;
  }
  if (apiStatus?.toLowerCase() === RunStatus.SEEN) {
    return Status.SEEN;
  }
  return Status.NOT_ACTIVATED;
};

export const filterRuns = (data?: StatusRow[]): StatusRun[] => {
  return data
    ? mapStatusRow(
        data.filter(({ status }) => {
          return status !== RunStatus.SEEN;
        })
      )
    : [];
};

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
      case RunStatus.SUCCESS:
        run.status = Status.OK;
        result.push(run);
        break;
      case RunStatus.FAILURE:
        run.status = Status.FAIL;
        run.message = item.message;
        result.push(run);
        break;
      case RunStatus.SEEN:
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

export const filterByStatus = (runStatus: Status) => {
  return ({ status }: StatusRun) => {
    return status === runStatus;
  };
};
export const and = <T>(
  predicate1: (value: T) => boolean,
  predicate2: (value: T) => boolean
) => {
  return (value: T) => {
    return predicate1(value) && predicate2(value);
  };
};

export const filterByTimeBetween = (startTime: Moment, endTime: Moment) => {
  return ({ createdTime }: Pick<StatusRun, 'createdTime'>) => {
    return moment(createdTime).isBetween(startTime, endTime);
  };
};
export const isWithinDaysInThePast = (days: number) =>
  filterByTimeBetween(moment().subtract(days, 'days'), moment());

export const mapStatusRow = (statusRow: StatusRow[]): StatusRun[] => {
  return statusRow.map((row) => ({ ...row, status: mapStatus(row.status) }));
};
export const filterRunsByStatus = (
  statusRow: StatusRun[],
  runStatus: Status
): StatusRun[] => {
  return statusRow.filter(filterByStatus(runStatus));
};
export const filterRunsByTime = (
  statusRow: StatusRun[],
  startTime: Moment,
  endTime: Moment
): StatusRun[] => {
  return statusRow.filter(filterByTimeBetween(startTime, endTime));
};

export default mapRuns;
