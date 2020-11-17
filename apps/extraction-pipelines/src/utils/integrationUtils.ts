import moment from 'moment';
import {
  LastStatuses,
  LatestStatusesDateTime,
  Status,
  StatusObj,
} from '../model/Status';

const mapToMoment = ({
  lastFailure,
  lastSuccess,
}: LastStatuses): Pick<
  LatestStatusesDateTime,
  'successDateTime' | 'failDateTime'
> => {
  return {
    successDateTime: lastSuccess === 0 ? null : moment(lastSuccess),
    failDateTime: lastFailure === 0 ? null : moment(lastFailure),
  };
};
export const calculateStatus = (status: LastStatuses): StatusObj => {
  return calculate(mapToMoment(status));
};

export const calculate = ({
  successDateTime,
  failDateTime,
}: LatestStatusesDateTime): StatusObj => {
  if (
    (!!successDateTime && failDateTime === null) ||
    (!!successDateTime && successDateTime.isAfter(failDateTime))
  ) {
    return {
      status: Status.OK,
      time: successDateTime,
    };
  }
  if (
    (!!failDateTime && successDateTime === null) ||
    (!!failDateTime && failDateTime.isAfter(successDateTime))
  ) {
    return {
      status: Status.FAIL,
      time: failDateTime,
    };
  }
  if (failDateTime && successDateTime && failDateTime.isSame(successDateTime)) {
    return {
      status: Status.FAIL,
      time: failDateTime,
    };
  }
  return {
    status: Status.NOT_ACTIVATED,
    time: null,
  };
};
