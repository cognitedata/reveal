import { useTranslation } from '@transformations/common';

const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = 60 * SECOND_IN_MS;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;

export const calcDuration = (
  milliseconds: number
): { h: number; m: number; s: number; ms: number } => {
  if (!Number.isFinite(milliseconds)) {
    return { h: 0, m: 0, s: 0, ms: 0 };
  }

  const h = Math.floor(milliseconds / HOUR_IN_MS);
  const m = Math.floor((milliseconds - h * HOUR_IN_MS) / MINUTE_IN_MS);
  const s = Math.floor(
    (milliseconds - h * HOUR_IN_MS - m * MINUTE_IN_MS) / SECOND_IN_MS
  );
  const ms = Math.floor(
    milliseconds - h * HOUR_IN_MS - m * MINUTE_IN_MS - s * SECOND_IN_MS
  );

  return { h, m, s, ms };
};

export const useDurationFormat = (milliseconds?: number) => {
  const { t } = useTranslation();

  if (!milliseconds) {
    return undefined;
  }

  const { h, m, s, ms } = calcDuration(milliseconds);

  if (milliseconds > HOUR_IN_MS) {
    return t('duration-hour', { h, m, s });
  }

  if (milliseconds > MINUTE_IN_MS) {
    return t('duration-sub-hour', { m, s });
  }

  if (milliseconds > SECOND_IN_MS) {
    return t('duration-sub-minute', { s });
  }

  return t('duration-sub-second', { ms });
};
