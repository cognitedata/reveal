import { TranslationStatisticsObject } from '../typings/interfaces';

export const mockDataErrorsPsToOw = [
  {
    name: 'Connection Error',
    total_errors: 5,
  },
  {
    name: 'CDF Error',
    total_errors: 16,
  },
  {
    name: 'Missing Parameter',
    total_errors: 25,
  },
  {
    name: 'Invalid Parameter',
    total_errors: 36,
  },
];

export const mockDataErrorsOwToPs = [
  {
    name: 'Connection Error',
    total_errors: 33,
  },
  {
    name: 'CDF Error',
    total_errors: 25,
  },
  {
    name: 'Missing Parameter',
    total_errors: 35,
  },
  {
    name: 'Invalid Parameter',
    total_errors: 7,
  },
];

export const mockDataTranslationsStatsMonthly = (): TranslationStatisticsObject[] => {
  const data = [];
  const now = new Date();
  const nowMinusThirty = new Date(now.setDate(now.getDate() - 30));
  for (let i = new Date(); i >= nowMinusThirty; i.setDate(i.getDate() - 1)) {
    const minusOne = new Date(i);
    minusOne.setHours(12);
    minusOne.setMinutes(0);
    minusOne.setSeconds(0);
    const num = Math.floor(Math.random() * Math.floor(120));
    data.push({
      timestamp: minusOne.getTime(),
      total_objects: num,
      successful: Math.floor(Math.random() * Math.floor(num)),
    });
  }
  return data;
};

export const mockDataTranslationsStatsDaily = (): TranslationStatisticsObject[] => {
  const data = [];
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
    const num = Math.floor(Math.random() * Math.floor(14));
    data.push({
      timestamp: minusOne.getTime(),
      total_objects: num,
      successful: Math.floor(Math.random() * Math.floor(num)),
    });
  }
  return data;
};

export const mockDataTranslationsStatsHourly = (): TranslationStatisticsObject[] => {
  const data = [];
  const now = new Date();
  const nowMinusSixtyMinutes = new Date(now.setMinutes(now.getMinutes() - 59));
  for (
    let i = new Date();
    i >= nowMinusSixtyMinutes;
    i.setMinutes(i.getMinutes() - 1)
  ) {
    const minusOne = new Date(i);
    minusOne.setSeconds(0);
    const num = Math.floor(Math.random() * Math.floor(5));
    data.push({
      timestamp: minusOne.getTime(),
      total_objects: num,
      successful: Math.floor(Math.random() * Math.floor(num)),
    });
  }
  return data;
};
