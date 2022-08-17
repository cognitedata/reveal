import { styleScope } from 'styles/styleScope';

export { styleScope } from 'styles/styleScope';

// Use this getContainer for all antd components such as: dropdown, tooltip, popover, modals etc
export const getContainer = () => {
  const els = document.getElementsByClassName(styleScope);
  const el = els.item(0)! as HTMLElement;
  return el;
};

const MINUTES_IN_HOUR = 60;
const MINUTES_IN_DAY = 24 * MINUTES_IN_HOUR;
export const timeUnitToMinutesMultiplier = {
  minutes: 1,
  hours: MINUTES_IN_HOUR,
  days: MINUTES_IN_DAY,
};

export const minutesToUnit = (
  minutes: number
): { unit: 'hours' | 'days' | 'minutes'; n: number } => {
  if (minutes === 0) return { n: 0, unit: 'hours' };
  if (minutes % MINUTES_IN_DAY === 0)
    return { n: minutes / MINUTES_IN_DAY, unit: 'days' };
  if (minutes % MINUTES_IN_HOUR === 0)
    return { n: minutes / MINUTES_IN_HOUR, unit: 'hours' };
  return { n: minutes, unit: 'minutes' };
};

export const isForbidden = (statusCode: number) => statusCode === 403;

export const MASTERING_MARKDOWN_LINK =
  'https://guides.github.com/features/mastering-markdown/';
