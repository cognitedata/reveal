import { default as ArrayIcon } from './ArrayIcon.svg';
import { default as DocumentIcon } from './DocumentIcon.svg';
import { default as DocumentIconDisabled } from './DocumentIconDisabled.svg';
import { default as DocumentIconHover } from './DocumentIconHover.svg';
import { default as ExpandView } from './ExpandView.svg';
import { default as ExpandViewToggled } from './ExpandViewToggled.svg';
import { default as KeyIcon } from './KeyIcon.svg';
import { default as MinimizeView } from './MinimizeView.svg';
import { default as MinimizeViewToggled } from './MinimizeViewToggled.svg';
import { default as NotAvailableIcon } from './NotAvailable.svg';
import { default as ObjectIcon } from './ObjectIcon.svg';
import { default as SplitViewVertical } from './SplitViewVertical.svg';
import { default as SplitViewVerticalToggled } from './SplitViewVerticalToggled.svg';
import { default as UnknownPrimaryKeyIcon } from './UnknownPrimaryKeyIcon.svg';

const icons = {
  ArrayIcon,
  DocumentIcon,
  DocumentIconDisabled,
  DocumentIconHover,
  KeyIcon,
  UnknownPrimaryKeyIcon,
  NotAvailableIcon,
  ObjectIcon,
  MinimizeView,
  MinimizeViewToggled,
  SplitViewVertical,
  SplitViewVerticalToggled,
  ExpandView,
  ExpandViewToggled,
};

export type IconType = keyof typeof icons;

export default icons;
