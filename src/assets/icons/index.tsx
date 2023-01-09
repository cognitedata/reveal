import { default as ArrayIcon } from './ArrayIcon.svg';
import { default as DateIcon } from './DateIcon.svg';
import { default as KeyIcon } from './KeyIcon.svg';
import { default as NotAvailable } from './NotAvailable.svg';
import { default as ObjectIcon } from './ObjectIcon.svg';
import { default as UnknownPrimaryKeyIcon } from './UnknownPrimaryKeyIcon.svg';

const icons = {
  ArrayIcon,
  DateIcon,
  KeyIcon,
  NotAvailable,
  ObjectIcon,
  UnknownPrimaryKeyIcon,
};

export type IconType = keyof typeof icons;

export default icons;
