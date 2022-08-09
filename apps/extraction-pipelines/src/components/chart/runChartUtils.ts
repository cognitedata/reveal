import { RunUI } from 'model/Runs';
import moment from 'moment';
import { RunStatusUI } from 'model/Status';
import { DATE_FORMAT } from 'components/TimeDisplay/TimeDisplay';
import { Range } from '@cognite/cogs.js';

export const DATE_HOUR_FORMAT: Readonly<string> = 'YYYY-MM-DD HH';
export const DATE_HOUR_MIN_FORMAT: Readonly<string> = 'YYYY-MM-DD HH:mm';
export type AllDateFormats =
  | typeof DATE_FORMAT
  | typeof DATE_HOUR_FORMAT
  | typeof DATE_HOUR_MIN_FORMAT;
export type DateFormatRecordType = { label: string; format: AllDateFormats };
export const DateFormatsRecord: Record<AllDateFormats, DateFormatRecordType> = {
  DATE_FORMAT: { label: 'days', format: DATE_FORMAT },
  DATE_HOUR_FORMAT: { label: 'hours', format: DATE_HOUR_FORMAT },
  DATE_HOUR_MIN_FORMAT: { label: 'minutes', format: DATE_HOUR_MIN_FORMAT },
};

export const mapRangeToGraphTimeFormat = (range: Range) => {
  if (
    moment(range.startDate).isBetween(
      moment(range.endDate).subtract(24, 'hours'),
      moment(range.endDate)
    )
  ) {
    return DateFormatsRecord.DATE_HOUR_MIN_FORMAT;
  }
  if (
    moment(range.startDate).isBetween(
      moment(range.endDate).subtract(7, 'day'),
      moment(range.endDate)
    )
  ) {
    return DateFormatsRecord.DATE_HOUR_FORMAT;
  }
  return DateFormatsRecord.DATE_FORMAT;
};

interface GroupByParams {
  data: RunUI[];
  status?: RunStatusUI;
  by: AllDateFormats;
}

export const creatTimeFormatterBy =
  (format: AllDateFormats) => (milliseconds: number) =>
    moment(milliseconds).format(format);

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

export const getStatusCountAndTotalByDate = (
  params: GroupByParams
): number[][] => {
  const grouped = groupRunsByDate(params);
  return Object.keys(grouped)
    .map((key) => {
      return grouped[key].reduce(
        (
          acc: { success: number; failure: number; total: number },
          curr: RunUI
        ) => {
          if (curr.status === RunStatusUI.SUCCESS) {
            return { ...acc, success: acc.success + 1, total: acc.total + 1 };
          }
          if (curr.status === RunStatusUI.FAILURE) {
            return { ...acc, failure: acc.failure + 1, total: acc.total + 1 };
          }
          return acc;
        },
        { success: 0, failure: 0, total: 0 }
      );
    })
    .map(({ success, failure, total }) => {
      return [success, failure, total];
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
  const statusCountAndTotal = getStatusCountAndTotalByDate({
    data,
    by,
  });
  return {
    allDates,
    seenByDate,
    successByDate,
    failureByDate,
    statusCountAndTotal,
  };
};
