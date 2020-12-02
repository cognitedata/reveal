import { format } from 'date-fns';
import {
  GenericResponseObject,
  UNIX_TIMESTAMP_FACTOR,
} from '../../../typings/interfaces';

const getUniques = (all: string[]) => {
  return all.reduce((unique: string[], item) => {
    return unique.includes(item) ? unique : [...unique, item];
  }, []);
};

export const getMonthDates = (heartbeats: GenericResponseObject[]) => {
  const allDateBeats = heartbeats.map((beat) => {
    const beatDate = new Date(Number(beat) * UNIX_TIMESTAMP_FACTOR);
    beatDate.setHours(0);
    beatDate.setMinutes(0);
    beatDate.setSeconds(0);
    return format(beatDate, 'MM.dd');
  });
  const dateBeats = getUniques(allDateBeats);
  const dates = [];
  const now = new Date();
  const nowMinusThirty = new Date(now.setDate(now.getDate() - 30));
  for (let i = new Date(); i >= nowMinusThirty; i.setDate(i.getDate() - 1)) {
    const minusOne = new Date(i);
    minusOne.setHours(0);
    minusOne.setMinutes(0);
    minusOne.setSeconds(0);
    dates.push({
      date: format(minusOne, 'MM.dd'),
      isOn: dateBeats.find((el) => el === format(minusOne, 'MM.dd')),
    });
  }
  return dates;
};

export const getDayDates = (heartbeats: GenericResponseObject[]) => {
  const allDateBeats = heartbeats.map((beat) => {
    const beatDate = new Date(Number(beat) * UNIX_TIMESTAMP_FACTOR);
    beatDate.setMinutes(0);
    beatDate.setSeconds(0);
    return format(beatDate, 'HH');
  });
  const dateBeats = getUniques(allDateBeats);
  const hours = [];
  const now = new Date();
  const nowMinusTwentyThreeHours = new Date(now.setHours(now.getHours() - 23));
  for (
    let i = new Date();
    i >= nowMinusTwentyThreeHours;
    i.setHours(i.getHours() - 1)
  ) {
    const minusOne = new Date(i);
    minusOne.setMinutes(0);
    minusOne.setSeconds(0);
    hours.push({
      date: format(minusOne, 'HH:mm'),
      isOn: dateBeats.find((el) => el === format(minusOne, 'HH')),
    });
  }
  return hours;
};

export const getHourDates = (heartbeats: GenericResponseObject[]) => {
  const allDateBeats = heartbeats.map((beat) => {
    const beatDate = new Date(Number(beat) * UNIX_TIMESTAMP_FACTOR);
    beatDate.setSeconds(0);
    return format(beatDate, 'HH:mm');
  });
  const dateBeats = getUniques(allDateBeats);
  const minutes = [];
  const now = new Date();
  const nowMinusSixtyMinutes = new Date(now.setMinutes(now.getMinutes() - 59));
  for (
    let i = new Date();
    i >= nowMinusSixtyMinutes;
    i.setMinutes(i.getMinutes() - 1)
  ) {
    const minusOne = new Date(i);
    minusOne.setSeconds(0);
    minutes.push({
      date: format(minusOne, 'HH:mm'),
      isOn: dateBeats.find((el) => el === format(minusOne, 'HH:mm')),
    });
  }
  return minutes;
};
