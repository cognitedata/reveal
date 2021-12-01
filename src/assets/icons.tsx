import { default as BooleanIcon } from './BooleanIcon.svg';
import { default as DateIcon } from './DateIcon.svg';
import { default as DocumentIcon } from './DocumentIcon.svg';
import { default as DocumentIconHover } from './DocumentIconHover.svg';
import { default as EmptyStateArrowIcon } from './EmptyStateArrowIcon.svg';
import { default as KeyIcon } from './KeyIcon.svg';
import { default as NumberIcon } from './NumberIcon.svg';
import { default as StringIcon } from './StringIcon.svg';
import { default as UnknownPrimaryKeyIcon } from './UnknownPrimaryKeyIcon.svg';

const icons = {
  BooleanIcon,
  DateIcon,
  DocumentIcon,
  DocumentIconHover,
  EmptyStateArrowIcon,
  KeyIcon,
  NumberIcon,
  StringIcon,
  UnknownPrimaryKeyIcon,
};

export type IconType = keyof typeof icons;

export default icons;
