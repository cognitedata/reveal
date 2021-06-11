import { RunUI } from 'model/Runs';
import moment from 'moment';
import {
  DATE_FORMAT_TYPE,
  DATE_HOUR_FORMAT_TYPE,
} from 'components/TimeDisplay/TimeDisplay';
import { RunStatusUI } from 'model/Status';

export type GroupByTimeFormat = DATE_FORMAT_TYPE | DATE_HOUR_FORMAT_TYPE;

interface GroupByParams {
  data: RunUI[];
  status?: RunStatusUI;
  by: GroupByTimeFormat;
}

export const creatTimeFormatterBy = (format: GroupByTimeFormat) => (
  milliseconds: number
) => moment(milliseconds).format(format);

type RunGroupedByDate = { [key in string]: RunUI[] };
export const groupRunsByDate = ({ data, by }: GroupByParams) => {
  const format = creatTimeFormatterBy(by);
  return data.reduce((acc, curr) => {
    const createdTimeGroupField = format(curr.createdTime);
    if (!acc[createdTimeGroupField]) {
      acc[createdTimeGroupField] = [];
    }
    acc[createdTimeGroupField] = [...acc[createdTimeGroupField], curr];
    return acc;
  }, {} as RunGroupedByDate);
};

export const getDatesForXAxis = (params: GroupByParams) => {
  const grouped = groupRunsByDate(params);
  return Object.keys(grouped);
};

const countStatusesByDate = (
  grouped: RunGroupedByDate,
  status?: RunStatusUI
) => {
  return Object.keys(grouped).map((key) => {
    return grouped[key].reduce((acc: number, curr: RunUI) => {
      if (curr.status === status) {
        return acc + 1;
      }
      return acc;
    }, 0);
  });
};

export const getStatusCountGroupedByDate = (params: GroupByParams) => {
  const grouped = groupRunsByDate(params);
  return countStatusesByDate(grouped, params.status);
};

export const mapDataForChart = (params: GroupByParams) => {
  const { data, by } = params;
  const allDates = getDatesForXAxis(params);
  const seenByDate = getStatusCountGroupedByDate({
    data,
    status: RunStatusUI.SEEN,
    by,
  });
  const successByDate = getStatusCountGroupedByDate({
    data,
    status: RunStatusUI.SUCCESS,
    by,
  });
  const failureByDate = getStatusCountGroupedByDate({
    data,
    status: RunStatusUI.FAILURE,
    by,
  });
  return {
    allDates,
    seenByDate,
    successByDate,
    failureByDate,
  };
};
