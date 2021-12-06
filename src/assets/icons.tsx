import { default as ArrayIcon } from './ArrayIcon.svg';
import { default as DateIcon } from './DateIcon.svg';
import { default as DocumentIcon } from './DocumentIcon.svg';
import { default as DocumentIconDisabled } from './DocumentIconDisabled.svg';
import { default as DocumentIconHover } from './DocumentIconHover.svg';
import { default as EmptyStateArrowIcon } from './EmptyStateArrowIcon.svg';
import { default as KeyIcon } from './KeyIcon.svg';
import { default as ObjectIcon } from './ObjectIcon.svg';
import { default as UnknownPrimaryKeyIcon } from './UnknownPrimaryKeyIcon.svg';

const icons = {
  ArrayIcon,
  DateIcon,
  DocumentIcon,
  DocumentIconDisabled,
  DocumentIconHover,
  EmptyStateArrowIcon,
  KeyIcon,
  ObjectIcon,
  UnknownPrimaryKeyIcon,
};

export type IconType = keyof typeof icons;

export default icons;
