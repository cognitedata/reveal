/**
 * convert ms to display
 */
export default function convertMSToDisplay(milliseconds: number) {
  if (isNaN(milliseconds)) return '';
  let hour: number;
  let minute: number;
  let seconds: number;

  seconds = Math.floor(milliseconds / 1000);

  minute = Math.floor(seconds / 60);
  seconds %= 60;

  hour = Math.floor(minute / 60);
  minute %= 60;

  const day = Math.floor(hour / 24);
  hour %= 24;

  // 1d 4h 3m 4s
  return `${day}d ${hour}h ${minute}m ${seconds}s`;
}
