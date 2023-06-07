import { formatDate, formatDateCustom, Icon, Tooltip } from '@cognite/cogs.js';

const ABSOLUTE_TIME_FORMAT = 'DD MMM YYYY HH:mm:ss';
const RELATIVE_TIME_THRESHOLD_IN_HOURS = 36;
const TOOLTIP_DELAY_IN_MS = 300;

type ThreeDTimestampProps = {
  absolute?: boolean;
  formatContent?: (timestamp: number) => string;
  formatTooltip?: (timestamp: number) => string;
  timestamp?: number;
};

export const formatTime = (timestamp: number, absolute?: boolean) => {
  const shouldUseAbsolute =
    absolute ||
    Math.abs((new Date().getTime() - timestamp) / 1000 / 60 / 60) >
      RELATIVE_TIME_THRESHOLD_IN_HOURS;

  return shouldUseAbsolute
    ? getAbsoluteTime(timestamp)
    : getRelativeTime(timestamp);
};

export const getRelativeTime = (timestamp: number) => {
  return formatDate(timestamp, true).toLowerCase();
};

export const getAbsoluteTime = (timestamp: number) => {
  return formatDateCustom(timestamp, ABSOLUTE_TIME_FORMAT);
};

export const getDetailedTime = (timestamp: number) => {
  return new Date(timestamp).toUTCString();
};

const ThreeDTimestamp = ({
  absolute,
  formatContent,
  formatTooltip,
  timestamp,
}: ThreeDTimestampProps): JSX.Element => {
  if (!timestamp) {
    return <Icon type="Remove" />;
  }

  return (
    <Tooltip
      content={
        formatTooltip ? formatTooltip(timestamp) : getDetailedTime(timestamp)
      }
      delay={TOOLTIP_DELAY_IN_MS}
    >
      <>
        {formatContent
          ? formatContent(timestamp)
          : formatTime(timestamp, absolute)}
      </>
    </Tooltip>
  );
};

export default ThreeDTimestamp;
